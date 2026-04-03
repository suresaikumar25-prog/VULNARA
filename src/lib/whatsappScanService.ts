import { WhatsAppService } from './whatsappService';
import { WhatsAppTemplates } from './whatsappTemplates';

export interface WhatsAppScanRequest {
  from: string; // Phone number
  message: string;
  messageId: string;
  timestamp?: string;
}

export interface WhatsAppScanResult {
  url: string;
  isValid: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scanResult?: any;
  error?: string;
}

export class WhatsAppScanService {
  // Extract URLs from WhatsApp message
  static extractUrls(text: string): string[] {
    console.log('🔍 WhatsApp URL Extraction Debug:');
    console.log('  Input text:', text);
    
    const urls: string[] = [];
    
    // 1. Find URLs with protocols (https:// or http://)
    const protocolMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
    urls.push(...protocolMatches);
    
    // 2. Find domain-like patterns (www.domain.com, domain.com, etc.)
    const domainMatches = text.match(/\b(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?/gi) || [];
    urls.push(...domainMatches);
    
    // 3. Look for specific domain mentions
    const domainMentions = text.match(/\b(amazon\.com|google\.com|facebook\.com|microsoft\.com|apple\.com|github\.com|stackoverflow\.com|example\.com|test\.com|kalasalingam\.ac\.in|klu\.ac\.in)\b/gi) || [];
    urls.push(...domainMentions);
    
    console.log('  Protocol URLs found:', protocolMatches);
    console.log('  Domain URLs found:', domainMatches);
    console.log('  All URLs before processing:', urls);
    
    // Clean up and process URLs
    const processedUrls = urls
      .map(url => {
        // Remove trailing punctuation and emojis
        url = url.replace(/[.,;:!?]+$/, '');
        url = url.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
        
        // Add https:// if no protocol is present
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        return url;
      })
      .filter(url => {
        // Filter out common WhatsApp artifacts and invalid URLs
        if (url.includes(']')) return false;
        if (url.includes('cdn.useblocks.io')) return false;
        if (url.includes('emailclick') || url.includes('emailopen')) return false;
        if (url.includes('emailunsubscribe')) return false;
        if (url.includes('ablink.lifecycle')) return false;
        if (url.includes('ls/click')) return false;
        if (url.includes('upn=')) return false;
        if (url.includes('media-assets')) return false;
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif')) return false;
        if (url.includes('.css') || url.includes('fonts.css')) return false;
        if (url.includes('client-data.knak.io')) return false;
        if (url.includes('w3.org')) return false;
        if (url.includes('xhtml')) return false;
        if (url.includes('DTD')) return false;
        if (url.includes('awstrack.me')) return false;
        if (url.includes('email.awscloud.com')) return false;
        if (url.includes('MTEyLVRaTS03NjYAAAGdaxeY5')) return false;
        if (url.includes('dc/KwqiTCOQ16Q1JCi3MdelD')) return false;
        if (url.includes('tracking') || url.includes('analytics')) return false;
        if (url.includes('utm_') || url.includes('utm_source')) return false;
        if (url.includes('clickid') || url.includes('click_id')) return false;
        if (url.includes('ref=') || url.includes('referrer')) return false;
        if (url.length < 10) return false;
        if (url.includes(' ')) return false;
        if (url.length > 200) return false;
        
        // Only allow URLs that look like actual websites
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];
        if (!domain.includes('.')) return false;
        if (domain.includes('localhost') || domain.includes('127.0.0.1')) return false;
        if (domain.includes('email.awscloud.com')) return false;
        if (domain.includes('awstrack.me')) return false;
        
        // Must be a valid domain format
        const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
        return domainPattern.test(domain);
      });
    
    console.log('  Final processed URLs:', processedUrls);
    return processedUrls;
  }

  // Validate if URL is scannable
  static async validateUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const urlObj = new URL(url);
      
