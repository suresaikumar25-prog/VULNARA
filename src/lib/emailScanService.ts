import { EmailService } from './emailService';

export interface EmailScanRequest {
  from: string;
  subject: string;
  body: string;
  messageId: string;
}

export interface EmailScanResult {
  url: string;
  isValid: boolean;
  scanResult?: any;
  error?: string;
}

export class EmailScanService {
  // Extract URLs from email content
  static extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlRegex) || [];
    
    // Clean up URLs and filter out invalid ones
    return urls
      .map(url => url.replace(/[.,;:!?]+$/, '')) // Remove trailing punctuation
      .filter(url => {
        // Filter out tracking URLs and malformed URLs
        if (url.includes(']')) return false; // Malformed URLs with brackets
        if (url.includes('cdn.useblocks.io')) return false; // Image tracking URLs
        if (url.includes('emailclick') || url.includes('emailopen')) return false; // Email tracking
        if (url.includes('emailunsubscribe')) return false; // Unsubscribe tracking
        if (url.includes('ablink.lifecycle')) return false; // Quizlet tracking URLs
        if (url.includes('ls/click')) return false; // Link tracking
        if (url.includes('upn=')) return false; // User tracking parameters
        if (url.includes('media-assets')) return false; // Image assets
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif')) return false; // Image files
        if (url.includes('.css') || url.includes('fonts.css')) return false; // CSS files
        if (url.includes('client-data.knak.io')) return false; // Font/CSS assets
        if (url.includes('w3.org')) return false; // HTML doctype URLs
        if (url.includes('xhtml')) return false; // HTML doctype URLs
        if (url.includes('DTD')) return false; // HTML doctype URLs
        if (url.includes('awstrack.me')) return false; // AWS tracking URLs
        if (url.length < 10) return false; // Too short to be valid
        if (url.includes(' ')) return false; // Contains spaces (malformed)
        if (url.length > 200) return false; // Too long (likely tracking URLs)
        
        // Only allow URLs that look like actual websites
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];
        if (domain.includes('.')) return true; // Has a domain
        
        return false;
      });
  }

  // Validate if URL is scannable
  static async validateUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const response = await fetch('http://localhost:3000/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      return {
        isValid: result.isValid && result.isLive,
        error: result.error
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to validate URL'
      };
    }
  }

  // Perform security scan
  static async performScan(url: string): Promise<any> {
    try {
      const response = await fetch('http://localhost:3000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process email scan request
  static async processEmailScanRequest(emailRequest: EmailScanRequest): Promise<EmailScanResult[]> {
    const urls = this.extractUrls(emailRequest.body);
    const results: EmailScanResult[] = [];

    // Limit to first 3 URLs for faster processing
    const urlsToProcess = urls.slice(0, 3);
    console.log(`🔍 Processing ${urlsToProcess.length} URLs (limited from ${urls.length} total)`);

    for (const url of urlsToProcess) {
      try {
        // Validate URL
        const validation = await this.validateUrl(url);
        
        if (!validation.isValid) {
          results.push({
            url,
            isValid: false,
            error: validation.error || 'Invalid URL'
          });
          continue;
        }

        // Perform scan
        const scanResult = await this.performScan(url);
        
        results.push({
          url,
          isValid: true,
          scanResult
        });
      } catch (error) {
        results.push({
          url,
          isValid: false,
          error: error instanceof Error ? error.message : 'Scan failed'
        });
      }
    }

    return results;
  }

  // Generate email report
  static generateEmailReport(results: EmailScanResult[]): { subject: string; html: string; text: string } {
    const hasValidUrls = results.some(r => r.isValid);
    const subject = hasValidUrls 
      ? `Security Scan Report - ${results.filter(r => r.isValid).length} URL(s) Analyzed`
      : 'Security Scan Report - No Valid URLs Found';

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          🔒 Security Scan Report
        </h2>
    `;

    let text = `Security Scan Report\n\n`;

    if (results.length === 0) {
      html += `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0;">⚠️ No URLs Found</h3>
          <p style="color: #92400e; margin: 10px 0 0 0;">No valid URLs were found in your email. Please include a URL (starting with http:// or https://) in your message.</p>
        </div>
      `;
      text += `No URLs Found\nNo valid URLs were found in your email. Please include a URL (starting with http:// or https://) in your message.\n`;
    } else {
      results.forEach((result, index) => {
        if (result.isValid && result.scanResult) {
          const scan = result.scanResult;
          const score = scan.securityScore;
          const vulnerabilities = scan.vulnerabilities || [];
          
          html += `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">🌐 ${result.url}</h3>
              <div style="display: flex; gap: 20px; margin: 15px 0;">
                <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px; flex: 1;">
                  <div style="font-size: 24px; font-weight: bold; color: ${score.color === 'red' ? '#dc2626' : score.color === 'yellow' ? '#d97706' : '#059669'};">
                    ${score.score}/100
                  </div>
                  <div style="font-size: 14px; color: #6b7280;">Security Score</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px; flex: 1;">
                  <div style="font-size: 24px; font-weight: bold; color: #1f2937;">
                    ${vulnerabilities.length}
                  </div>
                  <div style="font-size: 14px; color: #6b7280;">Vulnerabilities</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px; flex: 1;">
                  <div style="font-size: 24px; font-weight: bold; color: ${score.color === 'red' ? '#dc2626' : score.color === 'yellow' ? '#d97706' : '#059669'};">
                    ${score.grade}
                  </div>
                  <div style="font-size: 14px; color: #6b7280;">Grade</div>
                </div>
              </div>
              <p style="color: #6b7280; margin: 10px 0;">${score.description}</p>
          `;

          if (vulnerabilities.length > 0) {
            html += `
              <h4 style="color: #1f2937; margin: 20px 0 10px 0;">🔍 Vulnerabilities Found:</h4>
              <ul style="margin: 0; padding-left: 20px;">
            `;
            
            vulnerabilities.slice(0, 5).forEach((vuln: any) => {
              const severityColors = {
                critical: '#dc2626',
                high: '#ea580c',
                medium: '#d97706',
                low: '#059669'
              };
              const severityColor = severityColors[vuln.severity as keyof typeof severityColors] || '#6b7280';
              
              html += `
                <li style="margin: 5px 0; color: #1f2937;">
                  <span style="color: ${severityColor}; font-weight: bold;">${vuln.severity.toUpperCase()}</span>: ${vuln.type}
                  <br><small style="color: #6b7280;">${vuln.description}</small>
                </li>
              `;
            });
            
            if (vulnerabilities.length > 5) {
              html += `<li style="color: #6b7280; font-style: italic;">... and ${vulnerabilities.length - 5} more vulnerabilities</li>`;
            }
            
            html += `</ul>`;
          }
          
          html += `</div>`;
          
          text += `\n${result.url}\n`;
          text += `Security Score: ${score.score}/100 (${score.grade})\n`;
          text += `Vulnerabilities: ${vulnerabilities.length}\n`;
          text += `${score.description}\n`;
          
          if (vulnerabilities.length > 0) {
            text += `\nVulnerabilities Found:\n`;
            vulnerabilities.slice(0, 5).forEach((vuln: any) => {
              text += `- ${vuln.severity.toUpperCase()}: ${vuln.type}\n`;
            });
            if (vulnerabilities.length > 5) {
              text += `- ... and ${vulnerabilities.length - 5} more vulnerabilities\n`;
            }
          }
        } else {
          html += `
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin: 0;">❌ ${result.url}</h3>
              <p style="color: #dc2626; margin: 10px 0 0 0;">${result.error || 'Unable to scan this URL'}</p>
            </div>
          `;
          text += `\n${result.url}\nError: ${result.error || 'Unable to scan this URL'}\n`;
        }
      });
    }

    html += `
        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #1e40af;">
          <h4 style="color: #1e40af; margin: 0 0 10px 0;">📧 How to Use Email Scanning</h4>
          <p style="color: #475569; margin: 0; line-height: 1.6;">
            Send an email to this address with any URL you want to scan. Our system will automatically analyze the security of the website and send you a detailed report.
          </p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Powered by ThreatLens Security Scanner</p>
        </div>
      </div>
    `;

    text += `\n\nHow to Use Email Scanning:\n`;
    text += `Send an email to this address with any URL you want to scan. Our system will automatically analyze the security of the website and send you a detailed report.\n\n`;
    text += `Powered by ThreatLens Security Scanner`;

    return { subject, html, text };
  }

  // Send email report
  static async sendEmailReport(
    to: string, 
    results: EmailScanResult[], 
    originalMessageId?: string
  ): Promise<boolean> {
    try {
      const report = this.generateEmailReport(results);
      
      // For now, just log the email content (in production, use actual email service)
      console.log('📧 Email Report Generated:');
      console.log('To:', to);
      console.log('Subject:', report.subject);
      console.log('HTML Content Length:', report.html.length);
      console.log('Text Content Length:', report.text.length);
      
      return true;
    } catch (error) {
      console.error('Error sending email report:', error);
      return false;
    }
  }
}
