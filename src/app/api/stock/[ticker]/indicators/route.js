import { NextResponse } from "next/server";

// Calculate Simple Moving Average
function calculateSMA(data, period) {
  if (data.length < period) return null;
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

// Calculate Exponential Moving Average
function calculateEMA(data, period) {
  if (data.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema;
}

// Calculate RSI
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
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req, ctx) {
  try {
    // Next.js 16: params is a Promise
    const { ticker } = await ctx.params;

    console.log("Fetching indicators:", ticker);

    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import("yahoo-finance2");
    const YahooFinance = yahooModule.default;
    
    // ✔ Create an instance before using .historical()
    const yahooFinance = new YahooFinance();

    // Fetch 200 days of historical data
    const result = await yahooFinance.historical(ticker.toUpperCase(), {
      period1: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      period2: new Date(),
      interval: "1d",
    });

    const closePrices = result.map((item) => item.close);
    const currentPrice = closePrices[closePrices.length - 1];

    // Indicators
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const sma200 = calculateSMA(closePrices, 200);

    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);
    const rsi = calculateRSI(closePrices, 14);

    const macd = ema12 && ema26 ? ema12 - ema26 : null;
    const signal = macd
      ? calculateEMA([...closePrices.slice(-26), macd], 9)
      : null;
    const histogram = macd && signal ? macd - signal : null;

    // Bollinger Bands
    const recentPrices = closePrices.slice(-20);
    const mean = sma20;
    const variance =
      recentPrices.reduce((sum, price) => sum + (price - mean) ** 2, 0) / 20;
    const stdDev = Math.sqrt(variance);

    const upperBand = mean + 2 * stdDev;
    const lowerBand = mean - 2 * stdDev;

    // Trend
    let trend = "NEUTRAL";
    if (sma20 && sma50 && sma200) {
      if (currentPrice > sma20 && sma20 > sma50 && sma50 > sma200) {
        trend = "BULLISH";
      } else if (currentPrice < sma20 && sma20 < sma50 && sma50 < sma200) {
        trend = "BEARISH";
      }
    }

    // Strength
    let strength = "WEAK";
    if (rsi) {
      if (rsi > 60) strength = "STRONG";
      else if (rsi > 40) strength = "MODERATE";
    }

    // Support & Resistance
    const recent = closePrices.slice(-30);
    const support = Math.min(...recent);
    const resistance = Math.max(...recent);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      indicators: {
        sma20: sma20 ? parseFloat(sma20.toFixed(2)) : null,
        sma50: sma50 ? parseFloat(sma50.toFixed(2)) : null,
        sma200: sma200 ? parseFloat(sma200.toFixed(2)) : null,
        ema12: ema12 ? parseFloat(ema12.toFixed(2)) : null,
        ema26: ema26 ? parseFloat(ema26.toFixed(2)) : null,
        rsi: rsi ? parseFloat(rsi.toFixed(2)) : null,
        macd: {
          macd: macd ? parseFloat(macd.toFixed(2)) : null,
          signal: signal ? parseFloat(signal.toFixed(2)) : null,
          histogram: histogram ? parseFloat(histogram.toFixed(2)) : null,
        },
        bollingerBands: {
          upper: parseFloat(upperBand.toFixed(2)),
          middle: parseFloat(mean.toFixed(2)),
          lower: parseFloat(lowerBand.toFixed(2)),
        },
      },
      analysis: {
        trend,
        strength,
        support: parseFloat(support.toFixed(2)),
        resistance: parseFloat(resistance.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error fetching indicators:", error);
    return NextResponse.json(
      { error: "Failed to fetch indicators" },
      { status: 500 }
    );
  }
}
