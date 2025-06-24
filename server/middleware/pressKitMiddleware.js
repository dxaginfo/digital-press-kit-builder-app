const asyncHandler = require('../utils/asyncHandler');
const PressKit = require('../models/PressKit');
const ErrorResponse = require('../utils/errorResponse');

// Check if user owns the press kit
const checkPressKitOwnership = asyncHandler(async (req, res, next) => {
  const pressKit = await PressKit.findById(req.params.id);

  if (!pressKit) {
    return next(new ErrorResponse(`Press kit not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the press kit
  if (pressKit.userId.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new ErrorResponse(`User not authorized to access this press kit`, 401));
  }

  req.pressKit = pressKit;
  next();
});

module.exports = { checkPressKitOwnership };