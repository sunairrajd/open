import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input');
  const sessiontoken = searchParams.get('sessiontoken');

  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('Google Places API key is missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Fetching from Google Places API with input:', input);
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&sessiontoken=${sessiontoken}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('Google Places API Response:', {
      status: response.status,
      googleStatus: data.status,
      hasResults: !!data.predictions
    });

    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', {
        status: data.status,
        error_message: data.error_message
      });
      return NextResponse.json(
        { error: data.error_message || 'Failed to fetch predictions from Google' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in places autocomplete:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch place predictions' },
      { status: 500 }
    );
  }
} 