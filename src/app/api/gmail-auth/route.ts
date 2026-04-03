import { NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmailService';

export async function GET() {
  try {
    const gmailService = new GmailService();
    const authUrl = gmailService.getAuthUrl();
    
    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Visit the authUrl to authorize Gmail API'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
