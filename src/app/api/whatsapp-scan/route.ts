import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppScanService } from '@/lib/whatsappScanService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message, messageId, timestamp } = body;
    
    if (!from || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: from, message' },
        { status: 400 }
      );
    }

    console.log('📱 Processing WhatsApp scan request from:', from);
    console.log('📱 Message:', message);
    console.log('📱 Message ID:', messageId);

    // Process the WhatsApp scan request
    const results = await WhatsAppScanService.processWhatsAppScanRequest({
      from,
      message,
      messageId: messageId || '',
      timestamp: timestamp || new Date().toISOString()
    });

    console.log('📊 WhatsApp scan results:', results);

    // Send WhatsApp report
    const whatsappSent = await WhatsAppScanService.sendWhatsAppReport(
      from,
      results,
      messageId
    );

    if (!whatsappSent) {
      console.error('❌ Failed to send WhatsApp report');
      return NextResponse.json(
        { error: 'Failed to send WhatsApp report' },
        { status: 500 }
      );
    }

    console.log('✅ WhatsApp report sent successfully');

    return NextResponse.json({
      success: true,
      message: 'WhatsApp scan completed and report sent',
      results: {
        totalUrls: results.length,
        validUrls: results.filter(r => r.isValid).length,
        invalidUrls: results.filter(r => !r.isValid).length
      }
    });

  } catch (error) {
    console.error('❌ WhatsApp scan error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process WhatsApp scan request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'WhatsApp Scan API',
    timestamp: new Date().toISOString(),
    endpoints: {
      scan: 'POST /api/whatsapp-scan',
      webhook: 'POST /api/whatsapp-webhook'
    }
  });
}
