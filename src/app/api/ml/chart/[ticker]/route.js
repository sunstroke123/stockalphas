import { NextResponse } from 'next/server';
import { downloadChart, getChartUrl } from '@/lib/mlApi';

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
    const { searchParams } = new URL(req.url);
    const chartType = searchParams.get('type') || 'prediction';
    const download = searchParams.get('download') === 'true';

    if (download) {
      // Download the chart as blob and return it
      const chartBlob = await downloadChart(ticker, chartType);
      
      return new NextResponse(chartBlob, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${ticker.toUpperCase()}_${chartType}.png"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // Return the chart URL
      const chartUrl = getChartUrl(ticker, chartType);
      
      return NextResponse.json({
        success: true,
        ticker: ticker.toUpperCase(),
        chart_type: chartType,
        chart_url: chartUrl,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error fetching ML chart:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chart',
        details: error.message,
        ticker: (await params).ticker.toUpperCase(),
      },
      { status: 500 }
    );
  }
}
