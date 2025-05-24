import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
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
        const response = await axios.get('http://localhost:5000/api/admin/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminData(response.data);
        setError('');
      } catch (err) {
        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.message}`);
          if (err.response.status === 401 || err.response.status === 403) {
            // Token might be expired or user not authorized
            localStorage.removeItem('token'); // Clear potentially invalid token
            navigate('/login'); // Or to a generic unauthorized page
          }
        } else {
          setError('Failed to fetch admin data. The server might be down or unreachable.');
        }
        console.error('Fetch admin data error:', err);
      }
    };

    fetchData();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div>
        <h2>Admin Dashboard</h2>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>{adminData.message}</p>
      {adminData.user && (
        <div>
          <p>Admin User: {adminData.user.username}</p>
          <p>Admin Roles: {adminData.user.roles.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
