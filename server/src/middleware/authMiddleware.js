const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const User = require('../models/User');

/**
 * Extract token from Authorization header or signed/unsigned cookie
 */
function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

/**
 * Require authenticated user (Customer or Admin)
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User session is invalid or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
}

/**
 * Require Admin role
 */
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Administrative privileges required.',
      });
    }
  });
}

/**
 * Optional Auth - populates req.user if valid token exists, but doesn't block guest
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
    req.user = null;
  }
  next();
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
}

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  generateToken,
};
