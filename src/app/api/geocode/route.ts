import { NextResponse } from 'next/server';

// This endpoint is deprecated as we've migrated to Google Maps Places API
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Please use Google Maps Places API instead.' },
    { status: 404 }
  );
} 