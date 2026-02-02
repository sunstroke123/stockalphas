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

import { getFinnhubQuote } from "@/lib/finnhub";

export async function GET(req, ctx) {
  try {
    // Next.js 16: params is a Promise
    const { ticker } = await ctx.params;

    console.log("Fetching history:", ticker);

    let data = [];
    let period = "1mo";
    try {
      const yahooModule = await import("yahoo-finance2");
      const YahooFinance = yahooModule.default;
      const yahooFinance = new YahooFinance();
      const { searchParams } = new URL(req.url);
      period = searchParams.get("period") || "1mo";
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
      data = result.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        open: parseFloat(item.open.toFixed(2)),
        high: parseFloat(item.high.toFixed(2)),
        low: parseFloat(item.low.toFixed(2)),
        close: parseFloat(item.close.toFixed(2)),
        volume: item.volume,
      }));
    } catch (yahooErr) {
      // Fallback to Finnhub (current price only)
      try {
        const finnhubQuote = await getFinnhubQuote(ticker.toUpperCase());
        data = [{
          date: new Date().toISOString().split("T")[0],
          open: finnhubQuote.o,
          high: finnhubQuote.h,
          low: finnhubQuote.l,
          close: finnhubQuote.c,
          volume: finnhubQuote.v,
        }];
      } catch (finnhubErr) {
        throw new Error("Failed to fetch stock history from Yahoo and Finnhub");
      }
    }
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
