import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedResource from './components/ProtectedResource';
import MFASetup from './components/MFASetup';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard
import './App.css';

// Basic check for token existence - not for security, just for conditional rendering
const isAuthenticated = () => localStorage.getItem('token') !== null;

// Basic role check after decoding token - for UI convenience
// In a real app, consider a more robust way to manage this, perhaps with context
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const getUserRoles = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.roles || [];
    } catch (error) {
      console.error("Failed to decode token:", error);
      return [];
    }
  }
  return [];
};


function App() {
  // This is a simple way to force re-render on login/logout for nav links
  // A more robust solution might use React Context or a state management library
  const [loggedIn, setLoggedIn] = React.useState(isAuthenticated()); 
  const userRoles = getUserRoles();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    // navigate to login or home
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            {!loggedIn && <li><Link to="/login">Login</Link></li>}
            {!loggedIn && <li><Link to="/register">Register</Link></li>}
            {loggedIn && <li><Link to="/protected">User Data</Link></li>}
            {loggedIn && userRoles.includes('admin') && (
              <li><Link to="/admin">Admin Dashboard</Link></li>
            )}
            {loggedIn && (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>

        <hr />
        <Routes>
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} /> {/* Pass setLoggedIn */}
          <Route path="/register" element={<Register />} />
          <Route path="/protected" element={<ProtectedResource />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* Add AdminDashboard route */}
          <Route path="/mfa-setup" element={<MFASetup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