      // Check if protocol is http or https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'URL must use HTTP or HTTPS protocol'
        };
      }
      
      // Check if hostname is valid
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return {
          isValid: false,
          error: 'Invalid hostname'
        };
      }
      
      // Check for localhost and test domains
      const invalidPatterns = [
        /^localhost$/i,
        /^127\.0\.0\.1$/,
        /^0\.0\.0\.0$/,
        /^::1$/,
        /^0:0:0:0:0:0:0:1$/
      ];
      
      if (invalidPatterns.some(pattern => pattern.test(urlObj.hostname))) {
        return {
          isValid: false,
          error: 'Please enter a valid website URL (not localhost)'
        };
      }
      
      return {
        isValid: true,
        error: undefined
      };
      
    } catch (_error: unknown) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  // Perform security scan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async performScan(url: string): Promise<unknown> {
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
    } catch (error: unknown) {
      throw new Error(`Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process WhatsApp scan request
  static async processWhatsAppScanRequest(whatsappRequest: WhatsAppScanRequest): Promise<WhatsAppScanResult[]> {
    const urls = this.extractUrls(whatsappRequest.message);
    const results: WhatsAppScanResult[] = [];

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
      } catch (error: unknown) {
        results.push({
          url,
          isValid: false,
          error: error instanceof Error ? error.message : 'Scan failed'
        });
      }
    }

    return results;
  }

  // Generate WhatsApp message report
  static generateWhatsAppReport(results: WhatsAppScanResult[]): { message: string } {
    const _hasValidUrls = results.some(r => r.isValid);
    
    if (results.length === 0) {
      return {
        message: `🔍 *Security Scan Report*\n\n` +
                `⚠️ *No URLs Found*\n` +
                `No valid URLs were found in your message. Please send a URL (starting with http:// or https://) to scan.\n\n` +
                `📱 *How to Use:*\n` +
                `Send any URL to this WhatsApp number and I'll scan it for security vulnerabilities!\n\n` +
                `🛡️ *Powered by ThreatLens*`
      };
    }

    let message = `🔍 *Security Scan Report*\n\n`;
    message += `📊 *Summary:* ${results.filter(r => r.isValid).length}/${results.length} URLs analyzed\n\n`;

    results.forEach((result, _index) => {
      if (result.isValid && result.scanResult) {
        const scan = result.scanResult;
        const score = scan.securityScore;
        const vulnerabilities = scan.vulnerabilities || [];
        
        message += `🌐 *${result.url}*\n`;
        message += `🏆 Score: *${score.score}/100* (${score.grade})\n`;
        message += `🔍 Vulnerabilities: *${vulnerabilities.length}*\n`;
        message += `📝 ${score.description}\n\n`;
        
        if (vulnerabilities.length > 0) {
          message += `🔍 *Top Issues:*\n`;
          const topVulns = vulnerabilities.slice(0, 3);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          topVulns.forEach((vuln: unknown, vulnIndex: number) => {
            const severityEmojis = {
              critical: '🔴',
              high: '🟠',
              medium: '🟡',
              low: '🔵'
            };
            const severityEmoji = severityEmojis[vuln.severity as keyof typeof severityEmojis] || '⚪';
            
            message += `${vulnIndex + 1}. ${severityEmoji} *${vuln.severity.toUpperCase()}* - ${vuln.type}\n`;
            message += `   ${vuln.description}\n`;
          });
          
          if (vulnerabilities.length > 3) {
            message += `   ... and ${vulnerabilities.length - 3} more issues\n`;
          }
          message += `\n`;
        } else {
          message += `✅ *No vulnerabilities found!*\n\n`;
        }
      } else {
        message += `❌ *${result.url}*\n`;
        message += `Error: ${result.error || 'Unable to scan this URL'}\n\n`;
      }
    });

    message += `📱 *How to Use:*\n`;
    message += `Send any URL to this WhatsApp number and I'll scan it for security vulnerabilities!\n\n`;
    message += `🛡️ *Powered by ThreatLens*\n`;
    message += `For detailed reports: https://threatlens.app`;

    return { message };
  }

  // Send WhatsApp report
  static async sendWhatsAppReport(
    to: string, 
    results: WhatsAppScanResult[], 
    _originalMessageId?: string
  ): Promise<boolean> {
    try {
      const _report = this.generateWhatsAppReport(results);
      
      // Validate phone number
      const phoneValidation = WhatsAppService.validatePhoneNumber(to);
      if (!phoneValidation.isValid) {
        console.error('❌ Invalid phone number:', phoneValidation.error);
        return false;
      }
      
      // Send the message
      const success = await WhatsAppService.sendScanReport(phoneValidation.formatted!, {
        url: results.find(r => r.isValid)?.url || 'Multiple URLs',
        scanName: 'WhatsApp Scan',
        timestamp: new Date().toISOString(),
        vulnerabilities: results.flatMap(r => r.scanResult?.vulnerabilities || []),
        summary: {
          total: results.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.length || 0), 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          critical: results.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.filter((v: unknown) => v.severity === 'critical').length || 0), 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          high: results.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.filter((v: unknown) => v.severity === 'high').length || 0), 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medium: results.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.filter((v: unknown) => v.severity === 'medium').length || 0), 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          low: results.reduce((sum, r) => sum + (r.scanResult?.vulnerabilities?.filter((v: unknown) => v.severity === 'low').length || 0), 0)
        },
        securityScore: {
          score: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.scanResult?.securityScore?.score || 0), 0) / results.length) : 100,
          grade: results.length > 0 ? results[0].scanResult?.securityScore?.grade || 'A' : 'A'
        }
      });
      
      if (success) {
        console.log('📱 WhatsApp report sent successfully to:', to);
      }
      
      return success;
    } catch (error: unknown) {
      console.error('Error sending WhatsApp report:', error);
      return false;
    }
  }

  // Handle incoming WhatsApp message
  static async handleIncomingMessage(whatsappRequest: WhatsAppScanRequest): Promise<boolean> {
    try {
      console.log('📱 Processing WhatsApp message from:', whatsappRequest.from);
      console.log('📱 Message:', whatsappRequest.message);
      
      const message = whatsappRequest.message.toLowerCase().trim();
      
      // Handle special commands
      if (message === 'help' || message === '/help') {
        return await this.sendCommandResponse(whatsappRequest.from, WhatsAppTemplates.getHelpMessage());
      }
      
      if (message === 'status' || message === '/status') {
        return await this.sendCommandResponse(whatsappRequest.from, WhatsAppTemplates.getStatusMessage());
      }
      
      if (message === 'info' || message === '/info') {
        return await this.sendCommandResponse(whatsappRequest.from, WhatsAppTemplates.getAboutMessage());
      }
      
      if (message === 'details' || message === '/details') {
        return await this.sendCommandResponse(whatsappRequest.from, 'Details command not implemented yet. Send a URL to scan!');
      }
      
      // Check if message contains URLs
      const urls = this.extractUrls(whatsappRequest.message);
      if (urls.length === 0) {
        return await this.sendCommandResponse(whatsappRequest.from, WhatsAppTemplates.getNoUrlsMessage());
      }
      
      // Validate each URL before processing
      const validUrls: string[] = [];
      const invalidUrls: string[] = [];
      
      for (const url of urls) {
        const validation = await this.validateUrl(url);
        if (validation.isValid) {
          validUrls.push(url);
        } else {
          invalidUrls.push(url);
        }
      }
      
      // Send immediate response for invalid URLs
      if (invalidUrls.length > 0) {
        const invalidMessage = `❌ *Invalid URLs Found*\n\n` +
          `The following URLs are not valid:\n` +
          invalidUrls.map(url => `• ${url}`).join('\n') + `\n\n` +
          `*Please check the URLs and try again.*\n\n` +
          `✅ *Valid URLs will be scanned automatically.*`;
        
        await this.sendCommandResponse(whatsappRequest.from, invalidMessage);
      }
      
      // Process only valid URLs
      if (validUrls.length === 0) {
        return true; // Already sent invalid URL message
      }
      
      // Create new request with only valid URLs
      const validRequest = {
        ...whatsappRequest,
        message: validUrls.join(' ')
      };
      
      // Process the scan request
      const results = await this.processWhatsAppScanRequest(validRequest);
      
      // Send the report
      const success = await this.sendWhatsAppReport(whatsappRequest.from, results, whatsappRequest.messageId);
      
      return success;
    } catch (error: unknown) {
      console.error('❌ Error handling WhatsApp message:', error);
      const errorMessage = WhatsAppTemplates.getErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      await this.sendCommandResponse(whatsappRequest.from, errorMessage);
      return false;
    }
  }

  // Send command response
  private static async sendCommandResponse(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const phoneValidation = WhatsAppService.validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        console.error('❌ Invalid phone number:', phoneValidation.error);
        return false;
      }
      
      // Send the message using WhatsApp service
      const success = await WhatsAppService.sendScanReport(phoneValidation.formatted!, {
        url: 'Command Response',
        scanName: 'WhatsApp Command',
        timestamp: new Date().toISOString(),
        vulnerabilities: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        securityScore: { score: 100, grade: 'A' }
      }, message);
      
      if (success) {
        console.log('📱 Command response sent to:', phoneNumber);
      }
      
      return success;
    } catch (error: unknown) {
      console.error('Error sending command response:', error);
      return false;
    }
  }
}
