import React, { createContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

interface User {
  fullName: string;
  phoneNo: string;
}

interface AuthContextType {
  signup: (username: string, password: string, fullName: string, phoneNo: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  user: User | null;
  fetchUserDetails: (userId: string, token: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const signup = async (username: string, password: string, fullName: string, phoneNo: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/signup', {
        username,
        password,
        fullName,
        phoneNo,
      });
      console.log('Signup success:', response.data);
      alert('Signup successful!');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });
      console.log('Login success:', response.data);
      const { access_token, userId } = response.data;
      if (!userId) {
        throw new Error('User ID not returned from server');
      }
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('userId', userId);

      // Fetch user details after login
      await fetchUserDetails(userId, access_token);
      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string, token: string) => {
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3000/user-details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  useEffect(() => {
    const handleRedirect = async () => {
      if (location.hash.includes('login-success')) {
        const params = new URLSearchParams(location.hash.split('?')[1]);
        const token = params.get('token');
        const userId = params.get('userId');
        
        if (token && userId) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('userId', userId);
          await fetchUserDetails(userId, token);
          navigate('/home');
        }
      }
    };

    handleRedirect();
  }, [location, navigate]);
  return (
    <AuthContext.Provider value={{ signup, login, loginWithGoogle, user, fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};