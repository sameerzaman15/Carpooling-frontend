import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState<{ fullName: string; phoneNo: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails');
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userDetails'); // Clear userDetails from local storage
    navigate('/login');
  };

  const displayUser = auth?.user || localUser; // Use context user or localStorage user

  return (
    <nav className="navbar">
      <div className="navbar-left">
        Welcome {displayUser?.fullName}! | {displayUser?.phoneNo}
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="navbar-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
