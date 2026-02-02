import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { getFinnhubQuote } from '@/lib/finnhub';

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
    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import('yahoo-finance2');
    const YahooFinance = yahooModule.default;
    const yahooFinance = new YahooFinance();
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ticker, type, quantity, price, date } = body;

    console.log('Transaction POST body:', body);

    if (!ticker || !type || !quantity || !price) {
      console.log('Missing required fields:', { ticker, type, quantity, price });
      return NextResponse.json(
        { error: 'Missing required fields: ticker, type, quantity, and price are required' },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || price <= 0) {
      return NextResponse.json(
        { error: 'Quantity and price must be positive' },
        { status: 400 }
      );
    }

    // Verify ticker exists (Yahoo, fallback to Finnhub)
    let validTicker = false;
    try {
      await yahooFinance.quote(ticker.toUpperCase());
      validTicker = true;
    } catch (error) {
      // Try Finnhub as fallback
      try {
        const finnhubQuote = await getFinnhubQuote(ticker.toUpperCase());
        if (finnhubQuote && typeof finnhubQuote.c === 'number' && finnhubQuote.c > 0) {
          validTicker = true;
        }
      } catch (finnhubErr) {
        // ignore, will handle below
      }
    }
    if (!validTicker) {
      return NextResponse.json(
        { error: 'Invalid ticker symbol' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find or create portfolio
    let portfolio = await Portfolio.findOne({ userId: session.user.id });

    if (!portfolio) {
      portfolio = new Portfolio({
        userId: session.user.id,
        transactions: [],
      });
    }

    // Add transaction
    const transaction = {
      ticker: ticker.toUpperCase(),
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date: date ? new Date(date) : new Date(),
    };

    console.log('Adding transaction:', transaction);

    portfolio.transactions.push(transaction);
    const savedPortfolio = await portfolio.save();
    const newTransaction = savedPortfolio.transactions[savedPortfolio.transactions.length - 1];

    console.log('Transaction saved successfully:', newTransaction);

    return NextResponse.json(
      {
        message: 'Transaction added successfully',
        transaction: newTransaction,
        success: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  }
}
