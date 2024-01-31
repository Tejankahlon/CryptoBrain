import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimulatedTrading = () => {
    const [coins, setCoins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [marketPrice, setMarketPrice] = useState(null);
    const [dollarAmount, setDollarAmount] = useState('');
    const [currentBalance, setCurrentBalance] = useState(1000000);
    const [holdings, setHoldings] = useState({});

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/coins');
                if (Array.isArray(response.data)) {
                    setCoins(response.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setCoins([]); // Set to empty array in case of unexpected data format
                }
            } catch (error) {
                console.error('Error fetching coins:', error);
                setCoins([]); // Ensure coins is set to an empty array on error
            }
        };

        fetchCoins();
    }, []);

    useEffect(() => {
        const fetchMarketPrice = async () => {
            if (selectedCoin) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/price/${selectedCoin.id}`);
                    setMarketPrice(response.data[selectedCoin.id].usd);
                } catch (error) {
                    console.error('Error fetching market price:', error);
                }
            }
        };

        fetchMarketPrice();
    }, [selectedCoin]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleMarketOrder = (type) => {
        const amount = parseFloat(dollarAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid dollar amount.');
            return;
        }

        const quantity = amount / marketPrice;

        if (type === 'buy' && amount <= currentBalance) {
            setCurrentBalance(prev => prev - amount);
            setHoldings(prev => ({ ...prev, [selectedCoin.id]: (prev[selectedCoin.id] || 0) + quantity }));
        } else if (type === 'sell') {
            if (quantity <= (holdings[selectedCoin.id] || 0)) {
                setCurrentBalance(prev => prev + amount);
                setHoldings(prev => {
                    const updatedHoldings = { ...prev, [selectedCoin.id]: prev[selectedCoin.id] - quantity };
                    if (updatedHoldings[selectedCoin.id] <= 0) {
                        delete updatedHoldings[selectedCoin.id]; // Removes the coin from holdings if quantity is 0
                    }
                    return updatedHoldings;
                });
            } else {
                alert('Insufficient holdings for this transaction.');
            }
        } else {
            alert('Insufficient balance for this transaction.');
        }
        setDollarAmount('');
    };

    const displayCoins = Array.isArray(coins) && searchTerm
        ? coins.filter(coin => coin.name.toLowerCase().includes(searchTerm))
        : [];

    return (
        <div className='simulated-trading'>
            <h1>Simulated Trading</h1>
            <input
                type="text"
                placeholder="Search for a coin..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            {displayCoins.map(coin => (
                <div key={coin.id} onClick={() => {
                    setSelectedCoin(coin);
                    setSearchTerm(''); // Clears out the input field and hides the dropdown
                }}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                </div>
            ))}
            <h4>Current Balance: ${currentBalance.toFixed(2)}</h4>
            <input
                type="number"
                value={dollarAmount}
                onChange={(e) => setDollarAmount(e.target.value)}
                placeholder="Dollar Amount"
            />
            <button onClick={() => handleMarketOrder('buy')}>Buy</button>
            <button onClick={() => handleMarketOrder('sell')}>Sell</button>
            {selectedCoin && (
                <>
                    <h2>{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</h2>
                    <h3>Market Price: ${marketPrice ? marketPrice.toFixed(2) : 'Loading...'}</h3>
                </>
            )}
            <h3>Holdings:</h3>
            <ul>
                {Object.entries(holdings).filter(([_, quantity]) => quantity > 0).map(([id, quantity]) => (
                    <li key={id}>
                        {coins.find(coin => coin.id === id)?.name}: {quantity.toFixed(4)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SimulatedTrading;
