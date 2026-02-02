import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/mlApi';

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

export async function GET(req) {
  try {
    const health = await healthCheck();
    
    return NextResponse.json({
      success: true,
      ml_service: 'https://stock-price-prediction-8.onrender.com',
      status: 'operational',
      response: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ML API health check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        ml_service: 'https://stock-price-prediction-8.onrender.com',
        status: 'unavailable',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
