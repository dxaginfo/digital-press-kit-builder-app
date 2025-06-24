const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/jwtGenerator');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Create user
  const user = await User.create({
    email,
    passwordHash: password,
    firstName,
    lastName,
    lastLogin: Date.now()
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');

  res.json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email } = req.body;

  // Check if email already exists
  if (email && email !== req.user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  // Find and update user
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }
    });
  } else {
    return next(new ErrorResponse('User not found', 404));
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  // Update password
  user.passwordHash = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Request password reset
// @route   POST /api/auth/reset-password
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl} \n\n This link will expire in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // Find user by token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.passwordHash = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    message: 'Password reset successful'
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};