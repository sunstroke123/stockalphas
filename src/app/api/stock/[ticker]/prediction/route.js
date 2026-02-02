import { NextResponse } from "next/server";
import { analyzeStock, getPredictions, getChartUrl } from "@/lib/mlApi";
import { getFinnhubQuote } from "@/lib/finnhub";

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
    
    console.log("Fetching prediction:", ticker);
    const { searchParams } = new URL(req.url);
    const useML = searchParams.get("ml") !== "false";

    // Try Yahoo first, fallback to Finnhub
    let currentPrice = null;
    try {
      const yahooModule = await import("yahoo-finance2");
      const YahooFinance = yahooModule.default;
      const yahooFinance = new YahooFinance();
      const stockData = await yahooFinance.quote(ticker.toUpperCase());
      currentPrice = stockData.regularMarketPrice;
    } catch (yahooErr) {
      // Fallback to Finnhub
      try {
        const finnhubQuote = await getFinnhubQuote(ticker.toUpperCase());
        currentPrice = finnhubQuote.c;
      } catch (finnhubErr) {
        throw new Error("Failed to fetch current price from Yahoo and Finnhub");
      }
    }

    let mlPrediction = null;
    let mlError = null;

    // ------------ ML MODEL PREDICTION ------------
    if (useML) {
      try {
        const [analysisResult, predictionData] = await Promise.all([
          analyzeStock(ticker).catch((err) => {
            console.error("ML analysis error:", err);
            return null;
          }),
          getPredictions(ticker).catch((err) => {
            console.error("ML prediction error:", err);
            return null;
          }),
        ]);

        if (analysisResult && predictionData) {
          mlPrediction = {
            predicted_price:
              predictionData.predictions?.[0]?.Predicted_Close ||
              analysisResult.data_preview?.[0]?.Predicted_Close,
            chart_url: getChartUrl(ticker, "prediction"),
            analysis_message: analysisResult.message,
            model_used: "ML_LSTM",
          };
        }
      } catch (error) {
        mlError = error.message;
        console.error("ML API error:", error);
      }
    }

    // ------------ TECHNICAL ANALYSIS FALLBACK ------------
    let technicalPrediction = null;

    if (!mlPrediction || mlError) {
      let closePrices = [];
      let volumes = [];
      let n = 0;
      // Try Yahoo for historical, fallback to Finnhub (current only)
      try {
        const yahooModule = await import("yahoo-finance2");
        const YahooFinance = yahooModule.default;
        const yahooFinance = new YahooFinance();
        const history = await yahooFinance.historical(ticker.toUpperCase(), {
          period1: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          period2: new Date(),
          interval: "1d",
        });
        closePrices = history.map((h) => h.close);
        volumes = history.map((h) => h.volume);
        n = Math.min(closePrices.length, 20);
      } catch (yahooErr) {
        // Fallback to Finnhub (current price only)
        try {
          const finnhubQuote = await getFinnhubQuote(ticker.toUpperCase());
          closePrices = [finnhubQuote.c];
          volumes = [finnhubQuote.v];
          n = 1;
        } catch (finnhubErr) {
          throw new Error("Failed to fetch historical prices from Yahoo and Finnhub");
        }
      }
      const recentPrices = closePrices.slice(-n);
      // Linear regression
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += recentPrices[i];
        sumXY += i * recentPrices[i];
        sumX2 += i * i;
      }
      const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
      const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;
      const predictedPrice = slope * (n + 5) + intercept;
      // Volatility
      const mean = n > 0 ? recentPrices.reduce((a, b) => a + b, 0) / n : 0;
      const variance = n > 0 ? recentPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / n : 0;
      const volatility = Math.sqrt(variance);
      // Trend signal
      const priceChange = n > 0 ? ((currentPrice - recentPrices[0]) / recentPrices[0]) * 100 : 0;
      let signal = "HOLD";
      if (priceChange > 5 && slope > 0) signal = "BUY";
      else if (priceChange < -5 && slope < 0) signal = "SELL";
      // Risk
      const avgVolatility = currentPrice ? volatility / currentPrice : 0;
      let risk = "MEDIUM";
      if (avgVolatility > 0.03) risk = "HIGH";
      else if (avgVolatility < 0.015) risk = "LOW";
      // Confidence
      const trendConsistency = n > 0 ? recentPrices.filter((p, i) => {
        if (i === 0) return true;
        return slope > 0 ? p >= recentPrices[i - 1] : p <= recentPrices[i - 1];
      }).length / n : 0;
      const confidence = parseFloat(Math.min(trendConsistency * 0.9, 0.85).toFixed(2));
      // Volume analysis
      const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
      const recentVolume = volumes.length >= 5 ? volumes.slice(-5).reduce((a, b) => a + b, 0) / 5 : avgVolume;
      const volumeImpact =
        recentVolume > avgVolume * 1.2
          ? "POSITIVE"
          : recentVolume < avgVolume * 0.8
          ? "NEGATIVE"
          : "NEUTRAL";
      const technicalImpact =
        slope > 0 ? "POSITIVE" : slope < 0 ? "NEGATIVE" : "NEUTRAL";
      technicalPrediction = {
        predicted_price: parseFloat(predictedPrice.toFixed(2)),
        signal,
        risk,
        confidence,
        model_used: "LINEAR_REGRESSION",
        factors: [
          { name: "Technical Analysis", weight: 0.35, impact: technicalImpact },
          {
            name: "Market Sentiment",
            weight: 0.25,
            impact: priceChange > 0 ? "POSITIVE" : "NEGATIVE",
          },
          { name: "Volume Analysis", weight: 0.2, impact: volumeImpact },
          {
            name: "Trend Momentum",
            weight: 0.2,
            impact: Math.abs(slope) > 1 ? "POSITIVE" : "NEUTRAL",
          },
        ],
      };
    }

    // -------- FINAL PREDICTION RESULT --------

    const prediction = mlPrediction || technicalPrediction;

    const predictedPrice = prediction.predicted_price;

    const priceChangePct =
      ((predictedPrice - currentPrice) / currentPrice) * 100;

    let signal = "HOLD";
    if (priceChangePct > 5) signal = "BUY";
    else if (priceChangePct < -5) signal = "SELL";

    let risk = "MEDIUM";
    if (Math.abs(priceChangePct) > 10) risk = "HIGH";
    else if (Math.abs(priceChangePct) < 3) risk = "LOW";

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      predicted_price: parseFloat(predictedPrice.toFixed(2)),
      current_price: parseFloat(currentPrice.toFixed(2)),
      price_change: parseFloat(priceChangePct.toFixed(2)),
      signal: technicalPrediction?.signal || signal,
      risk: technicalPrediction?.risk || risk,
      confidence:
        technicalPrediction?.confidence || (mlPrediction ? 0.82 : 0.75),
      timeframe: "1 week",
      model: prediction.model_used,
      chart_url: mlPrediction?.chart_url || null,
      factors: technicalPrediction?.factors || [
        {
          name: "ML Model Prediction",
          weight: 0.4,
          impact: priceChangePct > 0 ? "POSITIVE" : "NEGATIVE",
        },
      ],
      recommendation: mlPrediction
        ? `Based on ML analysis, ${ticker.toUpperCase()} is predicted to ${
            priceChangePct > 0 ? "increase" : "decrease"
          } by ${Math.abs(priceChangePct).toFixed(1)}%.`
        : `Based on technical analysis, the signal is ${signal}.`,
      ml_available: !!mlPrediction,
      ml_error: mlError,
    });
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 }
    );
  }
}
