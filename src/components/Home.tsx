import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const auth = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState({ fullName: '', phoneNo: '' });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (auth?.user) {
        setUserDetails(auth.user);
      } else {
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('userId');
        if (token && userId) {
          try {
            const response = await axios.get(`http://localhost:3000/user-details/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(response.data);
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        }
      }
    };

    fetchUserDetails();
  }, [auth]);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
          Full Name
        </label>
        <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" id="fullName">
          {userDetails.fullName}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNo">
          Phone Number
        </label>
        <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" id="phoneNo">
          {userDetails.phoneNo}
        </p>
      </div>
    </div>
  );
};

export default Home;