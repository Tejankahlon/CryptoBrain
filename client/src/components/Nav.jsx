import React, { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';

const Nav = () => {
    const [btcData, setBTCData] = useState({})
    useEffect(() => {
        axios.get('http://localhost:5000/check-login', { withCredentials: true })
            .then(response => {
                console.log('Login status on Home load:', response.data.isLoggedIn)
                if (!response.data.isLoggedIn) {
                    window.location.href = "http://localhost:5000/login"
                }
            })
            .catch(error => {
                console.error('Login check failed', error);
                window.location.href = "http://localhost:5000/login"
            })
    }, [])
    useEffect(() => {
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(response => {
            setBTCData(response.data.bitcoin)
        })
        .catch(error =>{
            console.error('Error fetching data: ', error)
        })
    })

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/logout')
            window.location.href = "http://localhost:5000/login"
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="App-first-layer">
            <h1>Welcome to the Home Page!</h1>
            <h2>BTC price: ${ btcData.usd }</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Nav

// working on setting up main nav bar hat will rest at the top always and everything else will be underneath it in there separate components