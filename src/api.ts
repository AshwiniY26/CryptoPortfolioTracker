import axios from 'axios';

// CoinGecko API endpoint
const BASE_URL = 'https://api.coingecko.com/api/v3/';

// Use a CORS proxy for local development
const PROXY = 'https://thingproxy.freeboard.io/fetch/';

// Function to fetch the current price of a given cryptocurrency
export const getCryptoData = async (coinId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}simple/price?ids=${coinId}&vs_currencies=usd`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
// Function to get the current price of a cryptocurrency
export const getCryptoPrice = async (cryptoId: string, currency = "usd") => {
  try {
  //construct the URL for the API request
  // use the CORS proxy for local development
    const url = `${PROXY}${BASE_URL}simple/price?ids=${cryptoId}&vs_currencies=${currency}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return null;
  }
};