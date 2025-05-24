import React, { useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [userIdForMfa, setUserIdForMfa] = useState(''); // To store email/userId for the MFA step
  const navigate = useNavigate();

  const handleInitialLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      if (response.data.mfaRequired) {
        setMfaRequired(true);
        setUserIdForMfa(response.data.email); // Assuming backend sends back email
        setError('MFA is required. Please enter your TOTP code.');
      } else {
        localStorage.setItem('token', response.data.token);
        navigate('/protected');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
      console.error('Login error:', err);
    }
  };

  const handleMfaLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/mfa/login', {
        email: userIdForMfa, // Use the stored email/userId
        totpCode,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/protected');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('MFA Login failed. Invalid TOTP code.');
      }
      console.error('MFA Login error:', err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!mfaRequired ? (
        <form onSubmit={handleInitialLogin}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      ) : (
        <form onSubmit={handleMfaLogin}>
          <div>
            <label htmlFor="totpCode">Enter TOTP Code:</label>
            <input
              type="text"
              id="totpCode"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
              minLength="6"
              maxLength="6"
            />
          </div>
          <button type="submit">Verify & Login</button>
        </form>
      )}
    </div>
  );
}

export default Login;
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
