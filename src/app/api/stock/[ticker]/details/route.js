import { NextResponse } from "next/server";

export async function OPTIONS() {
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

    console.log("Fetching stock:", ticker);

    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import("yahoo-finance2");
    const YahooFinance = yahooModule.default;

    // ✔ Create an instance with validation disabled and survey suppressed
    const yahooFinance = new YahooFinance({ 
      validation: { logErrors: false },
      suppressNotices: ['yahooSurvey']
    });

    // ✔ Get detailed stock data using quoteSummary for comprehensive financial metrics
    const quoteData = await yahooFinance.quote(ticker.toUpperCase(), {}, { 
      validateResult: false,
      return: "object" 
    });

    // Get comprehensive financial data including PEG ratio and Beta
    const summaryData = await yahooFinance.quoteSummary(ticker.toUpperCase(), {
      modules: [
        'summaryDetail',
        'defaultKeyStatistics', 
        'financialData',
        'price',
        'summaryProfile',
        'recommendationTrend'
      ]
    }, { validateResult: false });

    console.log("Data received:", ticker);

    // Handle validation errors by extracting data from error result
    let stockData = quoteData;
    if (quoteData && quoteData.result && Array.isArray(quoteData.result)) {
      stockData = quoteData.result[0];
    }

    // Merge summary data for detailed financial metrics
    let detailedData = {};
    if (summaryData) {
      detailedData = {
        ...summaryData.summaryDetail,
        ...summaryData.defaultKeyStatistics,
        ...summaryData.financialData,
        ...summaryData.price,
        ...summaryData.summaryProfile,
        ...summaryData.recommendationTrend
      };
    }

    // Combine both data sources
    stockData = { ...stockData, ...detailedData };

    // Debug: Log PEG and Beta availability
    console.log('PEG Ratio available:', stockData.pegRatio || stockData.trailingPegRatio || 'Not found');
    console.log('Beta available:', stockData.beta || stockData.beta3Year || 'Not found');

    // Utility
    const formatNumber = (num) => {
      if (!num) return "N/A";
      if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toString();
    };

    const response = {
      ticker: ticker.toUpperCase(),
      name: stockData.longName || stockData.shortName || ticker.toUpperCase(),

      // Basic price data
      price: Number((stockData.regularMarketPrice || 0).toFixed(2)),
      change: Number((stockData.regularMarketChange || 0).toFixed(2)),
      changePercent: Number((stockData.regularMarketChangePercent || 0).toFixed(2)),

      // Volume and market data
      volume: stockData.regularMarketVolume || stockData.volume || 0,
      marketCap: stockData.marketCap || stockData.market_cap || stockData.marketCapitalization || null,
      marketCapFormatted: formatNumber(stockData.marketCap || stockData.market_cap || stockData.marketCapitalization),
      averageVolume: stockData.averageVolume || stockData.averageDailyVolume3Month || stockData.avgVolume || null,
      sharesOutstanding: stockData.sharesOutstanding || stockData.impliedSharesOutstanding || stockData.shares_outstanding || null,

      // Trading ranges
      open: Number((stockData.regularMarketOpen || 0).toFixed(2)),
      previousClose: Number((stockData.regularMarketPreviousClose || 0).toFixed(2)),
      dayHigh: Number((stockData.regularMarketDayHigh || 0).toFixed(2)),
      dayLow: Number((stockData.regularMarketDayLow || 0).toFixed(2)),
      bid: stockData.bid ? Number(stockData.bid.toFixed(2)) : null,
      ask: stockData.ask ? Number(stockData.ask.toFixed(2)) : null,
      bidSize: stockData.bidSize || null,
      askSize: stockData.askSize || null,
      fiftyTwoWeekHigh: stockData.fiftyTwoWeekHigh
        ? Number(stockData.fiftyTwoWeekHigh.toFixed(2))
        : null,
      fiftyTwoWeekLow: stockData.fiftyTwoWeekLow
        ? Number(stockData.fiftyTwoWeekLow.toFixed(2))
        : null,

      // Financial metrics - try multiple field names
      peRatio: stockData.trailingPE || stockData.peRatio || stockData.pe || null,
      forwardPE: stockData.forwardPE || stockData.forwardPe || null,
      priceToBook: stockData.priceToBook || stockData.pbRatio || null,
      pegRatio: stockData.pegRatio || stockData.trailingPegRatio || stockData.peg || null,
      
      // Earnings and dividends - try multiple field names
      eps: stockData.trailingEps || stockData.eps || stockData.epsTrailingTwelveMonths || null,
      forwardEps: stockData.forwardEps || stockData.epsForward || null,
      dividendYield: stockData.dividendYield || stockData.yield || null,
      dividendRate: stockData.dividendRate || stockData.trailingAnnualDividendRate || null,
      exDividendDate: stockData.exDividendDate || stockData.exDate || null,
      
      // Risk metrics - try multiple field names
      beta: stockData.beta || stockData.beta3Year || stockData.betaRisk || null,
      
      // Analyst data
      targetPrice: stockData.targetMeanPrice ? Number(stockData.targetMeanPrice.toFixed(2)) : null,
      recommendationMean: stockData.recommendationMean ? Number(stockData.recommendationMean.toFixed(2)) : null,
      numberOfAnalystOpinions: stockData.numberOfAnalystOpinions || null,
      
      // Additional financial data
      bookValue: stockData.bookValue ? Number(stockData.bookValue.toFixed(2)) : null,
      priceToSales: stockData.priceToSalesTrailing12Months ? Number(stockData.priceToSalesTrailing12Months.toFixed(2)) : null,
      enterpriseValue: stockData.enterpriseValue ? formatNumber(stockData.enterpriseValue) : null,
      ebitda: stockData.ebitda ? formatNumber(stockData.ebitda) : null,
      
      // Dates
      earningsDate: stockData.earningsTimestamp ? stockData.earningsTimestamp : null,
      lastFiscalYearEnd: stockData.lastFiscalYearEnd ? stockData.lastFiscalYearEnd : null,
      nextFiscalYearEnd: stockData.nextFiscalYearEnd ? stockData.nextFiscalYearEnd : null,
      
      // Business info - try multiple field names from various Yahoo Finance modules
      sector: stockData.sector || stockData.sectorDisp || stockData.sectorKey || null,
      industry: stockData.industry || stockData.industryDisp || stockData.industryKey || null,
      fullTimeEmployees: stockData.fullTimeEmployees || stockData.employees || stockData.companyOfficers?.length || null,
      website: stockData.website || stockData.websiteUrl || stockData.companyWebsite || null,
      
      description:
        stockData.longBusinessSummary ||
        stockData.businessSummary ||
        stockData.description ||
        `${stockData.longName || ticker.toUpperCase()} stock information.`,

      // Legacy fields for backwards compatibility
      pe: stockData.trailingPE ? Number(stockData.trailingPE.toFixed(2)) : null,
      high52Week: stockData.fiftyTwoWeekHigh
        ? Number(stockData.fiftyTwoWeekHigh.toFixed(2))
        : null,
      low52Week: stockData.fiftyTwoWeekLow
        ? Number(stockData.fiftyTwoWeekLow.toFixed(2))
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("DETAILED ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch stock details",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
