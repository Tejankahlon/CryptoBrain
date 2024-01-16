// ProtectedRoute.js
import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const ProtectedRoute = ({ component: Component }) => {
    const { isLoggedIn, isAuthChecking } = useContext(AuthContext);

    if (isAuthChecking) {
        // Maybe return a loading spinner or a blank page while checking
        return <div>Loading...</div>
    }

    if (!isLoggedIn) {
        window.location.href = "http://localhost:5000/login";
        return null;
    }

    return <Component />;
};

export default ProtectedRoute;
