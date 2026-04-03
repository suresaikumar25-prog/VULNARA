import { NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmailService';
import { EmailScanService } from '@/lib/emailScanService';

export async function POST() {
  try {
    const gmailService = new GmailService();
    const emails = await gmailService.getUnreadEmails();
    
    console.log(`📧 Found ${emails.length} unread emails`);

    for (const email of emails) {
      try {
        console.log(`📧 Processing email from: ${email.from}`);
        console.log(`📧 Subject: ${email.subject}`);
        console.log(`📧 Body preview: ${email.body.substring(0, 100)}...`);
        
        // Extract URLs
        const urls = EmailScanService.extractUrls(email.body);
        console.log(`🔍 Found ${urls.length} URLs: ${urls.join(', ')}`);
        
        if (urls.length === 0) {
          console.log('❌ No URLs found in email from:', email.from);
          await gmailService.markAsRead(email.id);
          continue;
        }

        // Skip complex LinkedIn URLs for faster processing
        if (email.from.includes('linkedin.com') && urls.length > 3) {
          console.log('⏭️ Skipping complex LinkedIn email for faster processing');
          await gmailService.markAsRead(email.id);
          continue;
        }

        console.log(`🔍 Processing email from ${email.from} with ${urls.length} URLs`);

        // Process scan with shorter timeout for faster email replies
        const results = await Promise.race([
          EmailScanService.processEmailScanRequest({
            from: email.from,
            subject: email.subject,
            body: email.body,
            messageId: email.id
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Scan timeout')), 15000)
          )
        ]);

        // Generate report
        const report = EmailScanService.generateEmailReport(results as any);

        // Send reply
        console.log(`📤 Sending reply to: ${email.from}`);
        const replySent = await gmailService.sendReply(email.from, email.subject, report.html);
        
        if (replySent) {
          console.log(`✅ Reply sent successfully to: ${email.from}`);
        } else {
          console.log(`❌ Failed to send reply to: ${email.from}`);
        }

        // Mark as read
        await gmailService.markAsRead(email.id);

        console.log(`✅ Processed email from: ${email.from}`);

      } catch (error) {
        console.error('Error processing email:', error);
        // Mark as read even if there was an error
        try {
          await gmailService.markAsRead(email.id);
        } catch (markError) {
          console.error('Error marking email as read:', markError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${emails.length} emails`,
      emailsProcessed: emails.length
    });

  } catch (error) {
    console.error('Gmail processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process Gmail emails' },
      { status: 500 }
    );
  }
}
