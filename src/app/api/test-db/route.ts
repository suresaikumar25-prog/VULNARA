import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DATABASE CONNECTION TEST ===');
    console.log('Environment variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        details: 'Environment variables missing',
        debug: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
        }
      });
    }

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('Database connection test result:', error.message);
      
      // Check if it's a table not found error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Tables not found',
          details: 'Database schema needs to be set up',
          setupRequired: true,
          instructions: [
            '1. Go to your Supabase dashboard: https://supabase.com/dashboard',
            '2. Select your project',
            '3. Go to SQL Editor',
            '4. Copy and paste the contents of supabase-schema.sql',
            '5. Click "Run" to create the tables'
          ]
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: data
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
