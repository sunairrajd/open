import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const sessiontoken = searchParams.get('sessiontoken');

  if (!input) {
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
  }

  try {
    // Create Bangalore bounds
    const bounds = {
      southwest: { lat: 12.704574, lng: 77.350723 },
      northeast: { lat: 13.173706, lng: 77.850723 }
    };

    const params = new URLSearchParams({
      input: input,
      key: process.env.NEXT_PRIVATE_GOOGLE_MAPS_API_KEY || '',
      components: 'country:in',
      location: `${(bounds.southwest.lat + bounds.northeast.lat) / 2},${(bounds.southwest.lng + bounds.northeast.lng) / 2}`,
      radius: '30000', // 30km radius
      strictbounds: 'true',
      types: 'geocode|establishment',
      sessiontoken: sessiontoken || ''
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: process.env.GOOGLE_MAPS_API_KEY || '',
      fields: 'geometry'
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
} 