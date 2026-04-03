import { NextRequest, NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
    }

    const gmailService = new GmailService();
    const tokens = await gmailService.getTokens(code);

    return NextResponse.json({
      success: true,
      message: 'Gmail API authorized successfully',
      refreshToken: tokens.refresh_token,
      instructions: 'Add this refresh token to your .env.local file as GMAIL_REFRESH_TOKEN'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to authorize Gmail API' },
      { status: 500 }
    );
  }
}
