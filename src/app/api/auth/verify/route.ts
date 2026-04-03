import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('threatlens-session');
    
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Simple token validation (in production, use proper JWT validation)
    try {
      const decoded = Buffer.from(sessionToken.value, 'base64').toString();
      const [username, timestamp] = decoded.split(':');
      
      // Check if session is not expired (24 hours)
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (now - sessionTime > maxAge) {
        await cookieStore.delete('threatlens-session');
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      
      return NextResponse.json({ 
        authenticated: true, 
        user: { username } 
      });
    } catch (error) {
      await cookieStore.delete('threatlens-session');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
