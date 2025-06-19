import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TABLE_PRIVATE_ID;
    if (!apiKey) {
      console.error('API key is not configured');
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const latitudeMin = searchParams.get('latitudeMin');
    const latitudeMax = searchParams.get('latitudeMax');
    const longitudeMin = searchParams.get('longitudeMin');
    const longitudeMax = searchParams.get('longitudeMax');
    const propertyType = searchParams.get('propertyType');
    const typology = searchParams.get('typology');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const sqFeetMin = searchParams.get('sqFeetMin');
    const sqFeetMax = searchParams.get('sqFeetMax');

    // Build the API URL with parameters
    const apiUrl = new URL('https://service.openproperty.in/api/properties');
    
    // Add required parameters
    apiUrl.searchParams.append('latitudeMin', latitudeMin || '');
    apiUrl.searchParams.append('latitudeMax', latitudeMax || '');
    apiUrl.searchParams.append('longitudeMin', longitudeMin || '');
    apiUrl.searchParams.append('longitudeMax', longitudeMax || '');

    // Add filter parameters if they exist
    if (propertyType) {
      apiUrl.searchParams.append('propertyType', propertyType);
    }
    if (typology) {
      apiUrl.searchParams.append('typology', typology);
    }
    if (priceMin) {
      apiUrl.searchParams.append('priceMin', priceMin);
    }
    if (priceMax) {
      apiUrl.searchParams.append('priceMax', priceMax);
    }
    if (sqFeetMin) {
      apiUrl.searchParams.append('sqFeetMin', sqFeetMin);
    }
    if (sqFeetMax) {
      apiUrl.searchParams.append('sqFeetMax', sqFeetMax);
    }

    console.log('Making API request to:', apiUrl.toString());
    console.log('With headers:', {
      'x-api-key': apiKey ? '***' : 'missing',
      'Content-Type': 'application/json'
    });

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response not ok:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ 
        error: 'Failed to fetch properties',
        details: {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        }
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('API response data sample:', data.slice(0, 1)); // Log first item for debugging
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

