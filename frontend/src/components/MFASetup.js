import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import axios from 'axios';

function MFASetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { secret, otpauthUrl, email } = location.state || {};
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!secret || !otpauthUrl || !email) {
    // Redirect to register or show an error if state is missing
    // This can happen if the user navigates directly to /mfa-setup
    navigate('/register'); // Or show an error message
    return <p>Error: MFA setup details not found. Please register first.</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/mfa/verify', {
        email,
        totpCode,
      });
      setSuccessMessage(response.data.message + ' Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('MFA verification failed. Please try again.');
      }
      console.error('MFA verification error:', err);
    }
  };

  return (
    <div>
      <h2>Set Up Multi-Factor Authentication</h2>
      <p>Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
      <div>
        <QRCode value={otpauthUrl} size={256} level="H" />
      </div>
      <p>Or manually enter the secret key:</p>
      <p><strong>{secret}</strong></p>
      <hr />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="totpCode">Enter TOTP Code from App:</label>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <button type="submit">Verify & Activate MFA</button>
      </form>
    </div>
  );
}

export default MFASetup;
