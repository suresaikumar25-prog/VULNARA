import { NextRequest, NextResponse } from 'next/server';
import { validateUrl } from '@/lib/urlValidator';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ 
        isValid: false, 
        isLive: false, 
        error: 'URL is required' 
      }, { status: 400 });
    }

    // Normalize URL - add https:// if no protocol is specified
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log('Original URL:', url);
    console.log('Normalized URL:', normalizedUrl);

    // Use the proper validateUrl function
    const validationResult = await validateUrl(normalizedUrl);
    
    console.log('Validation result:', validationResult);
    
    return NextResponse.json(validationResult);
    
  } catch (error) {
    console.error('URL validation error:', error);
    return NextResponse.json(
      { 
        isValid: false, 
        isLive: false, 
        error: 'URL validation failed' 
      },
      { status: 500 }
    );
  }
}
