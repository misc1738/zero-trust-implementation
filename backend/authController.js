const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const logger = require('./logger'); // Import logger

// In-memory user store (for now)
const users = [];

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (users.find(user => user.email === email)) {
    logger.warn({ email }, 'Attempt to register existing email');
    return res.status(409).json({ message: 'Email already registered' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tempSecret = speakeasy.generateSecret({ length: 20, name: `MyApp (${email})` });

    const newUser = {
      username,
      email,
      hashedPassword,
      roles: ['user'], // Assign default role
      totpSecret: tempSecret.base32,
      totpVerified: false,
    };
    users.push(newUser);

    logger.info({ email: newUser.email, username: newUser.username }, 'User registered successfully');
    res.status(201).json({
      message: 'User registered. Please set up MFA.',
      secret: tempSecret.base32,
      otpauthUrl: tempSecret.otpauth_url,
      email: newUser.email
    });
  } catch (error) {
    logger.error(error, 'Error during registration');
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const mfaVerify = async (req, res) => {
  const { email, totpCode } = req.body;

  if (!email || !totpCode) {
    return res.status(400).json({ message: 'Email and TOTP code are required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user || !user.totpSecret) {
    return res.status(404).json({ message: 'User not found or MFA not initiated.' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: totpCode,
    window: 1, // Allow for a 30-second window on either side
  });

  if (verified) {
    user.totpVerified = true;
    logger.info({ email }, 'MFA setup verified successfully');
    res.json({ message: 'MFA setup successful. You can now log in.' });
  } else {
    logger.warn({ email, error: 'Invalid TOTP code' }, 'MFA setup verification failed');
    res.status(400).json({ message: 'Invalid TOTP code.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    logger.warn({ email }, 'Login failed: User not found');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      logger.warn({ email }, 'Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    logger.info({ email }, 'Login attempt successful, password verified');

    if (user.totpSecret && user.totpVerified) {
      logger.info({ email }, 'MFA required for user');
      return res.json({ mfaRequired: true, email: user.email });
    } else {
      const payload = { 
        userId: user.email, 
        username: user.username,
        roles: user.roles
      };
      const secretKey = process.env.JWT_SECRET || 'yourSecretKeyJWT';
      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
      logger.info({ email }, 'JWT issued');
      res.json({ token });
    }
  } catch (error) {
    logger.error(error, 'Error during login');
    res.status(500).json({ message: 'Server error during login' });
  }
};

const mfaLogin = async (req, res) => {
  const { email, totpCode } = req.body;

  if (!email || !totpCode) {
    return res.status(400).json({ message: 'Email and TOTP code are required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user || !user.totpSecret || !user.totpVerified) {
    return res.status(401).json({ message: 'Invalid request or MFA not enabled.' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: totpCode,
    window: 1,
  });

  if (verified) {
    const payload = { 
      userId: user.email, 
      username: user.username, 
      roles: user.roles, // Include roles in JWT payload
      mfaVerified: true 
    };
    const secretKey = process.env.JWT_SECRET || 'yourSecretKeyJWT';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    logger.info({ email }, 'MFA login successful, JWT issued');
    res.json({ token });
  } else {
    logger.warn({ email, error: 'Invalid TOTP code' }, 'MFA login failed');
    res.status(401).json({ message: 'Invalid TOTP code.' });
  }
};

module.exports = { register, login, mfaVerify, mfaLogin };
