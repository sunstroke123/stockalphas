import { NextResponse } from 'next/server';
import { analyzeStock } from '@/lib/mlApi';

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

export async function POST(req) {
  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    const result = await analyzeStock(ticker);

    return NextResponse.json({
      success: true,
      ticker: ticker.toUpperCase(),
      message: result.message,
      prediction: result.data_preview?.[0]?.Predicted_Close || null,
      charts: result.charts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in ML analyze endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze stock',
        details: error.message,
        ml_service: 'https://stock-price-prediction-8.onrender.com'
      },
      { status: 500 }
    );
  }
}
