import { NextResponse } from 'next/server';
import { getPredictions } from '@/lib/mlApi';

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req, { params }) {
  try {
    const { ticker } = await params;

    const predictions = await getPredictions(ticker);

    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      predictions: predictions.predictions || predictions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching ML predictions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch predictions',
        details: error.message,
        ticker: (await params).ticker.toUpperCase(),
      },
      { status: 500 }
    );
  }
}
