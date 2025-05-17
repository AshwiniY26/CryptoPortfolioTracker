import React, { useState, useEffect } from 'react';
import { getCryptoPrice } from './api';
import PortfolioChart from './components/PortfolioChart';
import './App.css'; // for styling

// Main App component
const App = () => {
  // Portfolio state: stores coin names and quantities (e.g., bitcoin: 2)
  const [portfolio, setPortfolio] = useState<{ [coin: string]: number }>({
    bitcoin: 2,
    ethereum: 5,
  });

  // Total value of all coins in portfolio
  const [portfolioValue, setPortfolioValue] = useState<number>(0);

  // Portfolio history: to show graph over time
  const [portfolioHistory, setPortfolioHistory] = useState<{ labels: string[], values: number[] }>({
    labels: [],
    values: [],
  });

  const [error, setError] = useState<string | null>(null); // error handling

  // Form input states for adding new coins
  const [newCoin, setNewCoin] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);

  // Order history states
  const [buyHistory, setBuyHistory] = useState<any[]>([]);
  const [sellHistory, setSellHistory] = useState<any[]>([]);

  // Popup and tab state for viewing order history
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // Sorting configuration for order history tables
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const [selectedCoin, setSelectedCoin] = useState<string>('all'); // default to 'all'


  // Function to sort buy/sell data based on selected column
  const getSortedData = (data: any[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Function to update sorting based on column click
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Calculate total portfolio value using live prices
  const updatePortfolioValue = async () => {
    let totalValue = 0;

    for (const coin in portfolio) {
      const priceData = await getCryptoPrice(coin);
      if (priceData && priceData[coin]) {
        totalValue += priceData[coin].usd * portfolio[coin];
      }
    }

    setPortfolioValue(totalValue);

    // Save timestamp and value for chart
    const currentTime = new Date().toLocaleTimeString();
    setPortfolioHistory((prev) => ({
      labels: [...prev.labels, currentTime],
      values: [...prev.values, totalValue],
    }));
  };

  // This runs every time portfolio changes (buy/sell)
  useEffect(() => {
    const fetchData = async () => {
      try {
        await updatePortfolioValue();
      } catch (err) {
        setError("Error updating portfolio value");
      }
    };
    fetchData();
  }, [portfolio]);

  // Function to add or update coin in portfolio
  const handleAddCoin = async () => {
    if (!newCoin || newAmount <= 0) {
      alert("Enter a valid coin name and amount");
      return;
    }

    const priceData = await getCryptoPrice(newCoin);
    const currentPrice = priceData?.[newCoin.toLowerCase()]?.usd || 0;
    const currentTime = new Date().toLocaleString();

    // Update portfolio with new amount
    setPortfolio((prev) => ({
      ...prev,
      [newCoin.toLowerCase()]: (prev[newCoin.toLowerCase()] || 0) + newAmount,
    }));

    // Add to buy history
    setBuyHistory((prev) => ([
      ...prev,
      {
        coin: newCoin.toLowerCase(),
        quantity: newAmount,
        price: currentPrice,
        time: currentTime,
      }
    ]));

    // Clear input fields
    setNewCoin("");
    setNewAmount(0);
  };

  // Function to sell 1 unit of a coin
  const handleSellCoin = async (coin: string, amount: number) => {
    if (!portfolio[coin] || portfolio[coin] < amount) {
      alert("Not enough coins to sell");
      return;
    }

    const priceData = await getCryptoPrice(coin);
    const currentPrice = priceData?.[coin]?.usd || 0;
    const currentTime = new Date().toLocaleString();

    // Update portfolio by reducing amount
    const updatedPortfolio = { ...portfolio };
    updatedPortfolio[coin] -= amount;
    if (updatedPortfolio[coin] === 0) delete updatedPortfolio[coin];
    setPortfolio(updatedPortfolio);

    // Add to sell history
    setSellHistory((prev) => ([
      ...prev,
      {
        coin,
        quantity: amount,
        price: currentPrice,
        time: currentTime,
      }
    ]));
  };

  // JSX for UI rendering
  return (
    <div>
      <h1>Crypto Portfolio Tracker</h1>
      <h2>Track your portfolio's real-time value</h2>

      <div>
        <h3>Total Portfolio Value: ${portfolioValue.toFixed(2)}</h3>
      </div>

      <PortfolioChart data={portfolioHistory} />

      {/* Add Coin Form */}
      <div>
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

      {/* Portfolio List */}
      <div>
        <h3>Your Portfolio:</h3>
        <ul>
          {Object.entries(portfolio).map(([coin, amount]) => (
            <li key={coin}>
              {coin}: {amount} units
              <button onClick={() => handleSellCoin(coin, 1)}>Sell 1</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Show Order History */}
      <div style={{ marginTop: '30px' }}>
        <button onClick={() => setShowPopup(true)}>Order History</button>
      </div>

      {/* Popup Display for Order History */}
      {showPopup && (
        <div className="order-popup">
          <button onClick={() => setShowPopup(false)}>Close</button>
          <h3>Order History</h3>

          {/* Coin Filter Dropdown */}
  <div>
    <label>Select Coin: </label>
    <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
      <option value="all">All Coins</option>
      <option value="bitcoin">Bitcoin</option>
      <option value="ethereum">Ethereum</option>
      <option value="doge">Doge</option>
    </select>
  </div>

          {/* Buy/Sell Tabs */}
          <div className="order-tabs">
            <button onClick={() => setActiveTab('buy')}>Purchase History</button>
            <button onClick={() => setActiveTab('sell')}>Sell History</button>
          </div>

          {/* Buy History Table */}
          {activeTab === 'buy' && (
            <div>
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
                        <th onClick={() => requestSort('coin')}>Coin</th>
                        <th onClick={() => requestSort('time')}>Time</th>
                        <th onClick={() => requestSort('price')}>Price (USD)</th>
                        <th onClick={() => requestSort('quantity')}>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedData(
  selectedCoin === 'all'
    ? buyHistory
    : buyHistory.filter((entry) => entry.coin === selectedCoin)
).map((entry, index) => (

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

          {/* Sell History Table */}
          {activeTab === 'sell' && (
            <div>
              {sellHistory.length === 0 ? (
                <p>No coins are sold yet.</p>
              ) : (
                <table className="order-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('coin')}>Coin</th>
                      <th onClick={() => requestSort('time')}>Time</th>
                      <th onClick={() => requestSort('price')}>Price (USD)</th>
                      <th onClick={() => requestSort('quantity')}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(
  selectedCoin === 'all'
    ? sellHistory
    : sellHistory.filter((entry) => entry.coin === selectedCoin)
).map((entry, index) => (

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
};

export default App;
