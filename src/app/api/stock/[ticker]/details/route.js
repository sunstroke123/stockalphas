import { NextResponse } from "next/server";
import { yahoo } from "@/lib/yahoo";
import { getCache, setCache } from "@/lib/cache";
import { getFinnhubQuote, getFinnhubProfile, getFinnhubMetrics } from "@/lib/finnhub";

export async function GET(req, ctx) {
  try {
    const { ticker } = await ctx.params;
    const symbol = ticker.toUpperCase();

    // ✅ Cache first
    const cached = getCache(symbol);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ✅ Try Yahoo first, fallback to Finnhub if error
    let stockData;
    try {
      const data = await yahoo.quoteSummary(symbol, {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "summaryProfile",
          "recommendationTrend",
        ],
      });
      stockData = {
        ticker: symbol,
        name: data.price?.longName || symbol,
        price: data.price?.regularMarketPrice,
        change: data.price?.regularMarketChange,
        changePercent: data.price?.regularMarketChangePercent,
        marketCap: data.summaryDetail?.marketCap,
        peRatio: data.summaryDetail?.trailingPE,
        forwardPE: data.summaryDetail?.forwardPE,
        pegRatio: data.defaultKeyStatistics?.pegRatio,
        beta: data.defaultKeyStatistics?.beta,
        sector: data.summaryProfile?.sector,
        industry: data.summaryProfile?.industry,
        description: data.summaryProfile?.longBusinessSummary,
        provider: "yahoo"
      };
    } catch (yahooErr) {
      console.warn("Yahoo failed, falling back to Finnhub", yahooErr?.message || yahooErr);
      // Finnhub fallback
      const [quote, profile, metrics] = await Promise.all([
        getFinnhubQuote(symbol),
        getFinnhubProfile(symbol),
        getFinnhubMetrics(symbol)
      ]);
      stockData = {
        ticker: symbol,
        name: profile.name || profile.ticker || symbol,
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        marketCap: metrics.marketCapitalization || profile.marketCapitalization,
        peRatio: metrics.peNormalizedAnnual || metrics.peTTM,
        forwardPE: metrics.peForward,
        pegRatio: metrics.pegAnnual,
        beta: metrics.beta,
        sector: profile.finnhubIndustry,
        industry: profile.industry,
        description: profile.weburl || profile.name || symbol,
        provider: "finnhub"
      };
    }
    setCache(symbol, stockData, 60_000);
    return NextResponse.json(stockData);
  } catch (err) {
    console.error("Stock details error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stock details" },
      { status: 500 },
    );
  }
}
