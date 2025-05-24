import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProtectedResource() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        navigate('/login'); // Redirect to login if no token
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setError('');
      } catch (err) {
        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.message}`);
          if (err.response.status === 401 || err.response.status === 403) {
            // Token might be expired or invalid, redirect to login
            localStorage.removeItem('token'); // Clear invalid token
            navigate('/login');
          }
        } else {
          setError('Failed to fetch protected data. The server might be down or unreachable.');
        }
        console.error('Fetch user data error:', err);
      }
    };

    fetchData();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h2>Protected User Area</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div>
        <h2>Protected User Area</h2>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Protected User Area</h2>
      <p>{userData.message}</p>
      {userData.user && (
        <div>
          <p>Welcome, {userData.user.username}!</p>
          <p>Your ID: {userData.user.userId}</p>
          <p>Your Roles: {userData.user.roles.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default ProtectedResource;
