import React from 'react';
import Home from './components/Home';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/home" element={<ProtectedRoute component={Home} />} />
    </Routes>
  );
}

export default App;
