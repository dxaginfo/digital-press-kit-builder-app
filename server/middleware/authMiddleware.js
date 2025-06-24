const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return next(new ErrorResponse('Not authorized, user not found', 401));
      }

      next();
    } catch (error) {
      console.error(error);
      return next(new ErrorResponse('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized, no token', 401));
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return next(new ErrorResponse('Not authorized as an admin', 403));
  }
};

module.exports = { protect, admin };