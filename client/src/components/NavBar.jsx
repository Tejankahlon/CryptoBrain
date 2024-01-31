import React from 'react'
import axios from 'axios'

const NavBar = () => {
    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/logout')
            window.location.href = "http://localhost:5000/login"
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }


return (
    <nav>
            <a href="#market-dashboard">Market Dashboard</a>
            <a href="#simulated-trading">Simulated Trading</a>
            <a href="#education-cards">Education Cards</a>
            <button onClick={handleLogout}>Logout</button>
    </nav>
)
}

export default NavBar