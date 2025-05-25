// We'll now enhance your Crypto Portfolio Tracker
// Step 1: Add order history tracking states

import React, { useState, useEffect } from 'react';
import { getCryptoPrice } from './api';
import PortfolioChart from './components/PortfolioChart';
import './App.css';


const App = () => {
  const [portfolio, setPortfolio] = useState<{ [coin: string]: number }>({
    bitcoin: 2,
    ethereum: 5,
  });

  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioHistory, setPortfolioHistory] = useState<{ labels: string[], values: number[] }>({
    labels: [],
    values: [],
  });
  const [error, setError] = useState<string | null>(null);

  const [newCoin, setNewCoin] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);

  // 🆕 Order History States
  const [buyHistory, setBuyHistory] = useState<any[]>([]);
  const [sellHistory, setSellHistory] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const [validCoinIDs, setValidCoinIDs] = useState<string[]>([]);

  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
const [selectedCoinPrice, setSelectedCoinPrice] = useState<number | null>(null);
// 🆕 Sell Form State
const [sellCoin, setSellCoin] = useState("");
const [sellAmount, setSellAmount] = useState<number>(0);

  const updatePortfolioValue = async () => {
    let totalValue = 0;

    for (const coin in portfolio) {
      const priceData = await getCryptoPrice(coin);
      if (priceData && priceData[coin]) {
        totalValue += priceData[coin].usd * portfolio[coin];
      }
    }

    setPortfolioValue(totalValue);

    const currentDate = new Date().toLocaleTimeString();
    setPortfolioHistory((prev) =>  {
    // Only add if value changed
    if (
      prev.values.length === 0 ||
      prev.values[prev.values.length - 1] !== totalValue
    ) {
      return {
        labels: [...prev.labels, currentDate],
        values: [...prev.values, totalValue],
      };
    }
    return prev;
  });
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        await updatePortfolioValue();
      } catch (err) {
        setError('Error updating portfolio value');
      }
    };
    fetchData();
  }, [portfolio]);
  // 🔁 Fetch valid coin IDs from CoinGecko when the app loads
