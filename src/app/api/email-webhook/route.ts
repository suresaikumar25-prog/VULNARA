import { NextRequest, NextResponse } from 'next/server';
import { EmailScanService } from '@/lib/emailScanService';

// This endpoint would be called by your email service provider
// (SendGrid, AWS SES, Gmail API, etc.) when a new email is received
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract email data (format depends on your email service provider)
    const emailData = extractEmailData(body);
    
    if (!emailData) {
      return NextResponse.json(
        { error: 'Invalid email data format' },
        { status: 400 }
      );
    }

    console.log('📧 Received email webhook:', emailData.from);

    // Process the email scan request
    const results = await EmailScanService.processEmailScanRequest(emailData);

    // Send email report
    const emailSent = await EmailScanService.sendEmailReport(
      emailData.from,
      results,
      emailData.messageId
    );

    if (!emailSent) {
      console.error('❌ Failed to send email report');
      return NextResponse.json(
        { error: 'Failed to send email report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email processed and report sent'
    });

  } catch (error) {
    console.error('❌ Email webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process email webhook' },
      { status: 500 }
    );
  }
}

// Extract email data from webhook payload
// This function needs to be customized based on your email service provider
function extractEmailData(webhookBody: any): {
  from: string;
  subject: string;
  body: string;
  messageId: string;
} | null {
  try {
    // Example for SendGrid webhook format
    if (webhookBody.from && webhookBody.text) {
      return {
        from: webhookBody.from,
        subject: webhookBody.subject || '',
        body: webhookBody.text || webhookBody.html || '',
        messageId: webhookBody.message_id || ''
      };
    }

    // Example for AWS SES webhook format
    if (webhookBody.mail && webhookBody.content) {
      return {
        from: webhookBody.mail.source,
        subject: webhookBody.mail.commonHeaders?.subject || '',
        body: webhookBody.content || '',
        messageId: webhookBody.mail.messageId || ''
      };
    }

    // Example for Gmail API webhook format
    if (webhookBody.emailAddress && webhookBody.historyId) {
      // This would require additional processing to fetch the actual email content
      // from Gmail API using the historyId
      return null; // Placeholder - needs Gmail API integration
    }

    // Generic format
    if (webhookBody.from && webhookBody.body) {
      return {
        from: webhookBody.from,
        subject: webhookBody.subject || '',
        body: webhookBody.body,
        messageId: webhookBody.messageId || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting email data:', error);
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
}
