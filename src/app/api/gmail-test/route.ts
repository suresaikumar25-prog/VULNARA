import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Simulate email processing for testing
    const testEmails = [
      {
        from: 'test@example.com',
        subject: 'Test scan request',
        body: 'Please scan https://httpbin.org for security issues',
        id: 'test-1'
      },
      {
        from: 'user2@example.com', 
        subject: 'Multiple URLs',
        body: 'Scan these sites: https://example.com and https://github.com',
        id: 'test-2'
      }
    ];

    console.log('📧 Processing test emails...');

    for (const email of testEmails) {
      console.log(`📧 Processing: ${email.from}`);
      console.log(`📧 Subject: ${email.subject}`);
      console.log(`📧 Body: ${email.body}`);
      
      // Extract URLs
      const urls = email.body.match(/(https?:\/\/[^\s]+)/gi) || [];
      console.log(`🔍 Found URLs: ${urls.join(', ')}`);
      
      // Simulate scan results
      const mockResults = urls.map(url => ({
        url,
        isValid: true,
        scanResult: {
          securityScore: { score: 85, grade: 'B+', color: 'green' },
          vulnerabilities: [
            { type: 'Missing Security Headers', severity: 'medium' },
            { type: 'HTTPS Redirect', severity: 'low' }
          ]
        }
      }));

      console.log(`✅ Generated report for ${email.from}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Test email processing completed',
      emailsProcessed: testEmails.length,
      note: 'This is a test mode. For real Gmail integration, complete OAuth verification.'
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Gmail test endpoint ready',
    instructions: 'Send POST request to test email processing without OAuth'
  });
}
