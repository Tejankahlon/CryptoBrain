import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoChart from './CryptoChart';

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

    const validateTransaction = (amount, type) => {
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid dollar amount.');
            return false;
        }
    
        if (type === 'buy' && amount > currentBalance) {
            alert('Insufficient balance for this transaction.');
            return false;
        }
    
        if (type === 'sell' && amount / marketPrice > (holdings[selectedCoin.id] || 0)) {
            alert('Insufficient holdings for this transaction.');
            return false;
        }
    
        return true;
    };
    
    const processTransaction = (amount, type) => {
        const quantity = amount / marketPrice;
    
        if (type === 'buy') {
            setCurrentBalance(prev => prev - amount);
            setHoldings(prev => ({
                ...prev,
                [selectedCoin.id]: (prev[selectedCoin.id] || 0) + quantity
            }));
        } else if (type === 'sell') {
            setCurrentBalance(prev => prev + amount);
            setHoldings(prev => {
                const updatedHoldings = { ...prev, [selectedCoin.id]: prev[selectedCoin.id] - quantity };
                if (updatedHoldings[selectedCoin.id] <= 0) {
                    delete updatedHoldings[selectedCoin.id];
                }
                return updatedHoldings;
            });
        }
    
        setDollarAmount('');
    };
    
    const handleBuyClick = async () => {
        const amount = parseFloat(dollarAmount);
        if (!validateTransaction(amount, 'buy')) return;
    
        const transactionData = {
            coin_id: selectedCoin.id,
            amount: amount,
            price: marketPrice,
            transaction_type: 'buy'  // Indicating a buy transaction
        };
    
        try {
            const response = await axios.post('http://localhost:5000/process-market-order', transactionData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.data.success) {
                alert('Buy transaction successful!');
                processTransaction(amount, 'buy');
            } else {
                alert('Transaction failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error processing buy transaction:', error);
            alert('Error processing transaction.');
        }
    };
    
    const handleSellClick = async () => {
        const amount = parseFloat(dollarAmount);
        if (!validateTransaction(amount, 'sell')) return;
    
        const transactionData = {
            coin_id: selectedCoin.id,
            amount: amount,
            price: marketPrice,
            transaction_type: 'sell'  // Indicating a sell transaction
        };
    
        try {
            const response = await axios.post('http://localhost:5000/process-market-order', transactionData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.data.success) {
                alert('Sell transaction successful!');
                processTransaction(amount, 'sell');
            } else {
                alert('Transaction failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error processing sell transaction:', error);
            alert('Error processing transaction.');
        }
    };
    
    
    const displayCoins = Array.isArray(coins) && searchTerm
        ? coins.filter(coin => coin.name.toLowerCase().includes(searchTerm))
        : [];

        const chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Crypto Price',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            }],
        };

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
            <button onClick={() => handleBuyClick('buy')}>Buy</button>
            <button onClick={() => handleSellClick('sell')}>Sell</button>
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
            <CryptoChart chartData={chartData} />
        </div>
    );
};

export default SimulatedTrading;
