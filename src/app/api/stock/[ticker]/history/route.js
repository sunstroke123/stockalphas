import { NextResponse } from "next/server";

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

    console.log("Fetching history:", ticker);

    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import("yahoo-finance2");
    const YahooFinance = yahooModule.default;
    
    // ✔ Create an instance before using .historical()
    const yahooFinance = new YahooFinance();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "1mo";

    // Map period to Yahoo Finance intervals
    const periodMap = {
      "1w": {
        period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        interval: "1d",
      },
      "1mo": {
        period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        interval: "1d",
      },
      "3mo": {
        period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        interval: "1d",
      },
      "1y": {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        interval: "1d",
      },
      "5y": {
        period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
        interval: "1wk",
      },
    };

    const config = periodMap[period] || periodMap["1mo"];

    const result = await yahooFinance.historical(ticker.toUpperCase(), {
      period1: config.period1,
      period2: new Date(),
      interval: config.interval,
    });

    const data = result.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      open: parseFloat(item.open.toFixed(2)),
      high: parseFloat(item.high.toFixed(2)),
      low: parseFloat(item.low.toFixed(2)),
      close: parseFloat(item.close.toFixed(2)),
      volume: item.volume,
    }));

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      period,
      data,
    });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock history" },
      { status: 500 }
    );
  }
}
