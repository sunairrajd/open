import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = process.env.NEXT_PRIVATE_TABLE_PRIVATE_ID;

    if (!apiKey) {
      console.error('API key is not configured in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const serviceUrl = `https://service.openproperty.in/api/v2/properties?${searchParams.toString()}`;
    console.log('Calling service URL:', serviceUrl);
    console.log('Using API key:', apiKey.substring(0, 4) + '...');

    const response = await fetch(serviceUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 0 } // Disable caching
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      };
      
      console.error('Service API error details:', errorDetails);
      
      return NextResponse.json(
        { 
          error: 'Service API error',
          details: errorDetails
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Response data:', {
      total: data.pagination?.total || 'N/A',
      currentPage: data.pagination?.page || 'N/A',
      totalPages: data.pagination?.totalPages || 'N/A',
      itemCount: data.data?.length || 0,
      firstItem: data.data?.[0] ? {
        id: data.data[0].id,
        price: data.data[0].price_overall,
        location: data.data[0].cleaned_location
      } : 'No items'
    });

    return NextResponse.json(data);
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    console.error('Properties API error:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 