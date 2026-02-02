import { NextResponse } from "next/server";
import { analyzeStock, getPredictions, getChartUrl } from "@/lib/mlApi";

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

    // ✔ Correct import for yahoo-finance2 v3+
    const yahooModule = await import("yahoo-finance2");
    const YahooFinance = yahooModule.default;
    
    // ✔ Create an instance before using .quote()
    const yahooFinance = new YahooFinance();

    // Fetch current quote
    const stockData = await yahooFinance.quote(ticker.toUpperCase());
    const currentPrice = stockData.regularMarketPrice;

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
      const history = await yahooFinance.historical(ticker.toUpperCase(), {
        period1: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: "1d",
      });

      const closePrices = history.map((h) => h.close);
      const volumes = history.map((h) => h.volume);

      const n = Math.min(closePrices.length, 20);
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

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

      const intercept = (sumY - slope * sumX) / n;
      const predictedPrice = slope * (n + 5) + intercept;

      // Volatility
      const mean = recentPrices.reduce((a, b) => a + b, 0) / n;
      const variance =
        recentPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / n;
      const volatility = Math.sqrt(variance);

      // Trend signal
      const priceChange =
        ((currentPrice - recentPrices[0]) / recentPrices[0]) * 100;

      let signal = "HOLD";
      if (priceChange > 5 && slope > 0) signal = "BUY";
      else if (priceChange < -5 && slope < 0) signal = "SELL";

      // Risk
      const avgVolatility = volatility / currentPrice;
      let risk = "MEDIUM";
      if (avgVolatility > 0.03) risk = "HIGH";
      else if (avgVolatility < 0.015) risk = "LOW";

      // Confidence
      const trendConsistency =
        recentPrices.filter((p, i) => {
          if (i === 0) return true;
          return slope > 0
            ? p >= recentPrices[i - 1]
            : p <= recentPrices[i - 1];
        }).length / n;

      const confidence = parseFloat(
        Math.min(trendConsistency * 0.9, 0.85).toFixed(2)
      );

      // Volume analysis
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;

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
