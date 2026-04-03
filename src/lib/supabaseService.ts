import { supabase } from './supabase';

export class SupabaseService {
  // Save scan result to database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async saveScanResult(scanData: unknown) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, scan result not saved');
        return null;
      }

      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session — cannot save to DB');
        return null; // The UI should probably show a toast if this happens
      }

      // Use exact format requested by the user
      const { data, error } = await supabase
        .from('scan_results')
        .insert([{
          id: crypto.randomUUID(),
          user_id: session.user.id,  // from current auth session
          url: scanData.url,
          timestamp: new Date().toISOString(),
          vulnerabilities: {
            score: scanData.security_score?.score ?? 0,
            grade: scanData.security_score?.grade ?? 'N/A',
            assessment: scanData.security_score?.description ?? '',
            risks: scanData.vulnerabilities || [] // full array of { severity, title, description }
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error.message, error.details);
        return null;
      }
      console.log('✅ Scan result saved successfully');

      return data;
    } catch (error) {
      console.error('Error saving scan result:', error);
      return null;
    }
  }

  // Get scan results for a user
  static async getScanResults(userId: string, limit: number = 50) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning empty scan results');
        return [];
      }

      // Use Supabase Auth UID directly
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error fetching scan results:', error);
        // Return empty array if table doesn't exist or other non-critical errors
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('Database tables not yet created, returning empty history');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching scan results:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  // Get a specific scan result
  static async getScanResult(scanId: string, userId: string) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching scan result:', error);
      throw error;
    }
  }

  // Delete a scan result
  static async deleteScanResult(scanId: string, userId: string) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning false');
        return false;
      }

      const { error } = await supabase
        .from('scan_results')
        .delete()
        .eq('id', scanId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting scan result:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error.message, error.details);
        throw error;
      }
      console.log('✅ User profile updated successfully');
      return data;
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Create user profile (upsert - insert or update if exists)
  static async createUserProfile(userId: string, email: string, name?: string) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .upsert([{
          id: userId,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert/upsert error:', error.message, error.details);
        throw error;
      }
      console.log('✅ User profile created/synced successfully');
      return data;
    } catch (error: unknown) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning null');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
