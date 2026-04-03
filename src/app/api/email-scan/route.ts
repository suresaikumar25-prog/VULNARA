import { NextRequest, NextResponse } from 'next/server';
import { EmailScanService } from '@/lib/emailScanService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, subject, body: emailBody, messageId } = body;
    
    if (!from || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: from, body' },
        { status: 400 }
      );
    }

    console.log('📧 Processing email scan request from:', from);
    console.log('📧 Subject:', subject);
    console.log('📧 Message ID:', messageId);

    // Process the email scan request
    const results = await EmailScanService.processEmailScanRequest({
      from,
      subject: subject || '',
      body: emailBody,
      messageId: messageId || ''
    });

    console.log('📊 Email scan results:', results);

    // Send email report
    const emailSent = await EmailScanService.sendEmailReport(
      from,
      results,
      messageId
    );

    if (!emailSent) {
      console.error('❌ Failed to send email report');
      return NextResponse.json(
        { error: 'Failed to send email report' },
        { status: 500 }
      );
    }

    console.log('✅ Email report sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Email scan completed and report sent',
      results: {
        totalUrls: results.length,
        validUrls: results.filter(r => r.isValid).length,
        invalidUrls: results.filter(r => !r.isValid).length
      }
    });

  } catch (error) {
    console.error('❌ Email scan error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process email scan request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email scan service is running',
    timestamp: new Date().toISOString()
  });
}
