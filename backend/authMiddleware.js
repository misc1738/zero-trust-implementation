const jwt = require('jsonwebtoken');
const logger = require('./logger'); // Import logger

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET || 'yourSecretKeyJWT';

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        logger.warn({ error: err.message }, 'Invalid or expired token');
        return res.status(401).json({ message: 'Token is not valid or expired' });
      }
      req.user = decoded;
      logger.info({ userId: req.user.userId, roles: req.user.roles }, 'Token verified');
      next();
    });
  } else {
    logger.warn('Access attempt without token');
    res.status(403).json({ message: 'No token provided, authorization denied' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      logger.warn({ userId: req.user ? req.user.userId : 'unknown', path: req.originalUrl }, 'Role authorization failed: User roles not found in token');
      return res.status(403).json({ message: 'User roles not found' });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (hasRole) {
      logger.info({ userId: req.user.userId, roles: req.user.roles, requiredRoles: allowedRoles, path: req.originalUrl }, 'Role authorization successful');
      next();
    } else {
      logger.warn({ userId: req.user.userId, userRoles: req.user.roles, requiredRoles: allowedRoles, path: req.originalUrl }, 'Role authorization failed');
      res.status(403).json({ message: 'Access denied: User does not have the required role' });
    }
  };
};

module.exports = { verifyToken, authorizeRoles };
