# 🚀 Implementation Guide: Connecting Real Data

This guide shows how to replace the mock data with real data from MongoDB, yahoo-finance2, and your external ML API.

## Phase 1: Connect MongoDB (30 minutes)

### 1. Start MongoDB
```bash
# Local MongoDB
mongod --dbpath /path/to/data

# OR use MongoDB Atlas (cloud)
# https://www.mongodb.com/cloud/atlas
```

### 2. Update Portfolio Routes

**File: `src/app/api/portfolio/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ userId: session.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: session.user.id, transactions: [] });
    }

    // Calculate holdings from transactions
    const holdings = calculateHoldings(portfolio.transactions);
    
    // Fetch current prices for each ticker
    const enrichedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const currentPrice = await getCurrentPrice(holding.ticker);
        const totalValue = holding.quantity * currentPrice;
        const totalCost = holding.quantity * holding.avgPrice;
        const gain = totalValue - totalCost;
        const gainPercent = (gain / totalCost) * 100;

        return {
          ...holding,
          currentPrice,
          totalValue,
          gain,
          gainPercent,
        };
      })
    );

    const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = enrichedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = (totalGain / totalCost) * 100;

    return NextResponse.json({
      userId: session.user.id,
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      holdings: enrichedHoldings,
      performance: await calculatePerformance(portfolio.transactions),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate holdings from transactions
function calculateHoldings(transactions) {
  const holdingsMap = new Map();

  transactions.forEach((tx) => {
    const existing = holdingsMap.get(tx.ticker) || { 
      ticker: tx.ticker, 
      quantity: 0, 
      totalCost: 0 
    };

    if (tx.type === 'BUY') {
      existing.quantity += tx.quantity;
      existing.totalCost += tx.quantity * tx.price;
    } else {
      existing.quantity -= tx.quantity;
      existing.totalCost -= tx.quantity * tx.price;
    }

    holdingsMap.set(tx.ticker, existing);
  });

  return Array.from(holdingsMap.values())
    .filter(h => h.quantity > 0)
    .map(h => ({
      ticker: h.ticker,
      name: `${h.ticker} Inc.`, // Fetch real name later
      quantity: h.quantity,
      avgPrice: h.totalCost / h.quantity,
      totalCost: h.totalCost,
    }));
}

// Stub - will implement with yahoo-finance2
async function getCurrentPrice(ticker) {
  return 100; // Replace with real API call
}

// Stub - will implement with historical data
async function calculatePerformance(transactions) {
  return [];
}
```

