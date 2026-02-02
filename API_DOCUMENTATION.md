# Stock Alphas - API Documentation

## Overview
All backend APIs have been updated to use **real-time data from Yahoo Finance** and **MongoDB for persistent storage**. The mock data has been replaced with actual market data and database operations.

---

## Authentication
All endpoints (except auth routes) require authentication via NextAuth.js session.

### Register
- **POST** `/api/auth/register`
- Creates a new user account
- **Body**: `{ email, password, name }`
- **Returns**: User object or error

### Sign In
- **POST** `/api/auth/signin`
- Authenticates user with NextAuth
- **Body**: `{ email, password }`
- **Returns**: Session object

---

## Portfolio APIs

### Get Portfolio
- **GET** `/api/portfolio`
- Retrieves user's portfolio with real-time stock prices
- **Auth**: Required
- **Returns**:
```json
{
  "userId": "string",
  "totalValue": 125450.75,
  "totalCost": 110000.00,
  "totalGain": 15450.75,
  "totalGainPercent": 14.05,
  "holdings": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "quantity": 50,
      "avgPrice": 150.00,
      "currentPrice": 175.50,
      "totalValue": 8775.00,
      "totalCost": 7500.00,
      "gain": 1275.00,
      "gainPercent": 17.00
    }
  ],
  "performance": [
    { "date": "2024-01-01", "value": 110000 }
  ]
}
```
- **Data Source**: 
  - Transactions from MongoDB Portfolio collection
  - Real-time prices from Yahoo Finance API
  - Calculated holdings based on BUY/SELL transactions

### Add Transaction
- **POST** `/api/portfolio/transaction`
- Adds a buy or sell transaction to portfolio
- **Auth**: Required
- **Body**:
```json
{
  "ticker": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "price": 175.50,
  "date": "2024-01-15" // optional
}
```
- **Validation**:
  - Ticker must exist on Yahoo Finance
  - Type must be "BUY" or "SELL"
  - Quantity and price must be positive numbers
- **Returns**: Transaction confirmation
- **Database**: Saves to MongoDB Portfolio.transactions array

---

## Watchlist APIs

### Get Watchlist
- **GET** `/api/watchlist`
- Retrieves user's watchlist with real-time prices
- **Auth**: Required
- **Returns**:
```json
{
  "userId": "string",
  "items": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "price": 175.50,
      "change": 2.35,
      "changePercent": 1.36,
      "addedAt": "2024-10-15T10:30:00.000Z"
    }
  ]
}
```
- **Data Source**: 
  - Watchlist items from MongoDB
  - Real-time quotes from Yahoo Finance

### Add to Watchlist
- **POST** `/api/watchlist`
- Adds a stock to user's watchlist
- **Auth**: Required
- **Body**: `{ "ticker": "AAPL" }`
- **Validation**:
  - Ticker must exist on Yahoo Finance
  - Cannot add duplicate tickers
- **Returns**: Confirmation message
- **Database**: Saves to MongoDB Watchlist.items array

### Remove from Watchlist
- **DELETE** `/api/watchlist?ticker=AAPL`
- Removes a stock from watchlist
- **Auth**: Required
- **Query Param**: `ticker` (required)
- **Returns**: Confirmation message
- **Database**: Removes from MongoDB Watchlist.items array

---

## Stock Data APIs

