import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://openproperty.in' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceApiKey = process.env.NEXT_PRIVATE_TABLE_PRIVATE_ID;

    if (!serviceApiKey) {
      console.error('Service API key is not configured in environment variables');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Authentication: Check if client provided API key
    const clientApiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!clientApiKey) {
      console.warn('API request without authentication');
      return NextResponse.json(
        { error: 'Dont steal my data' },
        { status: 401 }
      );
    }

    // Client API key validation - use private environment variable
    const validClientApiKey = process.env.NEXT_PUBLIC_CLIENT_API_KEY;
    
    console.log('API Key validation:', {
      clientProvided: clientApiKey ? `${clientApiKey.substring(0, 4)}...` : 'none',
      expected: validClientApiKey ? `${validClientApiKey.substring(0, 4)}...` : 'none',
      matches: clientApiKey === validClientApiKey
    });
    
    if (clientApiKey !== validClientApiKey) {
      console.warn('Invalid API key provided');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const rateLimitResult = rateLimit(clientIP, 100, 3 * 60 * 1000); // 100 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const serviceUrl = `https://service.openproperty.in/api/v2/properties?${searchParams.toString()}`;
    console.log('Calling service URL:', serviceUrl);
    console.log('Using service API key:', serviceApiKey.substring(0, 4) + '...');

    const response = await fetch(serviceUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': serviceApiKey,
      },
      next: { revalidate: 0 } // Disable caching
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      };
      
      console.error('Service API error details:', errorDetails);
      
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable'
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log('API Response data:', {
      total: data.pagination?.total || 'N/A',
      currentPage: data.pagination?.page || 'N/A',
      totalPages: data.pagination?.totalPages || 'N/A',
      itemCount: data.data?.length || 0,
      clientIP,
      timestamp: new Date().toISOString()
    });

    // Add rate limit headers to response
    const responseHeaders = {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
    };

    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    console.error('Properties API error:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable'
      },
      { status: 503 }
    );
  }
} 