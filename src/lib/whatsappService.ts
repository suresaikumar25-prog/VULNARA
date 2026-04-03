// WhatsApp service for sending scan reports
// Supports multiple WhatsApp providers: Twilio, WhatsApp Business API, and console logging

export interface ScanReport {
  url: string;
  scanName: string;
  timestamp: string;
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: {
    score: number;
    grade: string;
  };
  certificateInfo?: Record<string, unknown>;
}

export class WhatsAppService {
  // Generate WhatsApp message for scan report
  private static generateWhatsAppMessage(report: ScanReport): string {
    const severityEmojis = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    let message = `🛡️ *ThreatLens Security Report*\n\n`;
    message += `🌐 *Target:* ${report.url}\n`;
    message += `📊 *Scan:* ${report.scanName}\n`;
    message += `📅 *Date:* ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    message += `📈 *Security Summary:*\n`;
    message += `• Total Issues: *${report.summary.total}*\n`;
    message += `• Critical: *${report.summary.critical}* 🔴\n`;
    message += `• High: *${report.summary.high}* 🟠\n`;
    message += `• Medium: *${report.summary.medium}* 🟡\n`;
    message += `• Low: *${report.summary.low}* 🔵\n\n`;
    
    message += `🏆 *Security Score:* *${report.securityScore.score}/100* (${report.securityScore.grade})\n\n`;

    if (report.vulnerabilities.length > 0) {
      message += `🔍 *Vulnerabilities Found:*\n`;
      
      // Show top 5 vulnerabilities
      const topVulns = report.vulnerabilities.slice(0, 5);
      topVulns.forEach((vuln, index) => {
        message += `${index + 1}. ${severityEmojis[vuln.severity]} *${vuln.severity.toUpperCase()}* - ${vuln.type}\n`;
        message += `   📝 ${vuln.description}\n`;
        if (vuln.location) {
          message += `   📍 ${vuln.location}\n`;
        }
        message += `\n`;
      });
      
      if (report.vulnerabilities.length > 5) {
        message += `... and ${report.vulnerabilities.length - 5} more vulnerabilities\n\n`;
      }
    } else {
      message += `✅ *No vulnerabilities found!* Your website appears to be secure.\n\n`;
    }

    message += `📱 *Powered by ThreatLens*\n`;
    message += `For detailed reports, visit: https://threatlens.app`;

    return message;
  }

  // Generate short notification message
  private static generateNotificationMessage(scanName: string, url: string, hasVulnerabilities: boolean): string {
    const status = hasVulnerabilities ? '⚠️ Issues Found' : '✅ Scan Complete';
    const emoji = hasVulnerabilities ? '🔴' : '🟢';
    
    return `${emoji} *${status}*\n\n` +
           `📊 Scan: ${scanName}\n` +
           `🌐 URL: ${url}\n\n` +
           `${hasVulnerabilities ? 'Security issues require attention.' : 'No security issues found.'}\n\n` +
           `📱 ThreatLens Security Scanner`;
  }

  // Send WhatsApp message using configured service
  static async sendScanReport(phoneNumber: string, report: ScanReport, customMessage?: string): Promise<boolean> {
    try {
      const message = customMessage || this.generateWhatsAppMessage(report);
      
      // Check if WhatsApp service is configured
      const whatsappService = process.env.WHATSAPP_SERVICE || 'twilio';
      
      if (whatsappService === 'console') {
        // Log message to console (development mode)
        console.log('📱 WhatsApp Report Generated:');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message Length: ${message.length} characters`);
        console.log(`Scan: ${report.scanName}`);
        console.log(`Vulnerabilities: ${report.summary.total} found`);
        console.log(`Security Score: ${report.securityScore.score}/100 (${report.securityScore.grade})`);
        console.log('📄 Message Content:');
        console.log(message);
        return true;
      }
      
      // Twilio WhatsApp implementation
      if (whatsappService === 'twilio') {
        const { default: twilio } = await import('twilio');
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!
        );
        
        await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${phoneNumber}`,
          body: message
        });
        
        console.log('📱 WhatsApp message sent via Twilio to:', phoneNumber);
        return true;
      }
      
      // WhatsApp Business API implementation (Meta Cloud API)
      if (whatsappService === 'business') {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        
        if (!phoneNumberId || !accessToken) {
          throw new Error('WhatsApp Business API credentials not configured');
        }
        
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
              body: message
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`WhatsApp Business API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('📱 WhatsApp message sent via Meta Cloud API to:', phoneNumber);
        console.log('📱 Message ID:', result.messages?.[0]?.id);
        return true;
      }
      
      // WhatsApp Web API implementation (using puppeteer or similar)
      if (whatsappService === 'web') {
        // This would require a more complex implementation using puppeteer
        // or a WhatsApp Web automation library
        console.log('📱 WhatsApp Web API not implemented yet');
        console.log('Message would be sent to:', phoneNumber);
        console.log('Content:', message);
        return true;
      }
      
      console.error('❌ Unknown WhatsApp service:', whatsappService);
      return false;
      
    } catch (error: unknown) {
      console.error('❌ Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Send notification message for scan completion
  static async sendScanNotification(phoneNumber: string, scanName: string, url: string, hasVulnerabilities: boolean): Promise<boolean> {
    try {
      const message = this.generateNotificationMessage(scanName, url, hasVulnerabilities);
      
      const whatsappService = process.env.WHATSAPP_SERVICE || 'console';
      
      if (whatsappService === 'console') {
        console.log('📱 WhatsApp Notification:');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        return true;
      }
      
      // Use the same sending logic as scan reports
      return await this.sendScanReport(phoneNumber, {
        url,
        scanName,
        timestamp: new Date().toISOString(),
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        securityScore: { score: 100, grade: 'A' }
      });
      
    } catch (error: unknown) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string; error?: string } {
    try {
      // Remove all non-digit characters
      const cleaned = phoneNumber.replace(/\D/g, '');
      
      // Check if it's a valid length (7-15 digits)
      if (cleaned.length < 7 || cleaned.length > 15) {
        return {
          isValid: false,
          error: 'Phone number must be between 7 and 15 digits'
        };
      }
      
      // Format with country code if not present
      let formatted = cleaned;
      if (!cleaned.startsWith('1') && cleaned.length === 10) {
        // Assume US number if 10 digits
        formatted = '1' + cleaned;
      }
      
      return {
        isValid: true,
        formatted: formatted
      };
      
    } catch (error: unknown) {
      return {
        isValid: false,
        error: 'Invalid phone number format'
      };
    }
  }

  // Extract phone number from WhatsApp message
  static extractPhoneNumber(message: string): string | null {
    // Look for phone number patterns in the message
    const phonePatterns = [
      /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // US format
      /(\+?[1-9]\d{1,14})/g, // International format
      /(\d{10,15})/g // Simple digit sequence
    ];
    
    for (const pattern of phonePatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0].replace(/\D/g, ''); // Return only digits
      }
    }
    
    return null;
  }

  // Generate QR code for WhatsApp Web setup (if needed)
  static generateQRCode(): string {
    // This would generate a QR code for WhatsApp Web authentication
    // Implementation depends on the chosen WhatsApp service
    return 'QR code generation not implemented';
  }
}
