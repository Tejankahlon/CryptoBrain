import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './MarketDashboard.css'

const MarketDashboard = () => {

const [marketPrices, setMarketPrices] = useState([])

useEffect(() => {
    axios.get('http://localhost:5000/api/markets')
    .then(response => {
        setMarketPrices(response.data)
    })
    .catch(error => {
        console.log('Error', error);
    })
}, [])

return (
    <div className='market-dashboard'>
        <h1>Market Dashboard</h1>
        {marketPrices.map((coin) => {
            return  <div key={coin.id} className='crypto-data-row' >
                        <span>{coin.market_cap_rank} || {coin.name} || ${coin.current_price} || %{coin.price_change_percentage_24h}</span>
                    </div>
        })}
    </div>
)
}

export default MarketDashboard