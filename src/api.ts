import axios from 'axios';

// CoinGecko API endpoint
const BASE_URL = 'https://api.coingecko.com/api/v3/';

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
    const response = await axios.get(
      `${BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=${currency}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return null;
  }
};