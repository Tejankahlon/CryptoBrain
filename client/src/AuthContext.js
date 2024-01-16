import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    useEffect(() => {
        axios.get('http://localhost:5000/check-login', { withCredentials: true })
            .then(response => {
                console.log('Login status fetched from Flask:', response.data.isLoggedIn)
                setIsLoggedIn(response.data.isLoggedIn)
                setIsAuthChecking(false)
            })
            .catch(error => {
                console.error('Login check failed', error);
            })
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAuthChecking }}>
            {children}
        </AuthContext.Provider>
    );
};
