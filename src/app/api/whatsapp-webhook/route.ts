import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppScanService } from '@/lib/whatsappScanService';
import crypto from 'crypto';

// This endpoint would be called by your WhatsApp service provider
// (Twilio, WhatsApp Business API, etc.) when a new message is received
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature for Meta Cloud API
    if (process.env.WHATSAPP_SERVICE === 'business') {
      const signature = request.headers.get('x-hub-signature-256');
      if (signature && !verifyWebhookSignature(signature, JSON.stringify(body))) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }
    
    // Extract WhatsApp message data (format depends on your WhatsApp service provider)
    const whatsappData = extractWhatsAppData(body);
    
    if (!whatsappData) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp message data format' },
        { status: 400 }
      );
    }

    console.log('📱 Received WhatsApp webhook from:', whatsappData.from);
    console.log('📱 Message:', whatsappData.message);

    // Process the WhatsApp scan request
    const success = await WhatsAppScanService.handleIncomingMessage(whatsappData);

    if (!success) {
      console.error('❌ Failed to process WhatsApp message');
      return NextResponse.json(
        { error: 'Failed to process WhatsApp message' },
        { status: 500 }
      );
    }

    console.log('✅ WhatsApp message processed successfully');
    return NextResponse.json({
      success: true,
      message: 'WhatsApp message processed and report sent'
    });

  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process WhatsApp webhook' },
      { status: 500 }
    );
  }
}

// Extract WhatsApp message data from webhook payload
// This function needs to be customized based on your WhatsApp service provider
function extractWhatsAppData(webhookBody: unknown): {
  from: string;
  message: string;
  messageId: string;
  timestamp?: string;
} | null {
  
  // Twilio WhatsApp format
  if (webhookBody.MessageSid && webhookBody.From && webhookBody.Body) {
    return {
      from: webhookBody.From.replace('whatsapp:', ''),
      message: webhookBody.Body,
      messageId: webhookBody.MessageSid,
      timestamp: webhookBody.DateCreated
    };
  }
  
  // WhatsApp Business API format (Meta Cloud API)
  if (webhookBody.entry && webhookBody.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
    const message = webhookBody.entry[0].changes[0].value.messages[0];
    const contact = webhookBody.entry[0].changes[0].value.contacts?.[0];
    
    // Handle different message types
    let messageText = '';
    if (message.text?.body) {
      messageText = message.text.body;
    } else if (message.interactive?.button_reply?.title) {
      messageText = message.interactive.button_reply.title;
    } else if (message.interactive?.list_reply?.title) {
      messageText = message.interactive.list_reply.title;
    } else {
      messageText = '[Unsupported message type]';
    }
    
    return {
      from: message.from,
      message: messageText,
      messageId: message.id,
      timestamp: message.timestamp ? new Date(parseInt(message.timestamp) * 1000).toISOString() : undefined
    };
  }
  
  // Generic format for testing
  if (webhookBody.from && webhookBody.message) {
    return {
      from: webhookBody.from,
      message: webhookBody.message,
      messageId: webhookBody.messageId || Date.now().toString(),
      timestamp: webhookBody.timestamp
    };
  }
  
  console.error('❌ Unknown WhatsApp webhook format:', JSON.stringify(webhookBody, null, 2));
  return null;
}

// Webhook verification for WhatsApp Business API
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('📱 WhatsApp webhook verified');
    return new NextResponse(challenge);
  }
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Verify webhook signature for Meta Cloud API
function verifyWebhookSignature(signature: string, body: string): boolean {
  try {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      console.warn('META_APP_SECRET not configured, skipping signature verification');
      return true; // Skip verification if secret not configured
    }
    
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
