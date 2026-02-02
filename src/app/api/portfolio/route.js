import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';

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
    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import('yahoo-finance2');
    const YahooFinance = yahooModule.default;
    const yahooFinance = new YahooFinance({ validation: { logErrors: false } });
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get portfolio from database
    let portfolio = await Portfolio.findOne({ userId: session.user.id });

    if (!portfolio || portfolio.transactions.length === 0) {
      return NextResponse.json({
        userId: session.user.id,
        totalValue: 0,
        totalCost: 0,
        totalGain: 0,
        totalGainPercent: 0,
        holdings: [],
        transactions: [],
        performance: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    // Calculate holdings from transactions
    const holdingsMap = new Map();

    portfolio.transactions.forEach(transaction => {
      const existing = holdingsMap.get(transaction.ticker) || {
        ticker: transaction.ticker,
        quantity: 0,
        totalCost: 0,
        transactions: [],
      };

      if (transaction.type === 'BUY') {
        existing.quantity += transaction.quantity;
        existing.totalCost += transaction.quantity * transaction.price;
      } else if (transaction.type === 'SELL') {
        existing.quantity -= transaction.quantity;
        existing.totalCost -= transaction.quantity * transaction.price;
      }

      existing.transactions.push(transaction);
      holdingsMap.set(transaction.ticker, existing);
    });

    // Filter out zero quantity holdings
    const activeHoldings = Array.from(holdingsMap.values()).filter(h => h.quantity > 0);

    if (activeHoldings.length === 0) {
      return NextResponse.json({
        userId: session.user.id,
        totalValue: 0,
        totalCost: 0,
        totalGain: 0,
        totalGainPercent: 0,
        holdings: [],
        performance: [],
      });
    }

    // Fetch real-time prices from Yahoo Finance
    const tickers = activeHoldings.map(h => h.ticker);
    const quotes = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const stockData = await yahooFinance.quote(ticker);
          return {
            ticker,
            name: stockData.longName || stockData.shortName || ticker,
            currentPrice: stockData.regularMarketPrice || 0,
          };
        } catch (error) {
          console.error(`Error fetching quote for ${ticker}:`, error);
          return { ticker, name: ticker, currentPrice: 0 };
        }
      })
    );

    // Calculate holdings with current prices
    const holdings = activeHoldings.map((holding) => {
      const quote = quotes.find(q => q.ticker === holding.ticker);
      const avgPrice = holding.totalCost / holding.quantity;
      const currentPrice = quote?.currentPrice || 0;
      const totalValue = holding.quantity * currentPrice;
      const gain = totalValue - holding.totalCost;
      const gainPercent = holding.totalCost > 0 ? (gain / holding.totalCost) * 100 : 0;

      return {
        ticker: holding.ticker,
        name: quote?.name || holding.ticker,
        quantity: holding.quantity,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalCost: parseFloat(holding.totalCost.toFixed(2)),
        gain: parseFloat(gain.toFixed(2)),
        gainPercent: parseFloat(gainPercent.toFixed(2)),
      };
    });

    // Calculate totals
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    // Generate performance data (simplified - last 10 months)
    const performance = [];
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = totalCost + (totalGain * (10 - i) / 10);
      performance.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(value.toFixed(2)),
      });
    }

    return NextResponse.json({
      userId: session.user.id,
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalGain: parseFloat(totalGain.toFixed(2)),
      totalGainPercent: parseFloat(totalGainPercent.toFixed(2)),
      holdings,
      transactions: portfolio.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      performance,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
