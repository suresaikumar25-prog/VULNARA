// WhatsApp message templates for different scan results and scenarios

export interface ScanResult {
  url: string;
  isValid: boolean;
  scanResult?: {
    securityScore: {
      score: number;
      grade: string;
      color: string;
      description: string;
    };
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location?: string;
    }>;
  };
  error?: string;
}

export class WhatsAppTemplates {
  // Welcome message for new users
  static getWelcomeMessage(): string {
    return `🛡️ *Welcome to ThreatLens Security Scanner!*\n\n` +
           `I can help you scan websites for security vulnerabilities.\n\n` +
           `📱 *How to use:*\n` +
           `• Send me any URL to scan\n` +
           `• I'll analyze it for security issues\n` +
           `• Get detailed reports instantly\n\n` +
           `*Examples:*\n` +
           `• \`https://example.com\`\n` +
           `• \`Scan https://mysite.com\`\n` +
           `• \`Check security of https://test.com\`\n\n` +
           `🔍 *Ready to scan!* Send me a URL to get started.`;
  }

  // Help message
  static getHelpMessage(): string {
    return `📚 *ThreatLens Help*\n\n` +
           `*Available Commands:*\n` +
           `• \`help\` - Show this help message\n` +
           `• \`status\` - Check service status\n` +
           `• \`scan <url>\` - Scan a website\n` +
           `• \`info\` - About ThreatLens\n\n` +
           `*How to scan:*\n` +
           `Just send me any URL and I'll scan it automatically!\n\n` +
           `*Supported formats:*\n` +
           `• \`https://example.com\`\n` +
           `• \`http://test.com\`\n` +
           `• \`www.mysite.com\`\n\n` +
           `🛡️ *Powered by ThreatLens*`;
  }

  // Service status message
  static getStatusMessage(): string {
    return `📊 *ThreatLens Status*\n\n` +
           `🟢 *Service:* Online\n` +
           `🟢 *Scanner:* Active\n` +
           `🟢 *API:* Responding\n\n` +
           `*Last Updated:* ${new Date().toLocaleString()}\n\n` +
           `Ready to scan your websites! 🚀`;
  }

  // About message
  static getAboutMessage(): string {
    return `🛡️ *About ThreatLens*\n\n` +
           `ThreatLens is an automated security scanner that helps you identify vulnerabilities in websites.\n\n` +
           `*Features:*\n` +
           `• 🔍 Comprehensive security scanning\n` +
           `• 🚨 Real-time vulnerability detection\n` +
           `• 📊 Detailed security reports\n` +
           `• 🎯 Multiple scan types\n` +
           `• 📱 WhatsApp integration\n\n` +
           `*Website:* https://threatlens.app\n` +
           `*Support:* Contact us for help\n\n` +
           `*Version:* 1.0.0\n` +
           `*Last Updated:* ${new Date().toLocaleDateString()}`;
  }

  // No URLs found message
  static getNoUrlsMessage(): string {
    return `⚠️ *No URLs Found*\n\n` +
           `I couldn't find any valid URLs in your message.\n\n` +
           `*Please send a URL in one of these formats:*\n` +
           `• \`https://example.com\`\n` +
           `• \`http://test.com\`\n` +
           `• \`www.mysite.com\`\n\n` +
           `*Or try:*\n` +
           `• \`Scan https://example.com\`\n` +
           `• \`Check https://test.com\`\n\n` +
           `🔍 *Ready to scan!*`;
  }

  // Error message
  static getErrorMessage(error: string): string {
    return `❌ *Error Occurred*\n\n` +
           `Sorry, something went wrong while processing your request.\n\n` +
           `*Error:* ${error}\n\n` +
           `*Please try:*\n` +
           `• Sending a valid URL\n` +
           `• Checking your internet connection\n` +
           `• Trying again in a few minutes\n\n` +
           `If the problem persists, contact support.`;
  }

  // Scan in progress message
  static getScanningMessage(url: string): string {
    return `🔍 *Scanning in Progress*\n\n` +
           `*URL:* ${url}\n` +
           `*Status:* Analyzing security...\n\n` +
           `⏳ Please wait while I scan the website for vulnerabilities.\n\n` +
           `This may take a few moments...`;
  }