### Get Stock Details
- **GET** `/api/stock/[ticker]/details`
- Fetches detailed real-time stock information
- **Auth**: Not required
- **Returns**:
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "price": 175.50,
  "change": 2.35,
  "changePercent": 1.36,
  "marketCap": "2.8T",
  "volume": "52.4M",
  "pe": 28.5,
  "high52Week": 198.23,
  "low52Week": 124.17,
  "description": "Apple is a technology company...",
  "open": 173.20,
  "previousClose": 173.15,
  "dayHigh": 176.80,
  "dayLow": 172.90
}
```
- **Data Source**: Yahoo Finance quote() API

### Get Stock History
- **GET** `/api/stock/[ticker]/history?period=1mo`
- Fetches historical price data
- **Auth**: Not required
- **Query Params**:
  - `period`: `1w`, `1mo`, `3mo`, `1y`, `5y` (default: `1mo`)
- **Returns**:
```json
{
  "ticker": "AAPL",
  "period": "1mo",
  "data": [
    {
      "date": "2024-01-01",
      "open": 170.25,
      "high": 175.50,
      "low": 169.80,
      "close": 174.20,
      "volume": 52483920
    }
  ]
}
```
- **Data Source**: Yahoo Finance historical() API

### Get Technical Indicators
- **GET** `/api/stock/[ticker]/indicators`
- Calculates technical indicators from historical data
- **Auth**: Not required
- **Returns**:
```json
{
  "ticker": "AAPL",
  "indicators": {
    "sma20": 172.45,
    "sma50": 168.20,
    "sma200": 165.80,
    "ema12": 173.10,
    "ema26": 170.50,
    "rsi": 58.4,
    "macd": {
      "macd": 2.60,
      "signal": 1.85,
      "histogram": 0.75
    },
    "bollingerBands": {
      "upper": 180.25,
      "middle": 172.45,
      "lower": 164.65
    }
  },
  "analysis": {
    "trend": "BULLISH",
    "strength": "MODERATE",
    "support": 168.50,
    "resistance": 178.20
  }
}
```
- **Data Source**: 
  - 200 days of historical data from Yahoo Finance
  - Calculated using custom technical analysis algorithms
- **Indicators Calculated**:
  - SMA (20, 50, 200 day)
  - EMA (12, 26 day)
  - RSI (14 period)
  - MACD (12, 26, 9)
  - Bollinger Bands (20 day, 2 std dev)
  - Support/Resistance levels

### Get Stock Prediction
- **GET** `/api/stock/[ticker]/prediction?ml=true`
- Generates stock price prediction using ML LSTM model (primary) with technical analysis fallback
- **Auth**: Not required
- **Query Params**:
  - `ml`: Use ML prediction (default: `true`). Set to `false` to use only technical analysis
- **Returns**:
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
  "factors": [
    {
      "name": "ML Model Prediction",
      "weight": 0.40,
      "impact": "POSITIVE"
    },
    {
      "name": "Historical Patterns",
      "weight": 0.30,
      "impact": "POSITIVE"
    },
    {
      "name": "Market Trends",
      "weight": 0.20,
      "impact": "POSITIVE"
    },
    {
      "name": "Technical Indicators",
      "weight": 0.10,
      "impact": "NEUTRAL"
    }
  ],
  "recommendation": "Based on advanced ML analysis...",
  "ml_available": true,
  "ml_error": null
}
```
- **Data Source**: 
  - Primary: ML LSTM Model (https://stock-price-prediction-8.onrender.com)
  - Fallback: 60 days of historical data from Yahoo Finance
  - Linear regression + volatility + trend analysis
- **Models**:
  - `ML_LSTM`: Advanced neural network prediction (primary)
  - `LINEAR_REGRESSION`: Technical analysis fallback

---

## Machine Learning API Routes

### Analyze Stock (ML)
- **POST** `/api/ml/analyze`
- Triggers ML analysis and returns prediction with chart links
- **Auth**: Not required
- **Body**:
```json
{
  "ticker": "MSFT"
}
```
- **Returns**:
```json
{
  "success": true,
  "ticker": "MSFT",
  "message": "Analysis complete for MSFT",
  "prediction": 513.94,
  "charts": {
    "prediction": "/download_chart/MSFT/prediction"
  },
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```
- **External API**: https://stock-price-prediction-8.onrender.com/analyze_stock

### Get ML Predictions
- **GET** `/api/ml/predictions/[ticker]`
- Retrieves raw ML prediction numbers
- **Auth**: Not required
- **Returns**:
```json
{
  "success": true,
  "ticker": "AAPL",
  "predictions": [
    {
      "Predicted_Close": 182.50
    }
  ],
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```
- **External API**: https://stock-price-prediction-8.onrender.com/get_predictions/{ticker}

### Get Prediction Chart
- **GET** `/api/ml/chart/[ticker]?type=prediction&download=false`
- Gets chart URL or downloads chart image
- **Auth**: Not required
- **Query Params**:
  - `type`: Chart type (default: `prediction`)
  - `download`: Download as file (default: `false`)
- **Returns** (when download=false):
```json
{
  "success": true,
  "ticker": "AAPL",
  "chart_type": "prediction",
  "chart_url": "https://stock-price-prediction-8.onrender.com/download_chart/AAPL/prediction",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```
- **Returns** (when download=true): PNG image file
- **External API**: https://stock-price-prediction-8.onrender.com/download_chart/{ticker}/{type}

### ML API Health Check
- **GET** `/api/ml/health`
- Checks if ML prediction service is operational
- **Auth**: Not required
- **Returns**:
```json
{
  "success": true,
  "ml_service": "https://stock-price-prediction-8.onrender.com",
  "status": "operational",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

---

## Database Models

### Portfolio Schema
```javascript
{
  userId: ObjectId (ref: User),
  transactions: [
    {
      ticker: String,
      type: "BUY" | "SELL",
      quantity: Number,
      price: Number,
      date: Date
    }
  ]
}
```

### Watchlist Schema
```javascript
{
  userId: ObjectId (ref: User) [unique],
  items: [
    {
      ticker: String,
      addedAt: Date
    }
  ]
}
```

### User Schema
```javascript
{
  email: String [unique],
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

---

## Error Handling

All endpoints return standard error responses:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not authenticated)
- **404**: Not Found
- **500**: Internal Server Error

---

## Data Sources

### Yahoo Finance Integration
- **Package**: `yahoo-finance2` v3.10.0
- **Rate Limits**: Respects Yahoo Finance API limits
- **Endpoints Used**:
  - `quote()` - Real-time stock quotes
  - `historical()` - Historical price data
  - Ticker validation

### ML Prediction Service Integration
- **Base URL**: https://stock-price-prediction-8.onrender.com
- **Model**: LSTM Neural Network for time series prediction
- **Package**: `axios` for HTTP requests
- **Timeout**: 30 seconds (ML predictions can take time)
- **Endpoints**:
  - `POST /analyze_stock` - Full analysis with charts
  - `GET /get_predictions/{ticker}` - Raw prediction data
  - `GET /download_chart/{ticker}/{type}` - Chart images
  - `GET /` - Health check
- **Fallback**: Technical analysis if ML service unavailable
- **Features**:
  - Advanced LSTM model predictions
  - Visual prediction charts
  - Historical pattern recognition
  - Confidence scores

### MongoDB Integration
- **Package**: `mongoose` v8.19.2
- **Connection**: Persistent connection via connection pool
- **Collections**:
  - `users` - User accounts
## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live price updates
2. **Advanced ML**: Expand ML model support (ensemble methods, transformers)
3. **News Integration**: Add sentiment analysis from news APIs
4. **Caching Layer**: Implement Redis for 1-minute quote caching and ML prediction caching
5. **Batch Operations**: Support bulk transaction imports
6. **Export Features**: CSV export for portfolio history
7. **Alerts System**: Price alerts and notifications
8. **Portfolio Analytics**: Sharpe ratio, beta, correlation analysis
9. **ML Model Monitoring**: Track prediction accuracy and model performance
10. **Chart Customization**: Allow users to customize prediction chart parameters

---- `Watchlist.userId` indexed with unique constraint
   - `User.email` indexed with unique constraint
4. **Parallel Requests**: Stock quotes fetched in parallel using `Promise.all()`

---

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live price updates
2. **Advanced ML**: Replace linear regression with LSTM/neural networks
3. **News Integration**: Add sentiment analysis from news APIs
4. **Caching Layer**: Implement Redis for 1-minute quote caching
5. **Batch Operations**: Support bulk transaction imports
6. **Export Features**: CSV export for portfolio history
7. **Alerts System**: Price alerts and notifications
8. **Portfolio Analytics**: Sharpe ratio, beta, correlation analysis

---

## Testing

### Test User Flows
1. Register → Login → View Empty Portfolio
2. Add Transaction → View Portfolio with Real Prices
3. Add to Watchlist → View Real-time Watchlist
### Dependencies
All required packages are installed:
- `yahoo-finance2` ✅
- `mongoose` ✅
- `next-auth` ✅
- `axios` ✅

### ML Service
- External ML API: https://stock-price-prediction-8.onrender.com
- Model: LSTM Neural Network
- Automatic fallback to technical analysis if ML unavailable
- 30-second timeout for ML requests

---

**Last Updated**: December 2025  
**API Version**: 2.1 (Real Data + ML Integration)  
**Status**: ✅ Production Ready with ML Predictions
### Environment Variables Required
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Dependencies
All required packages are installed:
- `yahoo-finance2` ✅
- `mongoose` ✅
- `next-auth` ✅
- `axios` ✅

---

**Last Updated**: January 2025  
**API Version**: 2.0 (Real Data)  
**Status**: ✅ Production Ready
