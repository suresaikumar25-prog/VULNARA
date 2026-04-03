import axios from 'axios';

export interface UrlValidationResult {
  isValid: boolean;
  isLive: boolean;
  error?: string;
  statusCode?: number;
  responseTime?: number;
}

/**
 * Validates if a URL is properly formatted and if the website is live/accessible
 */
export async function validateUrl(url: string): Promise<UrlValidationResult> {
  try {
    // First, validate URL format
    const urlObj = new URL(url);
    
    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        isLive: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }
    
    // Check if hostname is valid
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        isLive: false,
        error: 'Invalid hostname'
      };
    }
    
    // Check for common invalid patterns
    const invalidPatterns = [
      /^localhost$/i,
      /^127\.0\.0\.1$/,
      /^0\.0\.0\.0$/,
      /^::1$/,
      /^0:0:0:0:0:0:0:1$/,
      /^example\.com$/i,
      /^test\.com$/i,
      /^invalid\.com$/i
    ];
    
    if (invalidPatterns.some(pattern => pattern.test(urlObj.hostname))) {
      return {
        isValid: false,
        isLive: false,
        error: 'Please enter a valid website URL (not localhost or test domains)'
      };
    }
    
    // Now check if the website is live
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        maxRedirects: 5, // Allow up to 5 redirects
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        validateStatus: (status) => {
          // Accept any status code from 200-499 (client errors are still "live")
          return status >= 200 && status < 500;
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      // Check if it's a successful response
      if (response.status >= 200 && response.status < 400) {
        return {
          isValid: true,
          isLive: true,
          statusCode: response.status,
          responseTime
        };
      } else {
        return {
          isValid: true,
          isLive: false,
          error: `Website returned error status: ${response.status}`,
          statusCode: response.status,
          responseTime
        };
      }
      
    } catch (_error: unknown) {
      const _responseTime = Date.now() - startTime;
      
      if (axios.isAxiosError(_error)) {
        if (_error.code === 'ENOTFOUND' || _error.code === 'EAI_AGAIN') {
          return {
            isValid: true,
            isLive: false,
            error: 'Website not found or domain does not exist',
            responseTime: _responseTime
          };
        } else if (_error.code === 'ECONNREFUSED') {
          return {
            isValid: true,
            isLive: false,
            error: 'Connection refused - website may be down',
            responseTime: _responseTime
          };
        } else if (_error.code === 'ETIMEDOUT') {
          return {
            isValid: true,
            isLive: false,
            error: 'Connection timeout - website is not responding',
            responseTime: _responseTime
          };
        } else if (_error.response) {
          // Server responded with an error status
          return {
            isValid: true,
            isLive: false,
            error: `Website returned error: ${_error.response.status} ${_error.response.statusText}`,
            statusCode: _error.response.status,
            responseTime: _responseTime
          };
        } else {
          return {
            isValid: true,
            isLive: false,
            error: `Connection failed: ${_error.message}`,
            responseTime: _responseTime
          };
        }
      } else {
        return {
          isValid: true,
          isLive: false,
          error: 'Unknown error occurred while checking website',
          responseTime: _responseTime
        };
      }
    }
    
  } catch (_error: unknown) {
    // URL parsing failed
    return {
      isValid: false,
      isLive: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Validates URL format only (without checking if it's live)
 */
export function validateUrlFormat(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }
    
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        error: 'Invalid hostname'
      };
    }
    
    return { isValid: true };
  } catch (_error: unknown) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}
