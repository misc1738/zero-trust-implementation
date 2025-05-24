const express = require('express');
const cors = require('cors');
const logger = require('./logger'); // Import logger

// Ensure NODE_ENV is set, default to 'development' for pino-pretty
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.originalUrl, ip: req.ip }, 'Incoming request');
  res.on('finish', () => {
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ip: req.ip }, 'Request completed');
  });
  next();
});

// Routes
const authController = require('./authController');
const adminController = require('./adminController');
const userController = require('./userController');
const { verifyToken, authorizeRoles } = require('./authMiddleware');

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/mfa/verify', authController.mfaVerify);
app.post('/api/auth/mfa/login', authController.mfaLogin);

// Protected routes
app.get('/api/user/data', verifyToken, userController.getUserData);
app.get('/api/admin/data', verifyToken, authorizeRoles('admin'), adminController.getAdminData);


// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
});
