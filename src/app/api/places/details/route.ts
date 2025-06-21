import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeId, sessionToken } = await request.json();

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key is not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&sessiontoken=${sessionToken}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in places details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
} 