useEffect(() => {
  const fetchValidCoinIDs = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
      const data = await res.json();

      // Extract all coin IDs and convert to lowercase
      const ids = data.map((coin: any) => coin.id.toLowerCase());
      setValidCoinIDs(ids);
    } catch (err) {
      console.error("Failed to fetch coin list from CoinGecko");
    }
  };

  fetchValidCoinIDs();
}, []);


  // 🆕 Buy Function
  const handleAddCoin = async () => {
  if (!newCoin || newAmount <= 0) {
    alert("Please enter a valid coin name and amount.");
    return;
  }
const coinId = newCoin.trim().toLowerCase(); // sanitize input

// 🔍 Check if it's a valid CoinGecko coin
  if (!validCoinIDs.includes(coinId)) {
    alert("Invalid coin. This cryptocurrency does not exist on CoinGecko.");
    return;
  }
 
   try {
    const priceData = await getCryptoPrice(coinId);
  const currentPrice = priceData?.[coinId]?.usd || 0;
  const currentTime = new Date().toLocaleString();
  

    setPortfolio((prevPortfolio) => ({
    ...prevPortfolio,
    [coinId]: (prevPortfolio[coinId] || 0) + newAmount,
  }));

    setBuyHistory((prev) => [
    ...prev,
    {
      coin: coinId,
      quantity: newAmount,
      price: currentPrice,
      time: currentTime,
    },
  ]);

  setNewCoin("");
  setNewAmount(0);
  } catch (error) {
    alert("Error fetching price. Try again.");
  }
};
  // 🆕 Sell Function
  const handleSellCoin = async (coin: string, amount: number) => {
    // ✅ Check if you have enough coins to sell
    if (!portfolio[coin] || portfolio[coin] < amount) {
      alert("Not enough coins to sell");
      return;
    }
  // 💵 Get the current price of the coin
    const priceData = await getCryptoPrice(coin);
    const currentPrice = priceData?.[coin]?.usd || 0;
    const currentTime = new Date().toLocaleString();
// 🧮 Update your portfolio by subtracting sold coins
    const updatedPortfolio = { ...portfolio };
    updatedPortfolio[coin] -= amount;
    // ❌ Remove coin if count becomes 0
    if (updatedPortfolio[coin] === 0) delete updatedPortfolio[coin];
    setPortfolio(updatedPortfolio); // 🆕 Update state
  // 📝 Record sell history
    setSellHistory((prev) => ([
      ...prev,
      {
        coin,
        quantity: amount,
        price: currentPrice,
        time: currentTime
      }
    ]));
    // 🔁 Recalculate portfolio value after selling
  await updatePortfolioValue();
  };
 //Handle coin click to fetch price
 const handleCoinClick = async (coin: string) => {
  setSelectedCoin(coin);
  const priceData = await getCryptoPrice(coin);
  const currentPrice = priceData?.[coin]?.usd || 0;
  setSelectedCoinPrice(currentPrice);
};

  return (
  
  <div>
    <h1>Crypto Portfolio Tracker</h1>
    <h2>Track your portfolio's real-time value</h2>

    <div>
      <h3>Total Portfolio Value: ${portfolioValue.toFixed(2)}</h3>
    </div>

    <PortfolioChart data={portfolioHistory} />

    <div style={{ marginBottom: '20px' }}>
      <h3>Add or Update a Coin</h3>
      <input
        type="text"
        placeholder="Coin ID (e.g., bitcoin)"
        value={newCoin}
        onChange={(e) => setNewCoin(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={newAmount}
        onChange={(e) => setNewAmount(Number(e.target.value))}
      />
      <button onClick={handleAddCoin}>Add / Update</button>
    </div>
{/* 🛒 Sell Coin Form */}
<div style={{ marginBottom: '20px' }}>
  <h3>Sell a Coin</h3>
  <input
    type="text"
    placeholder="Coin ID (e.g., bitcoin)"
    value={sellCoin}
    onChange={(e) => setSellCoin(e.target.value)} // 🔄 Update coin to sell
  />
  <input
    type="number"
    placeholder="Amount to sell"
    value={sellAmount}
    onChange={(e) => setSellAmount(Number(e.target.value))} // 🔄 Update quantity to sell
  />
  <button onClick={async () => {
    const trimmedCoin = sellCoin.trim().toLowerCase();

    if (!trimmedCoin || sellAmount <= 0) {
      alert("Please enter a valid coin and amount to sell.");
      return;
    }

    if (!portfolio[trimmedCoin] || portfolio[trimmedCoin] < sellAmount) {
      alert("You don't have enough coins to sell.");
      return;
    }

    await handleSellCoin(trimmedCoin, sellAmount); // 🧠 Sell logic

    // 🧽 Clear form after selling
    setSellCoin("");
    setSellAmount(0);
  }}>
    Sell
  </button>
</div>

    <div style={{ marginBottom: '20px' }}>
      <h3>Your Portfolio:</h3>
      <ul>
        {Object.entries(portfolio).map(([coin, amount]) => (
  <li key={coin} onClick={() => handleCoinClick(coin)} style={{ cursor: 'pointer', color: 'blue' }}>
    {coin}: {amount} units
    <button onClick={(e) => {
      e.stopPropagation(); // prevent parent click
      handleSellCoin(coin, 1);
    }}>
      Sell 1
    </button> 
  </li>
))}
      </ul>
    </div>
{selectedCoin && (
  <div style={{ marginBottom: '20px' }} className="coin-details">
    <h3>Details for {selectedCoin}</h3>
    <p>Quantity: {portfolio[selectedCoin]}</p>
    <p>Current Price: ${selectedCoinPrice}</p>
    <p>Total Value: ${(portfolio[selectedCoin] * selectedCoinPrice!).toFixed(2)}</p>

    <h4>Transaction History:</h4>
    <ul>
      {buyHistory
        .filter(entry => entry.coin === selectedCoin)
        .map((entry, index) => (
          <li key={`buy-${index}`}>
            🟢 Bought {entry.quantity} at ${entry.price} on {entry.time}
          </li>
        ))}

      {sellHistory
        .filter(entry => entry.coin === selectedCoin)
        .map((entry, index) => (
          <li key={`sell-${index}`}>
            🔴 Sold {entry.quantity} at ${entry.price} on {entry.time}
          </li>
        ))}
    </ul>

    <button onClick={() => setSelectedCoin(null)}>Close</button>
  </div>
)}

    {/* 👇 Move Order History button to bottom */}
    <div style={{ marginTop: '20px' }}>
      <button onClick={() => setShowPopup(true)}>Order History</button>
    </div>

    {showPopup && (
  <div style={{ marginTop: '20px' }} className="order-popup">
    <button onClick={() => setShowPopup(false)}>Close</button>
    <h3>Order History</h3>

    <div style={{ marginTop: '20px' }} className="order-tabs">
      <button onClick={() => setActiveTab('buy')}>Purchase History</button>
      <button onClick={() => setActiveTab('sell')}>Sell History</button>
    </div>

    {activeTab === 'buy' && (
      <div style={{ marginTop: '20px' }}>
        {buyHistory.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          <>
            <p>
              <strong>Total Quantity:</strong>{" "}
              {buyHistory.reduce((acc, entry) => acc + entry.quantity, 0)} <br />
              <strong>Portfolio Value:</strong> $
              {buyHistory.reduce((acc, entry) => acc + entry.quantity * entry.price, 0).toFixed(2)}
            </p>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Time</th>
                  <th>Price (USD)</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {buyHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.coin}</td>
                    <td>{entry.time}</td>
                    <td>${entry.price}</td>
                    <td>{entry.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    )}

    {activeTab === 'sell' && (
      <div style={{ marginTop: '20px' }}>
        {sellHistory.length === 0 ? (
          <p>No coins are sold yet.</p>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Time</th>
                <th>Price (USD)</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {sellHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.coin}</td>
                  <td>{entry.time}</td>
                  <td>${entry.price}</td>
                  <td>{entry.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
            </div>
    )}
  </div>
);


}
export default App;
