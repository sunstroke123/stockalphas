# ML Prediction API - Quick Start Guide

## Overview
The Stock Alphas platform now integrates with an advanced ML prediction service powered by LSTM neural networks for accurate stock price predictions.

## Architecture

```
Frontend/Client
    ↓
Next.js API Routes (/api/stock/[ticker]/prediction)
    ↓
ML API Client (src/lib/mlApi.js)
    ↓
External ML Service (stock-price-prediction-8.onrender.com)
    ↓
LSTM Model Predictions + Charts
```

## Quick Examples

### 1. Get Stock Prediction (Automatic ML)
```javascript
// Frontend code
const response = await fetch('/api/stock/AAPL/prediction');
const data = await response.json();

console.log(data.predicted_price);  // 182.50
console.log(data.model);            // "ML_LSTM"
console.log(data.chart_url);        // Chart image URL
console.log(data.confidence);       // 0.82
console.log(data.signal);           // "BUY" | "SELL" | "HOLD"
```

### 2. Use Only Technical Analysis (Skip ML)
```javascript
const response = await fetch('/api/stock/AAPL/prediction?ml=false');
const data = await response.json();

console.log(data.model);  // "LINEAR_REGRESSION"
```

### 3. Direct ML Analysis
```javascript
const response = await fetch('/api/ml/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ticker: 'MSFT' })
});

const data = await response.json();
console.log(data.prediction);  // 513.94
console.log(data.charts);      // { prediction: "/download_chart/MSFT/prediction" }
```

### 4. Get Raw ML Predictions
```javascript
const response = await fetch('/api/ml/predictions/TSLA');
const data = await response.json();

console.log(data.predictions);  // Array of prediction objects
```

### 5. Download Prediction Chart
```javascript
// Get chart URL
const response = await fetch('/api/ml/chart/AAPL?type=prediction');
const data = await response.json();
console.log(data.chart_url);  // Full URL to chart image

// Or download directly
const imageResponse = await fetch('/api/ml/chart/AAPL?type=prediction&download=true');
const blob = await imageResponse.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 6. Check ML Service Health
```javascript
const response = await fetch('/api/ml/health');
const data = await response.json();

if (data.success) {
  console.log('ML service is operational');
} else {
  console.log('ML service unavailable, using fallback');
}
```

## Response Structure

### Main Prediction Endpoint
```json
{
  "ticker": "AAPL",
  "predicted_price": 182.50,
  "current_price": 175.50,
  "price_change": 4.0,
  "signal": "BUY",
  "risk": "MEDIUM",
  "confidence": 0.82,
  "timeframe": "1 week",
  "model": "ML_LSTM",
  "chart_url": "https://stock-price-prediction-8.onrender.com/download_chart/AAPL/prediction",
  "factors": [...],
  "recommendation": "Based on advanced ML analysis...",
  "ml_available": true,
  "ml_error": null
}
```

## Signal Types
- **BUY**: Predicted price increase > 5%
- **SELL**: Predicted price decrease > 5%
- **HOLD**: Price change within ±5%

## Risk Levels
- **LOW**: Low volatility, stable trend (< 1.5% deviation)
- **MEDIUM**: Moderate volatility (1.5% - 3% deviation)
- **HIGH**: High volatility, uncertain trend (> 3% deviation)

## Model Types

### ML_LSTM (Primary)
- Advanced LSTM neural network
- Trained on historical patterns
- Confidence: 0.75 - 0.90
- Includes visual charts
- Fallback to technical analysis if unavailable

### LINEAR_REGRESSION (Fallback)
- Traditional technical analysis
- 20-day trend analysis
- Volatility-based risk assessment
- Volume and momentum indicators
- Confidence: 0.60 - 0.85

## Error Handling

The API automatically handles ML service failures:

```javascript
{
  "ml_available": false,
  "ml_error": "ML service timeout",
  "model": "LINEAR_REGRESSION",
  // ... fallback prediction data
}
```

## Supported Tickers

The ML service supports major US stocks:
- US Stocks: AAPL, MSFT, GOOGL, TSLA, AMZN, META, NVDA, etc.
- Indian Stocks: Use `.NS` suffix (e.g., TCS.NS, RELIANCE.NS)
- Check ticker validity with Yahoo Finance first

## Performance Notes

- ML predictions: ~5-10 seconds (first request may be slower)
- Technical fallback: ~1-2 seconds
- Chart generation: Included in analysis time
- Service timeout: 30 seconds
- Automatic retry: No (graceful fallback)

## Integration Example (React)

```jsx
import { useState, useEffect } from 'react';

function StockPrediction({ ticker }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch(`/api/stock/${ticker}/prediction`);
        const data = await res.json();
        setPrediction(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrediction();
  }, [ticker]);

  if (loading) return <div>Loading prediction...</div>;
  
  return (
    <div>
      <h2>{prediction.ticker} Prediction</h2>
      <p>Current: ${prediction.current_price}</p>
      <p>Predicted: ${prediction.predicted_price}</p>
      <p>Signal: {prediction.signal}</p>
      <p>Model: {prediction.model}</p>
      {prediction.chart_url && (
        <img src={prediction.chart_url} alt="Prediction Chart" />
      )}
      <p>{prediction.recommendation}</p>
    </div>
  );
}
```

## Best Practices

1. **Always check ml_available**: Know if you're getting ML or fallback predictions
2. **Cache predictions**: ML predictions are expensive, cache for 5-15 minutes
3. **Handle timeouts**: ML service may be slow on first request (cold start)
4. **Display model type**: Let users know which model generated the prediction
5. **Show confidence**: Display confidence score for transparency
6. **Validate tickers**: Check ticker validity before requesting predictions
7. **Error feedback**: Show user-friendly messages for ML failures

## Caching Strategy (Recommended)

```javascript
// Simple in-memory cache
const predictionCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getCachedPrediction(ticker) {
  const cached = predictionCache.get(ticker);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await fetch(`/api/stock/${ticker}/prediction`);
  const data = await response.json();
  
  predictionCache.set(ticker, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

## Troubleshooting

### ML Service Unavailable
**Problem**: Getting LINEAR_REGRESSION instead of ML_LSTM  
**Solution**: ML service may be cold starting (first request after idle). Wait 30s and retry.

### Timeout Errors
**Problem**: Request times out after 30s  
**Solution**: ML service is overloaded. System automatically falls back to technical analysis.

### Invalid Ticker
**Problem**: Error "Invalid ticker symbol"  
**Solution**: Verify ticker exists on Yahoo Finance. Use correct format (e.g., TCS.NS for Indian stocks).

### Chart Not Loading
**Problem**: chart_url returns 404  
**Solution**: Chart may still be generating. Wait a few seconds and retry the chart endpoint.

## Support

- ML Service: https://stock-price-prediction-8.onrender.com
- Model: LSTM Neural Network
- Maintainer: Stock Alphas Team
- Fallback: Always available (technical analysis)

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: ✅ Production Ready
