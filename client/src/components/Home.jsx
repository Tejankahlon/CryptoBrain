import React, { useEffect } from 'react';
import '../App.css';
import axios from 'axios';

const Home = () => {
    console.log("Home component is rendered");
    useEffect(() => {
        axios.get('http://localhost:5000/check-login', { withCredentials: true })
            .then(response => {
                console.log('Login status on Home load:', response.data.isLoggedIn);
                if (!response.data.isLoggedIn) {
                    window.location.href = "http://localhost:5000/login";
                }
            })
            .catch(error => {
                console.error('Login check failed', error);
                window.location.href = "http://localhost:5000/login";
            });
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/logout');
            window.location.href = "http://localhost:5000/login";
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="App-header">
            <h1>Welcome to the Home Page!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;