**File: `src/app/api/portfolio/transaction/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker, type, quantity, price, date } = await req.json();

    // Validation
    if (!ticker || !type || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Find or create portfolio
    let portfolio = await Portfolio.findOne({ userId: session.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: session.user.id, transactions: [] });
    }

    // Add transaction
    portfolio.transactions.push({
      ticker: ticker.toUpperCase(),
      type,
      quantity,
      price,
      date: date || new Date(),
    });

    await portfolio.save();

    return NextResponse.json(
      { message: 'Transaction added successfully', transaction: portfolio.transactions[portfolio.transactions.length - 1] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. Update Watchlist Routes

**File: `src/app/api/watchlist/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Watchlist from '@/lib/models/Watchlist';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let watchlist = await Watchlist.findOne({ userId: session.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: session.user.id, items: [] });
    }

    // Enrich with current prices
    const enrichedItems = await Promise.all(
      watchlist.items.map(async (item) => {
        const details = await getStockDetails(item.ticker);
        return {
          ticker: item.ticker,
          name: details.name,
          price: details.price,
          change: details.change,
          changePercent: details.changePercent,
          addedAt: item.addedAt,
        };
      })
    );

    return NextResponse.json({
      userId: session.user.id,
      items: enrichedItems,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    await connectDB();

    let watchlist = await Watchlist.findOne({ userId: session.user.id });
    if (!watchlist) {
      watchlist = new Watchlist({ userId: session.user.id, items: [] });
    }

    // Check if already exists
    if (watchlist.items.some(item => item.ticker === ticker.toUpperCase())) {
      return NextResponse.json({ error: 'Stock already in watchlist' }, { status: 409 });
    }

    watchlist.items.push({ ticker: ticker.toUpperCase() });
    await watchlist.save();

    return NextResponse.json(
      { message: 'Stock added to watchlist', item: watchlist.items[watchlist.items.length - 1] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    await connectDB();

    const watchlist = await Watchlist.findOne({ userId: session.user.id });
    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    watchlist.items = watchlist.items.filter(item => item.ticker !== ticker.toUpperCase());
    await watchlist.save();

    return NextResponse.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Stub - will implement with yahoo-finance2
async function getStockDetails(ticker) {
  return { name: `${ticker} Inc.`, price: 100, change: 1, changePercent: 1 };
}
```

## Phase 2: Integrate yahoo-finance2 (1 hour)

### 1. Create Stock Data Service

**File: `src/lib/stockDataService.js`**

```javascript
import yahooFinance from 'yahoo-finance2';

export async function getStockDetails(ticker) {
  try {
    const quote = await yahooFinance.quote(ticker);
    
    return {
      ticker: ticker.toUpperCase(),
      name: quote.longName || quote.shortName || ticker,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketCap: formatMarketCap(quote.marketCap),
      volume: formatVolume(quote.regularMarketVolume),
      pe: quote.trailingPE?.toFixed(2) || 'N/A',
      high52Week: quote.fiftyTwoWeekHigh,
      low52Week: quote.fiftyTwoWeekLow,
      description: quote.longBusinessSummary || `${ticker} is a publicly traded company.`,
    };
  } catch (error) {
    console.error(`Error fetching details for ${ticker}:`, error);
    throw error;
  }
}

export async function getStockHistory(ticker, period = '1mo') {
  try {
    const queryOptions = { period1: getPeriodStart(period) };
    const result = await yahooFinance.historical(ticker, queryOptions);
    
    return result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error(`Error fetching history for ${ticker}:`, error);
    throw error;
  }
}

export async function calculateIndicators(ticker, period = '1y') {
  try {
    const history = await getStockHistory(ticker, period);
    const closes = history.map(h => h.close);
    
    return {
      ticker: ticker.toUpperCase(),
      indicators: {
        sma20: calculateSMA(closes, 20),
        sma50: calculateSMA(closes, 50),
        sma200: calculateSMA(closes, 200),
        ema12: calculateEMA(closes, 12),
        ema26: calculateEMA(closes, 26),
        rsi: calculateRSI(closes, 14),
        macd: calculateMACD(closes),
        bollingerBands: calculateBollingerBands(closes, 20, 2),
      },
      analysis: analyzeIndicators(closes),
    };
  } catch (error) {
    console.error(`Error calculating indicators for ${ticker}:`, error);
    throw error;
  }
}

// Helper functions
function getPeriodStart(period) {
  const now = new Date();
  const periodMap = {
    '1d': 1,
    '1w': 7,
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
    '5y': 1825,
  };
  const days = periodMap[period] || 30;
  return new Date(now.setDate(now.getDate() - days));
}

function formatMarketCap(value) {
  if (!value) return 'N/A';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}

function formatVolume(value) {
  if (!value) return 'N/A';
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toString();
}

function calculateSMA(data, period) {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

function calculateEMA(data, period) {
  if (data.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateRSI(data, period = 14) {
  if (data.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = data.length - period; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12 - ema26;
  
  // Simplified signal line (should use EMA of MACD)
  const signal = macd * 0.9;
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function calculateBollingerBands(data, period = 20, stdDev = 2) {
  const sma = calculateSMA(data, period);
  if (!sma) return null;
  
  const slice = data.slice(-period);
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * std),
    middle: sma,
    lower: sma - (stdDev * std),
  };
}

function analyzeIndicators(closes) {
  const latestClose = closes[closes.length - 1];
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  
  let trend = 'NEUTRAL';
  if (sma50 && sma200) {
    if (latestClose > sma50 && sma50 > sma200) trend = 'BULLISH';
    else if (latestClose < sma50 && sma50 < sma200) trend = 'BEARISH';
  }
  
  return {
    trend,
    strength: 'MODERATE',
    support: Math.min(...closes.slice(-20)),
    resistance: Math.max(...closes.slice(-20)),
  };
}
```

### 2. Update Stock API Routes

**File: `src/app/api/stock/[ticker]/details/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { getStockDetails } from '@/lib/stockDataService';

export async function GET(req, { params }) {
  try {
    const { ticker } = params;
    const data = await getStockDetails(ticker);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
  }
}
```

**File: `src/app/api/stock/[ticker]/history/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { getStockHistory } from '@/lib/stockDataService';

export async function GET(req, { params }) {
  try {
    const { ticker } = params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '1mo';
    
    const data = await getStockHistory(ticker, period);
    return NextResponse.json({ ticker: ticker.toUpperCase(), period, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock history' }, { status: 500 });
  }
}
```

**File: `src/app/api/stock/[ticker]/indicators/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { calculateIndicators } from '@/lib/stockDataService';

export async function GET(req, { params }) {
  try {
    const { ticker } = params;
    const data = await calculateIndicators(ticker);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
  }
}
```

## Phase 3: Integrate External ML API (30 minutes)

**File: `src/app/api/stock/[ticker]/prediction/route.js`**

```javascript
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req, { params }) {
  try {
    const { ticker } = params;
    
    // Call external ML API
    const response = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      { ticker: ticker.toUpperCase() },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ML_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // Transform the response to match our format
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      predicted_price: response.data.predicted_price,
      current_price: response.data.current_price,
      signal: response.data.signal, // 'BUY', 'SELL', or 'HOLD'
      risk: response.data.risk, // 'LOW', 'MEDIUM', or 'HIGH'
      confidence: response.data.confidence,
      timeframe: response.data.timeframe || '1 week',
      factors: response.data.factors || [],
      recommendation: response.data.recommendation || '',
    });
  } catch (error) {
    console.error('ML API Error:', error);
    
    // Fallback to mock data if ML API fails
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      predicted_price: 0,
      current_price: 0,
      signal: 'HOLD',
      risk: 'MEDIUM',
      confidence: 0,
      timeframe: '1 week',
      factors: [],
      recommendation: 'ML prediction unavailable',
      error: 'ML service unavailable',
    });
  }
}
```

## Phase 4: Testing (15 minutes)

### 1. Test MongoDB Connection
```bash
# Check if MongoDB is running
mongo --eval "db.version()"

# Test user creation
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
```

### 2. Test Stock Data
```bash
# Test stock details
curl http://localhost:3000/api/stock/AAPL/details

# Test stock history
curl http://localhost:3000/api/stock/AAPL/history?period=1mo

# Test indicators
curl http://localhost:3000/api/stock/AAPL/indicators
```

### 3. Test Protected Routes
```bash
# Login first to get session cookie
# Then test portfolio
curl http://localhost:3000/api/portfolio \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## Troubleshooting

### MongoDB Connection Issues
```javascript
// Add to mongodb.js for debugging
mongoose.set('debug', true);
```

### yahoo-finance2 Rate Limiting
```javascript
// Add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await delay(1000); // 1 second delay
```

### ML API Timeout
```javascript
// Increase timeout in prediction route
timeout: 30000 // 30 seconds
```

## Performance Optimization

### 1. Cache Stock Data
```javascript
// Use Redis or in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### 2. Batch API Calls
```javascript
// Instead of sequential calls, use Promise.all
const [details, history, indicators] = await Promise.all([
  getStockDetails(ticker),
  getStockHistory(ticker),
  calculateIndicators(ticker),
]);
```

### 3. Index MongoDB Collections
```javascript
// Add indexes for faster queries
PortfolioSchema.index({ userId: 1 });
WatchlistSchema.index({ userId: 1 });
UserSchema.index({ email: 1 }, { unique: true });
```

## Next Steps

1. ✅ Connect MongoDB
2. ✅ Integrate yahoo-finance2
3. ✅ Connect ML API
4. 🚧 Build stock detail page
5. 🚧 Add WebSocket for real-time updates
6. 🚧 Implement caching layer
7. 🚧 Add error boundaries
8. 🚧 Write unit tests

## Support

If you encounter issues:
1. Check `.env.local` configuration
2. Verify MongoDB connection
3. Check API rate limits
4. Review console/terminal errors
5. Test API routes individually

Happy coding! 🚀
