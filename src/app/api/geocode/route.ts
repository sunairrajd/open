import { NextResponse } from 'next/server';

// Levenshtein distance calculation for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return track[str2.length][str1.length];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const fuzzy = searchParams.get('fuzzy') === 'true';
  const maxDistance = parseInt(searchParams.get('maxDistance') || '3', 10);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Increase the limit to get more results for fuzzy matching
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(query)}+bangalore&limit=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'OpenPropertyMap/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status: ${response.status}`);
    }

    let data = await response.json();

    if (fuzzy) {
      // Process results for fuzzy matching
      data = data.filter((item: any) => {
        const locationName = item.display_name.toLowerCase().split(',')[0];
        const searchQuery = query.toLowerCase();
        
        // Check for exact substring match first
        if (locationName.includes(searchQuery)) {
          return true;
        }

        // Calculate Levenshtein distance for fuzzy matching
        const distance = levenshteinDistance(locationName, searchQuery);
        return distance <= maxDistance;
      });

      // Sort results by relevance
      data.sort((a: any, b: any) => {
        const aName = a.display_name.toLowerCase().split(',')[0];
        const bName = b.display_name.toLowerCase().split(',')[0];
        const searchQuery = query.toLowerCase();

        // Exact matches first
        const aExact = aName.includes(searchQuery);
        const bExact = bName.includes(searchQuery);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by Levenshtein distance
        const aDist = levenshteinDistance(aName, searchQuery);
        const bDist = levenshteinDistance(bName, searchQuery);
        return aDist - bDist;
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
} 