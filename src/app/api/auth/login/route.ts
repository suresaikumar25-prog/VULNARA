import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple authentication - in production, use proper authentication
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'threatlens2024' // Change this in production
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    
    // Simple credential check
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create session token (in production, use JWT or proper session management)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      // Set secure cookie
      const cookieStore = await cookies();
      cookieStore.set('threatlens-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: { username }
      });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
