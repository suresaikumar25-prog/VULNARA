import { SchedulingService } from './schedulingService';
import { EmailService } from './emailService';
import { supabase } from './supabase';

export class SchedulerService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;
  
  // Start the scheduler service
  static start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log('Scheduler service is already running');
      return;
    }
    
    console.log(`🕐 Starting ThreatLens Scheduler Service (checking every ${intervalMinutes} minutes)`);
    this.isRunning = true;
    
    // Run immediately on start
    this.checkAndRunScheduledScans();
    
    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkAndRunScheduledScans();
    }, intervalMinutes * 60 * 1000);
  }
  
  // Stop the scheduler service
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 ThreatLens Scheduler Service stopped');
  }
  
  // Check for due scans and run them
  private static async checkAndRunScheduledScans() {
    try {
      console.log('🔍 Checking for scheduled scans...');
      
      const dueScans = await SchedulingService.getDueScans();
      
      if (dueScans.length === 0) {
        console.log('✅ No scheduled scans due at this time');
        return;
      }
      
      console.log(`📋 Found ${dueScans.length} scheduled scan(s) due for execution`);
      
      // Process each due scan
      for (const scan of dueScans) {
        await this.executeScheduledScan(scan);
      }
      
    } catch (error) {
      console.error('❌ Error checking scheduled scans:', error);
    }
  }
  
  // Execute a single scheduled scan
  private static async executeScheduledScan(scan: unknown) {
    try {
      console.log(`🚀 Executing scheduled scan: "${scan.name}" for ${scan.url}`);
      
      // Perform the actual scan by calling the scan API
      const scanResult = await this.performScan(scan.url);
      
      if (scanResult) {
        // Save scan result to database
        await this.saveScanResult(scan, scanResult);
        
        // Send email notification if enabled
        if (scan.email_notifications) {
          await this.sendEmailNotification(scan, scanResult);
        }
        
        // Update the scheduled scan record
        await SchedulingService.updateScanAfterRun(scan.id, true);
        
        console.log(`✅ Scheduled scan "${scan.name}" completed successfully`);
      } else {
        console.error(`❌ Scheduled scan "${scan.name}" failed`);
        await SchedulingService.updateScanAfterRun(scan.id, false);
      }
      
    } catch (error) {
      console.error(`❌ Error executing scheduled scan "${scan.name}":`, error);
      await SchedulingService.updateScanAfterRun(scan.id, false);
    }
  }
  
  // Perform the actual vulnerability scan
  private static async performScan(url: string): Promise<unknown> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error(`Scan API returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error performing scan:', error);
      return null;
    }
  }
  
  // Save scan result to database
  private static async saveScanResult(scan: unknown, scanResult: unknown) {
    try {
      if (!supabase) {
        console.error('❌ Supabase not configured');
        return;
      }
      
      const { data, error } = await supabase
        .from('scan_results')
        .insert([{
          user_id: scan.user_id,
          url: scan.url,
          timestamp: new Date().toISOString(),
          vulnerabilities: scanResult.vulnerabilities || [],
          summary: scanResult.summary || {},
          security_score: scanResult.securityScore || {},
          certificate_info: scanResult.certificateInfo || null,
          scheduled_scan_id: scan.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error saving scan result:', error);
      } else {
        console.log('📊 Scan result saved to database');
      }
    } catch (error) {
      console.error('Error saving scan result:', error);
    }
  }
  
  // Send email notification for completed scan
  private static async sendEmailNotification(scan: unknown, scanResult: unknown) {
    try {
      const userEmail = await SchedulingService.getUserEmail(scan.user_id);
      
      if (!userEmail) {
        console.error('Could not find user email for notifications');
        return;
      }
      
      const report = {
        url: scan.url,
        scanName: scan.name,
        timestamp: new Date().toISOString(),
        vulnerabilities: scanResult.vulnerabilities || [],
        summary: scanResult.summary || { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        securityScore: scanResult.securityScore || { score: 0, grade: 'F' },
        certificateInfo: scanResult.certificateInfo
      };
      
      const emailSent = await EmailService.sendScanReport(userEmail, report);
      
      if (emailSent) {
        console.log(`📧 Email report sent to ${userEmail}`);
      } else {
        console.error('Failed to send email report');
      }
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
  
  // Get scheduler status
  static getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.intervalId ? 'Running' : 'Stopped'
    };
  }
  
  // Manually trigger a check (useful for testing)
  static async triggerCheck() {
    console.log('🔄 Manually triggering scheduled scan check...');
    await this.checkAndRunScheduledScans();
  }
}
