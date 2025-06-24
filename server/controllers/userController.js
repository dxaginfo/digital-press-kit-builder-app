const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-passwordHash');
  
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { email, firstName, lastName, isAdmin } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Check if email already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }
  
  // Update fields
  user.email = email || user.email;
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  if (isAdmin !== undefined) {
    user.isAdmin = isAdmin;
  }
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      isAdmin: updatedUser.isAdmin
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  await user.remove();
  
  res.json({
    success: true,
    data: {}
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};