  // Single URL scan result
  static getSingleScanResult(result: ScanResult): string {
    if (!result.isValid || !result.scanResult) {
      return `❌ *Scan Failed*\n\n` +
             `*URL:* ${result.url}\n` +
             `*Error:* ${result.error || 'Unable to scan this URL'}\n\n` +
             `Please check the URL and try again.`;
    }

    const scan = result.scanResult;
    const score = scan.securityScore;
    const vulnerabilities = scan.vulnerabilities || [];
    
    const severityEmojis = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    let message = `🔍 *Security Scan Complete*\n\n`;
    message += `🌐 *URL:* ${result.url}\n`;
    message += `🏆 *Security Score:* *${score.score}/100* (${score.grade})\n`;
    message += `📊 *Vulnerabilities:* *${vulnerabilities.length}*\n\n`;
    message += `📝 *Summary:* ${score.description}\n\n`;

    if (vulnerabilities.length > 0) {
      message += `🚨 *Issues Found:*\n`;
      
      // Group by severity
      const critical = vulnerabilities.filter(v => v.severity === 'critical');
      const high = vulnerabilities.filter(v => v.severity === 'high');
      const medium = vulnerabilities.filter(v => v.severity === 'medium');
      const low = vulnerabilities.filter(v => v.severity === 'low');
      
      if (critical.length > 0) {
        message += `\n🔴 *Critical (${critical.length}):*\n`;
        critical.slice(0, 3).forEach((vuln, i) => {
          message += `${i + 1}. ${vuln.type}\n`;
          message += `   ${vuln.description}\n`;
        });
        if (critical.length > 3) {
          message += `   ... and ${critical.length - 3} more\n`;
        }
      }
      
      if (high.length > 0) {
        message += `\n🟠 *High (${high.length}):*\n`;
        high.slice(0, 3).forEach((vuln, i) => {
          message += `${i + 1}. ${vuln.type}\n`;
          message += `   ${vuln.description}\n`;
        });
        if (high.length > 3) {
          message += `   ... and ${high.length - 3} more\n`;
        }
      }
      
      if (medium.length > 0) {
        message += `\n🟡 *Medium (${medium.length}):*\n`;
        medium.slice(0, 2).forEach((vuln, i) => {
          message += `${i + 1}. ${vuln.type}\n`;
        });
        if (medium.length > 2) {
          message += `   ... and ${medium.length - 2} more\n`;
        }
      }
      
      if (low.length > 0) {
        message += `\n🔵 *Low (${low.length}):*\n`;
        message += `   ${low.length} low severity issues found\n`;
      }
    } else {
      message += `✅ *No vulnerabilities found!*\n`;
      message += `Your website appears to be secure. 🎉\n`;
    }

    message += `\n🛡️ *Powered by ThreatLens*\n`;
    message += `For detailed reports: https://threatlens.app`;

    return message;
  }

  // Multiple URLs scan result
  static getMultipleScanResults(results: ScanResult[]): string {
    const validResults = results.filter(r => r.isValid && r.scanResult);
    const invalidResults = results.filter(r => !r.isValid);
    
    let message = `🔍 *Multi-URL Scan Complete*\n\n`;
    message += `📊 *Summary:* ${validResults.length}/${results.length} URLs analyzed\n\n`;

    if (validResults.length > 0) {
      message += `✅ *Successful Scans:*\n`;
      validResults.forEach((result, index) => {
        const scan = result.scanResult!;
        const score = scan.securityScore;
        const vulnCount = scan.vulnerabilities?.length || 0;
        
        message += `\n${index + 1}. *${result.url}*\n`;
        message += `   Score: *${score.score}/100* (${score.grade})\n`;
        message += `   Issues: *${vulnCount}*\n`;
      });
    }

    if (invalidResults.length > 0) {
      message += `\n❌ *Failed Scans:*\n`;
      invalidResults.forEach((result, index) => {
        message += `\n${index + 1}. *${result.url}*\n`;
        message += `   Error: ${result.error}\n`;
      });
    }

    message += `\n🛡️ *Powered by ThreatLens*`;

    return message;
  }

  // Quick scan summary
  static getQuickSummary(results: ScanResult[]): string {
    const validResults = results.filter(r => r.isValid && r.scanResult);
    const totalVulns = validResults.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.length || 0), 0);
    const avgScore = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + (r.scanResult?.securityScore?.score || 0), 0) / validResults.length)
      : 0;

    return `📊 *Quick Summary*\n\n` +
           `🌐 *URLs Scanned:* ${validResults.length}\n` +
           `🏆 *Average Score:* ${avgScore}/100\n` +
           `🚨 *Total Issues:* ${totalVulns}\n\n` +
           `Send \`details\` for full report or scan another URL!`;
  }

  // Rate limit message
  static getRateLimitMessage(): string {
    return `⏰ *Rate Limit Reached*\n\n` +
           `You've reached the maximum number of scans per minute.\n\n` +
           `*Please wait 60 seconds before scanning again.*\n\n` +
           `This helps us maintain service quality for all users.`;
  }

  // Maintenance message
  static getMaintenanceMessage(): string {
    return `🔧 *Service Maintenance*\n\n` +
           `ThreatLens is currently undergoing maintenance.\n\n` +
           `*Expected downtime:* 15-30 minutes\n` +
           `*Status:* Back online soon\n\n` +
           `We apologize for any inconvenience.`;
  }

  // Command not recognized
  static getUnknownCommandMessage(command: string): string {
    return `❓ *Unknown Command*\n\n` +
           `I didn't recognize: \`${command}\`\n\n` +
           `*Available commands:*\n` +
           `• \`help\` - Show help\n` +
           `• \`status\` - Check status\n` +
           `• \`scan <url>\` - Scan URL\n` +
           `• \`info\` - About ThreatLens\n\n` +
           `Or just send me a URL to scan!`;
  }
}
