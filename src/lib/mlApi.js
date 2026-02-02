import axios from 'axios';

const ML_API_BASE_URL = 'https://stock-price-prediction-8.onrender.com';

// Create axios instance with default config
const mlApiClient = axios.create({
  baseURL: ML_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML predictions
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Analyze stock and get prediction data with chart links
 * @param {string} ticker - Stock ticker symbol (e.g., MSFT, AAPL, TCS.NS)
 * @returns {Promise<Object>} Analysis results with prediction data and chart links
 */
export async function analyzeStock(ticker) {
  try {
    const response = await mlApiClient.post('/analyze_stock', {
      stock: ticker.toUpperCase(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error analyzing stock ${ticker}:`, error.message);
    throw new Error(`Failed to analyze stock: ${error.message}`);
  }
}

/**
 * Get raw prediction numbers for a stock
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object>} Raw prediction data
 */
export async function getPredictions(ticker) {
  try {
    const response = await mlApiClient.get(`/get_predictions/${ticker.toUpperCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting predictions for ${ticker}:`, error.message);
    throw new Error(`Failed to get predictions: ${error.message}`);
  }
}

/**
 * Get chart image URL for a specific stock
 * @param {string} ticker - Stock ticker symbol
 * @returns {string} Full URL to download the chart
 */
export function getChartUrl(ticker) {
  return `${ML_API_BASE_URL}/download_chart/${ticker.toUpperCase()}/prediction`;
}

/**
 * Download chart image as blob
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Blob>} Chart image blob
 */
export async function downloadChart(ticker) {
  try {
    console.log(`Requesting chart from ML API: ${ML_API_BASE_URL}/download_chart/${ticker.toUpperCase()}/prediction`);
    
    // Use fetch instead of axios for better blob handling
    const response = await fetch(`${ML_API_BASE_URL}/download_chart/${ticker.toUpperCase()}/prediction`, {
      method: 'GET',
      headers: {
        'Accept': 'image/png, image/jpeg, image/*',
      },
    });

    console.log('ML API Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ML API error response:', errorText);
      throw new Error(`ML API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const blob = await response.blob();
    console.log('Generated blob:', {
      size: blob.size,
      type: blob.type
    });

    return blob;
  } catch (error) {
    console.error(`Error downloading chart for ${ticker}:`, error.message);
    throw new Error(`Failed to download chart: ${error.message}`);
  }
}

/**
 * Health check for ML API
 * @returns {Promise<Object>} API health status
 */
export async function healthCheck() {
  try {
    const response = await mlApiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('ML API health check failed:', error.message);
    throw new Error(`ML API unavailable: ${error.message}`);
  }
}

export default {
  analyzeStock,
  getPredictions,
  getChartUrl,
  downloadChart,
  healthCheck,
};
