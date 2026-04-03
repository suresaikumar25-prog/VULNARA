// Email service for sending scan reports
// Note: This is a basic implementation. In production, you would use a service like SendGrid, AWS SES, or similar.

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

export class EmailService {
  // Generate HTML email template for scan report
  private static generateEmailHTML(report: ScanReport): string {
    const severityColors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#059669'
    };

    const severityIcons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    const vulnerabilityRows = report.vulnerabilities.map(vuln => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: center;">
          <span style="color: ${severityColors[vuln.severity]}; font-weight: bold;">
            ${severityIcons[vuln.severity]} ${vuln.severity.toUpperCase()}
          </span>
        </td>
        <td style="padding: 12px; font-weight: 500;">${vuln.type}</td>
        <td style="padding: 12px;">${vuln.description}</td>
        <td style="padding: 12px; font-family: monospace; font-size: 12px; color: #6b7280;">${vuln.location}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ThreatLens Security Scan Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .summary-item { text-align: center; padding: 16px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
    .summary-item .number { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .summary-item .label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 500; }
    .score-section { text-align: center; margin: 24px 0; }
    .score-circle { display: inline-block; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: white; margin: 0 auto 12px; }
    .vulnerabilities-table { width: 100%; border-collapse: collapse; margin-top: 24px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .vulnerabilities-table th { background: #f8fafc; padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
    .vulnerabilities-table td { padding: 12px; vertical-align: top; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .scan-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .scan-info h3 { margin: 0 0 12px 0; color: #0369a1; font-size: 18px; }
    .scan-info p { margin: 4px 0; color: #0c4a6e; }
    .no-vulnerabilities { text-align: center; padding: 40px; color: #059669; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; }
    .no-vulnerabilities h3 { margin: 0 0 8px 0; font-size: 20px; }
    .no-vulnerabilities p { margin: 0; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ ThreatLens Security Report</h1>
      <p>Automated vulnerability scan results</p>
    </div>
    
    <div class="content">
      <div class="scan-info">
        <h3>📊 Scan Information</h3>
        <p><strong>Target URL:</strong> ${report.url}</p>
        <p><strong>Scan Name:</strong> ${report.scanName}</p>
        <p><strong>Scan Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
      </div>

      <div class="summary-card">
        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">📈 Vulnerability Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="number" style="color: #dc2626;">${report.summary.total}</div>
            <div class="label">Total Issues</div>
          </div>
          <div class="summary-item">
            <div class="number" style="color: #dc2626;">${report.summary.critical}</div>
            <div class="label">Critical</div>
          </div>
          <div class="summary-item">
            <div class="number" style="color: #ea580c;">${report.summary.high}</div>
            <div class="label">High</div>
          </div>
          <div class="summary-item">
            <div class="number" style="color: #d97706;">${report.summary.medium}</div>
            <div class="label">Medium</div>
          </div>
          <div class="summary-item">
            <div class="number" style="color: #059669;">${report.summary.low}</div>
            <div class="label">Low</div>
          </div>
        </div>
      </div>

      <div class="score-section">
        <h3 style="margin: 0 0 16px 0; color: #1f2937;">🏆 Security Score</h3>
        <div class="score-circle" style="background: ${this.getScoreColor(report.securityScore.score)};">
          ${report.securityScore.score}
        </div>
        <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Grade: ${report.securityScore.grade}</p>
      </div>

      ${report.vulnerabilities.length > 0 ? `
        <h3 style="color: #1f2937; margin: 32px 0 16px 0;">🔍 Detailed Vulnerabilities</h3>
        <table class="vulnerabilities-table">
          <thead>
            <tr>
              <th style="width: 100px;">Severity</th>
              <th style="width: 150px;">Type</th>
              <th>Description</th>
              <th style="width: 200px;">Location</th>
            </tr>
          </thead>
          <tbody>
            ${vulnerabilityRows}
          </tbody>
        </table>
      ` : `
        <div class="no-vulnerabilities">
          <h3>✅ No Vulnerabilities Found!</h3>
          <p>Great job! Your website appears to be secure.</p>
        </div>
      `}
    </div>

    <div class="footer">
      <p>This report was generated by <strong>ThreatLens</strong> - Your automated security scanning solution</p>
      <p>For more information, visit <a href="https://threatlens.app">threatlens.app</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Get color based on security score
  private static getScoreColor(score: number): string {
    if (score >= 90) return '#059669'; // Green
    if (score >= 70) return '#d97706'; // Yellow
    if (score >= 50) return '#ea580c'; // Orange
    return '#dc2626'; // Red
  }

  // Generate plain text email for scan report
  private static generateEmailText(report: ScanReport): string {
    let text = `ThreatLens Security Scan Report\n`;
    text += `================================\n\n`;
    text += `Target URL: ${report.url}\n`;
    text += `Scan Name: ${report.scanName}\n`;
    text += `Scan Date: ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    text += `Vulnerability Summary:\n`;
    text += `- Total Issues: ${report.summary.total}\n`;
    text += `- Critical: ${report.summary.critical}\n`;
    text += `- High: ${report.summary.high}\n`;
    text += `- Medium: ${report.summary.medium}\n`;
    text += `- Low: ${report.summary.low}\n\n`;
    
    text += `Security Score: ${report.securityScore.score}/100 (Grade: ${report.securityScore.grade})\n\n`;
    
    if (report.vulnerabilities.length > 0) {
      text += `Detailed Vulnerabilities:\n`;
      text += `========================\n\n`;
      
      report.vulnerabilities.forEach((vuln, index) => {
        text += `${index + 1}. ${vuln.type} [${vuln.severity.toUpperCase()}]\n`;
        text += `   Description: ${vuln.description}\n`;
        text += `   Location: ${vuln.location}\n\n`;
      });
    } else {
      text += `✅ No vulnerabilities found! Your website appears to be secure.\n\n`;
    }
    
    text += `This report was generated by ThreatLens - Your automated security scanning solution\n`;
    text += `For more information, visit: https://threatlens.app\n`;
    
    return text;
  }

  // Send email report using configured email service
  static async sendScanReport(email: string, report: ScanReport): Promise<boolean> {
    try {
      const htmlContent = this.generateEmailHTML(report);
      const textContent = this.generateEmailText(report);
      
      // Check if email service is configured
      const emailService = process.env.EMAIL_SERVICE || 'console';
      
      if (emailService === 'console') {
        // Log email content to console (development mode)
        console.log('📧 Email Report Generated:');
        console.log(`To: ${email}`);
        console.log(`Subject: ThreatLens Security Report - ${report.url}`);
        console.log(`Scan: ${report.scanName}`);
        console.log(`Vulnerabilities: ${report.summary.total} found`);
        console.log(`Security Score: ${report.securityScore.score}/100 (${report.securityScore.grade})`);
        console.log('📄 HTML Content Length:', htmlContent.length, 'characters');
        console.log('📄 Text Content Length:', textContent.length, 'characters');
        return true;
      }
      
      // SendGrid implementation
      if (emailService === 'sendgrid') {
        const { default: sgMail } = await import('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        
        const msg = {
          to: email,
          from: process.env.EMAIL_FROM || 'noreply@threatlens.app',
          subject: `ThreatLens Security Report - ${report.url}`,
          text: textContent,
          html: htmlContent,
        };
        
        await sgMail.send(msg);
        console.log('📧 Email sent via SendGrid to:', email);
        return true;
      }
      
      // Nodemailer SMTP implementation
      if (emailService === 'smtp') {
        const { default: nodemailer } = await import('nodemailer');
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@threatlens.app',
          to: email,
          subject: `ThreatLens Security Report - ${report.url}`,
          text: textContent,
          html: htmlContent,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('📧 Email sent via SMTP to:', email);
        return true;
      }
      
      // AWS SES implementation
      if (emailService === 'ses') {
        const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
        
        const sesClient = new SESClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        
        const command = new SendEmailCommand({
          Source: process.env.EMAIL_FROM || 'noreply@threatlens.app',
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Subject: {
              Data: `ThreatLens Security Report - ${report.url}`,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: htmlContent,
                Charset: 'UTF-8',
              },
              Text: {
                Data: textContent,
                Charset: 'UTF-8',
              },
            },
          },
        });
        
        await sesClient.send(command);
        console.log('📧 Email sent via AWS SES to:', email);
        return true;
      }
      
      console.error('❌ Unknown email service:', emailService);
      return false;
      
    } catch (error: unknown) {
      console.error('❌ Error sending email report:', error);
      return false;
    }
  }

  // Send notification email for scan completion
  static async sendScanNotification(email: string, scanName: string, url: string, hasVulnerabilities: boolean): Promise<boolean> {
    try {
      const subject = hasVulnerabilities 
        ? `⚠️ Security Issues Found - ${url}`
        : `✅ Security Scan Complete - ${url}`;
      
      const message = hasVulnerabilities
        ? `Your scheduled scan "${scanName}" has completed and found security issues that require attention.`
        : `Your scheduled scan "${scanName}" has completed successfully with no security issues found.`;
      
      console.log('📧 Scan Notification:');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      
      // In production, implement actual email sending here
      
      return true;
    } catch (error) {
      console.error('Error sending scan notification:', error);
      return false;
    }
  }
}
