import { supabase } from './supabase';

export interface ScheduledScan {
  id: string;
  user_id: string;
  url: string;
  name: string;
  schedule_type: 'random' | 'weekly' | 'monthly';
  schedule_config: {
    // For random: { minIntervalHours: number, maxIntervalHours: number }
    // For weekly: { dayOfWeek: number, hour: number, minute: number }
    // For monthly: { dayOfMonth: number, hour: number, minute: number }
    [key: string]: unknown;
  };
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  total_runs: number;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledScanRequest {
  url: string;
  name: string;
  schedule_type: 'random' | 'weekly' | 'monthly';
  schedule_config: Record<string, unknown>;
  email_notifications?: boolean;
}

export class SchedulingService {
  // Create a new scheduled scan
  static async createScheduledScan(_userId: string, scanData: CreateScheduledScanRequest): Promise<ScheduledScan | null> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session — cannot save to DB');
        return null;
      }

      const nextRun = this.calculateNextRun(scanData.schedule_type, scanData.schedule_config);

      const { data, error } = await supabase
        .from('scheduled_scans')
        .insert([{
          id: crypto.randomUUID(), // explicit id
          user_id: session.user.id, // from session
          url: scanData.url,
          name: scanData.name,
          schedule_type: scanData.schedule_type,
          schedule_config: scanData.schedule_config,
          next_run: nextRun,
          email_notifications: scanData.email_notifications ?? true,
          is_active: true,
          total_runs: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error.message, error.details);
        return null;
      }
      console.log('✅ Scheduled scan created successfully');

      return data;
    } catch (error: unknown) {
      console.error('Error creating scheduled scan:', error);
      return null;
    }
  }

  // Get all scheduled scans for a user
  static async getScheduledScans(userId: string): Promise<ScheduledScan[]> {
    try {
      const formattedUserId = userId;
      
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('user_id', formattedUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scheduled scans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled scans:', error);
      return [];
    }
  }

  // Update a scheduled scan
  static async updateScheduledScan(scanId: string, userId: string, updates: Partial<CreateScheduledScanRequest>): Promise<ScheduledScan | null> {
    try {
      const formattedUserId = userId;
      
      const updateData: Record<string, unknown> = { ...updates };
      
      // Recalculate next run if schedule config changed
      if (updates.schedule_type || updates.schedule_config) {
        updateData.next_run = this.calculateNextRun(
          updates.schedule_type || 'random',
          updates.schedule_config || {}
        );
      }

      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data, error } = await supabase
        .from('scheduled_scans')
        .update(updateData)
        .eq('id', scanId)
        .eq('user_id', formattedUserId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error.message, error.details);
        return null;
      }
      console.log('✅ Scheduled scan updated successfully');

      return data;
    } catch (error: unknown) {
      console.error('Error updating scheduled scan:', error);
      return null;
    }
  }

  // Delete a scheduled scan
  static async deleteScheduledScan(scanId: string, userId: string): Promise<boolean> {
    try {
      const formattedUserId = userId;
      
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { error } = await supabase
        .from('scheduled_scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', formattedUserId);

      if (error) {
        console.error('❌ Supabase delete error:', error.message, error.details);
        return false;
      }
      console.log('✅ Scheduled scan deleted successfully');

      return true;
    } catch (error: unknown) {
      console.error('Error deleting scheduled scan:', error);
      return false;
    }
  }

  // Toggle active status of a scheduled scan
  static async toggleScheduledScan(scanId: string, userId: string): Promise<ScheduledScan | null> {
    try {
      const formattedUserId = userId;
      // First get the current status
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data: currentScan, error: fetchError } = await supabase
        .from('scheduled_scans')
        .select('is_active')
        .eq('id', scanId)
        .eq('user_id', formattedUserId)
        .single();

      if (fetchError || !currentScan) {
        console.error('Error fetching scheduled scan:', fetchError);
        return null;
      }

      const newStatus = !currentScan.is_active;
      const updateData: Record<string, unknown> = { is_active: newStatus };

      // If activating, recalculate next run
      if (newStatus) {
        if (!supabase) {
          throw new Error('Database not configured');
        }
        
        const { data: scanData, error: scanError } = await supabase
          .from('scheduled_scans')
          .select('schedule_type, schedule_config')
          .eq('id', scanId)
          .eq('user_id', formattedUserId)
          .single();

        if (scanData && !scanError) {
          updateData.next_run = this.calculateNextRun(scanData.schedule_type, scanData.schedule_config);
        }
      }

      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data, error } = await supabase
        .from('scheduled_scans')
        .update(updateData)
        .eq('id', scanId)
        .eq('user_id', formattedUserId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase toggle error:', error.message, error.details);
        return null;
      }
      console.log('✅ Scheduled scan status toggled successfully');

      return data;
    } catch (error: unknown) {
      console.error('Error toggling scheduled scan:', error);
      return null;
    }
  }

  // Get scans that are due to run
  static async getDueScans(): Promise<ScheduledScan[]> {
    try {
      const now = new Date().toISOString();
      
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('is_active', true)
        .lte('next_run', now);

      if (error) {
        console.error('Error fetching due scans:', error);
        return [];
      }

      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching due scans:', error);
      return [];
    }
  }

  // Update scan after it has been executed
  static async updateScanAfterRun(scanId: string, _success: boolean): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Get the scan to recalculate next run
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data: scan, error: fetchError } = await supabase
        .from('scheduled_scans')
        .select('schedule_type, schedule_config, total_runs')
        .eq('id', scanId)
        .single();

      if (fetchError || !scan) {
        console.error('Error fetching scan for update:', fetchError);
        return;
      }

      const nextRun = this.calculateNextRun(scan.schedule_type, scan.schedule_config);
      
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { error } = await supabase
        .from('scheduled_scans')
        .update({
          last_run: now,
          next_run: nextRun,
          total_runs: scan.total_runs + 1
        })
        .eq('id', scanId);

      if (error) {
        console.error('Error updating scan after run:', error);
      }
    } catch (error: unknown) {
      console.error('Error updating scan after run:', error);
    }
  }

  // Calculate next run time based on schedule type and config
  private static calculateNextRun(scheduleType: string, config: Record<string, unknown>): string {
    const now = new Date();
    
    switch (scheduleType) {
      case 'random':
        const minHours = (config.minIntervalHours as number) || 24;
        const maxHours = (config.maxIntervalHours as number) || 168; // 7 days max
        const randomHours = Math.random() * (maxHours - minHours) + minHours;
        const nextRun = new Date(now.getTime() + (randomHours * 60 * 60 * 1000));
        return nextRun.toISOString();

      case 'weekly':
        const dayOfWeek = (config.dayOfWeek as number) || 1; // Monday
        const hour = (config.hour as number) || 9;
        const minute = (config.minute as number) || 0;
        
        const nextWeekly = new Date(now);
        const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
        nextWeekly.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
        nextWeekly.setHours(hour, minute, 0, 0);
        
        return nextWeekly.toISOString();

      case 'monthly':
        const dayOfMonth = (config.dayOfMonth as number) || 1;
        const monthlyHour = (config.hour as number) || 9;
        const monthlyMinute = (config.minute as number) || 0;
        
        const nextMonthly = new Date(now);
        nextMonthly.setMonth(now.getMonth() + 1);
        nextMonthly.setDate(dayOfMonth);
        nextMonthly.setHours(monthlyHour, monthlyMinute, 0, 0);
        
        return nextMonthly.toISOString();

      default:
        // Default to 24 hours from now
        const defaultNext = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        return defaultNext.toISOString();
    }
  }

  // Get user email for notifications
  static async getUserEmail(userId: string): Promise<string | null> {
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user email:', error);
        return null;
      }

      return data?.email || null;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return null;
    }
  }
}
