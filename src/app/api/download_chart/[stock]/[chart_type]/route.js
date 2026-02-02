import { NextResponse } from 'next/server';
import { downloadChart } from '@/lib/mlApi';

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req, { params }) {
  try {
    const { stock, chart_type } = await params;
    
    // Check if this is a preview request
    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get('preview') === 'true';

    // Validate parameters
    if (!stock) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          details: 'Stock symbol is required',
          example: '/api/download_chart/TCS.NS/prediction'
        },
        { status: 400 }
      );
    }

    // Validate stock symbol format (basic validation)
    const stockSymbol = stock.toUpperCase().trim();
    if (!/^[A-Z0-9.]+$/.test(stockSymbol)) {
      return NextResponse.json(
        { 
          error: 'Invalid stock symbol format',
          details: 'Stock symbol should contain only letters, numbers, and dots',
          provided: stockSymbol
        },
        { status: 400 }
      );
    }

    console.log(`📊 ${isPreview ? 'Previewing' : 'Downloading'} chart for ${stockSymbol}`);

    // Download the chart from ML API (chart_type is ignored as API only has one type)
    const chartBlob = await downloadChart(stockSymbol);
    
    console.log('Received blob from ML API:', {
      size: chartBlob.size,
      type: chartBlob.type || 'unknown'
    });

    // Validate that we actually received an image
    if (!chartBlob || chartBlob.size === 0) {
      throw new Error('ML API returned empty response');
    }

    // If blob type is not image, it might be an error response
    if (chartBlob.type && !chartBlob.type.startsWith('image/')) {
      console.error('ML API returned non-image content type:', chartBlob.type);
      // Try to read the content to see what error we got
      const errorText = await chartBlob.text();
      console.error('ML API error response:', errorText.substring(0, 500));
      throw new Error(`ML API returned error: ${errorText.substring(0, 100)}...`);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${stockSymbol}_prediction_${timestamp}.png`;

    // Set headers based on request type
    const headers = {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'Access-Control-Allow-Origin': '*',
    };

    // Only add attachment header for downloads, not previews
    if (!isPreview) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      headers['Access-Control-Expose-Headers'] = 'Content-Disposition';
    }

    return new NextResponse(chartBlob, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error in download_chart endpoint:', error);

    // Handle specific ML API errors
    if (error.message.includes('404')) {
      return NextResponse.json(
        { 
          error: 'Chart not found',
          details: 'The requested chart could not be generated. The stock symbol may not be supported.',
          stock: (await params).stock.toUpperCase()
        },
        { status: 404 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'Chart generation took too long. Please try again later.',
          stock: (await params).stock.toUpperCase()
        },
        { status: 408 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Failed to generate chart',
        details: error.message || 'An unexpected error occurred while generating the chart',
        stock: (await params).stock.toUpperCase(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}