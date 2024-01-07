import React from 'react'
import '../App.css'
import axios from 'axios'

const Home = () => {
const handleLogout = async () => {
    try {
    await axios.get('/logout')
      // Handle post-logout logic here, like redirecting to the login page
    } catch (err) {
    console.error('Logout failed:', err)
    }
}

return (
    <div className="App-header"> {/* Use the App-header class for styling */}
    <h1>Welcome to the Home Page!</h1>
    <button onClick={handleLogout}>Logout</button>
    </div>
)
}

export default Home
