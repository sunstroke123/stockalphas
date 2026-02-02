import axios from "axios";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

if (!FINNHUB_API_KEY) {
  throw new Error("Missing FINNHUB_API_KEY in environment variables");
}

export async function getFinnhubQuote(symbol) {
  const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
  const { data } = await axios.get(url);
  return data;
}

export async function getFinnhubProfile(symbol) {
  const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
  const { data } = await axios.get(url);
  return data;
}

export async function getFinnhubMetrics(symbol) {
  const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${FINNHUB_API_KEY}`;
  const { data } = await axios.get(url);
  return data.metric || {};
}
