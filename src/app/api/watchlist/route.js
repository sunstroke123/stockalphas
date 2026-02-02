import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Watchlist from '@/lib/models/Watchlist';
import { auth } from '@/lib/auth';
import { getFinnhubQuote } from '@/lib/finnhub';

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// GET - Fetch user's watchlist with live prices
export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get user's watchlist document
    let watchlistDoc = await Watchlist.findOne({ userId: session.user.id });
    
    // Clean up any invalid documents (one-time fix)
    if (watchlistDoc && (!watchlistDoc.items || !Array.isArray(watchlistDoc.items))) {
      console.log('Cleaning up invalid watchlist document for user:', session.user.id);
      watchlistDoc.items = [];
      await watchlistDoc.save();
    }
    
    if (!watchlistDoc || !watchlistDoc.items || watchlistDoc.items.length === 0) {
      console.log('No watchlist items found for user:', session.user.id);
      return NextResponse.json([]);
    }

    console.log('Watchlist items from database:', watchlistDoc.items.map(item => ({ id: item._id, ticker: item.ticker })));

    // Fetch live prices for all stocks (Yahoo fallback to Finnhub)
    const yahooModule = await import('yahoo-finance2');
    const YahooFinance = yahooModule.default;
    const yahooFinance = new YahooFinance({ validation: { logErrors: false } });
    const watchlistWithPrices = await Promise.all(
      watchlistDoc.items.map(async (item) => {
        if (!item.ticker || typeof item.ticker !== 'string') {
          console.warn('Skipping invalid watchlist item:', item);
          return null;
        }
        try {
          const stockData = await yahooFinance.quote(item.ticker.toUpperCase());
          return {
            _id: item._id,
            ticker: item.ticker.toUpperCase(),
            name: stockData?.longName || stockData?.shortName || item.ticker,
            price: stockData?.regularMarketPrice || stockData?.price || 0,
            change: stockData?.regularMarketChange || 0,
            changePercent: stockData?.regularMarketChangePercent || 0,
            addedAt: item.addedAt,
          };
        } catch (error) {
          // Fallback to Finnhub
          try {
            const finnhubQuote = await getFinnhubQuote(item.ticker.toUpperCase());
            return {
              _id: item._id,
              ticker: item.ticker.toUpperCase(),
              name: item.ticker,
              price: finnhubQuote.c || 0,
              change: finnhubQuote.d || 0,
              changePercent: finnhubQuote.dp || 0,
              addedAt: item.addedAt,
            };
          } catch (finnhubErr) {
            console.error(`Error fetching price for ${item.ticker}:`, finnhubErr.message);
            return {
              _id: item._id,
              ticker: item.ticker.toUpperCase(),
              name: item.ticker,
              price: 0,
              change: 0,
              changePercent: 0,
              addedAt: item.addedAt,
            };
          }
        }
      })
    );

    // Filter out null entries
    const validWatchlistItems = watchlistWithPrices.filter(item => item !== null);

    return NextResponse.json(validWatchlistItems);
  } catch (error) {
    console.error("Watchlist GET error:", error);

    // Check if it's a MongoDB connection error
    if (
      error.message?.includes("ESERVFAIL") ||
      error.message?.includes("getaddrinfo")
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check your MongoDB configuration.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch watchlist", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add stock to watchlist
export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ticker } = body;

    console.log("Watchlist POST body:", body);

    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
      console.log("Ticker missing or invalid from request");
      return NextResponse.json(
        { error: "Valid ticker is required" },
        { status: 400 }
      );
    }

    const cleanTicker = ticker.trim().toUpperCase();

    // Validate ticker with Yahoo, fallback to Finnhub
    console.log("Validating ticker:", cleanTicker);
    let validTicker = false;
    try {
      const yahooModule = await import('yahoo-finance2');
      const YahooFinance = yahooModule.default;
      const yahooFinance = new YahooFinance({ validation: { logErrors: false } });
      const stockData = await yahooFinance.quote(cleanTicker);
      if (stockData) {
        const hasValidPrice = stockData.regularMarketPrice || stockData.price || stockData.previousClose || stockData.ask || stockData.bid;
        if (hasValidPrice) validTicker = true;
      }
    } catch (error) {
      // Fallback to Finnhub
      try {
        const finnhubQuote = await getFinnhubQuote(cleanTicker);
        if (finnhubQuote && typeof finnhubQuote.c === 'number' && finnhubQuote.c > 0) {
          validTicker = true;
        }
      } catch (finnhubErr) {
        // ignore, will handle below
      }
    }
    if (!validTicker) {
      return NextResponse.json(
        { error: "Invalid ticker symbol" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create user's watchlist document using upsert
    let watchlistDoc = await Watchlist.findOne({ userId: session.user.id });
    console.log('Found existing watchlist doc:', !!watchlistDoc);
    
    if (!watchlistDoc) {
      // Try to create new watchlist document for user with upsert to prevent duplicates
      console.log('Creating new watchlist document for user:', session.user.id);
      try {
        watchlistDoc = await Watchlist.findOneAndUpdate(
          { userId: session.user.id },
          { 
            userId: session.user.id,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true 
          }
        );
        console.log('Created watchlist document via upsert:', watchlistDoc);
      } catch (upsertError) {
        // If upsert fails due to race condition, try to find the document again
        console.log('Upsert failed, trying to find again:', upsertError.message);
        watchlistDoc = await Watchlist.findOne({ userId: session.user.id });
        if (!watchlistDoc) {
          throw new Error('Failed to create or find watchlist document');
        }
      }
    }

    // Check if ticker already exists in user's watchlist
    const existingItem = watchlistDoc.items.find(item => item.ticker === cleanTicker);
    
    if (existingItem) {
      console.log(`Stock ${cleanTicker} already in watchlist for user ${session.user.id}`);
      return NextResponse.json(
        { error: "Stock already in watchlist" },
        { status: 409 }
      );
    }

    // Add new item to watchlist
    console.log(`Adding ${cleanTicker} to watchlist for user ${session.user.id}. Current items count:`, watchlistDoc.items.length);
    watchlistDoc.items.push({
      ticker: cleanTicker,
      addedAt: new Date(),
    });
    
    console.log('About to save watchlist document. Items count:', watchlistDoc.items.length);
    const savedDoc = await watchlistDoc.save();
    const newItem = savedDoc.items[savedDoc.items.length - 1];
    console.log('Watchlist item saved successfully. New item:', {
      _id: newItem._id,
      ticker: newItem.ticker,
      addedAt: newItem.addedAt
    });

    return NextResponse.json({
      message: "Stock added to watchlist successfully",
      success: true,
      item: {
        _id: newItem._id,
        ticker: newItem.ticker,
        addedAt: newItem.addedAt
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Watchlist POST error:", error);

    // Check if it's a MongoDB connection error
    if (
      error.message?.includes("ESERVFAIL") ||
      error.message?.includes("getaddrinfo")
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check your MongoDB configuration.",
        },
        { status: 503 }
      );
    }

    // Check if it's a validation error
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid request body", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add to watchlist", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(req) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const cleanTicker = ticker.trim().toUpperCase();
    
    // Find user's watchlist and remove the item
    const watchlistDoc = await Watchlist.findOne({ userId: session.user.id });
    
    if (!watchlistDoc) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    const itemIndex = watchlistDoc.items.findIndex(item => item.ticker === cleanTicker);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Stock not found in watchlist" },
        { status: 404 }
      );
    }

    // Remove the item from array
    watchlistDoc.items.splice(itemIndex, 1);
    await watchlistDoc.save();

    return NextResponse.json({
      message: "Stock removed from watchlist successfully",
    });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);

    // Check if it's a MongoDB connection error
    if (
      error.message?.includes("ESERVFAIL") ||
      error.message?.includes("getaddrinfo")
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check your MongoDB configuration.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove from watchlist", details: error.message },
      { status: 500 }
    );
  }
}
