import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route 
            path="/login-success" 
            element={<Navigate to="/home" replace />} 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;