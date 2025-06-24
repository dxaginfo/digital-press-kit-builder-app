const { validationResult } = require('express-validator');
const PressKit = require('../models/PressKit');
const Media = require('../models/Media');
const Analytics = require('../models/Analytics');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const s3 = require('../config/s3');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|mp3|mp4|wav|pdf|doc|docx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not supported!'));
  }
}

// @desc    Get all press kits for the user
// @route   GET /api/press-kits
// @access  Private
const getUserPressKits = asyncHandler(async (req, res) => {
  const pressKits = await PressKit.find({ userId: req.user._id });

  res.json({
    success: true,
    count: pressKits.length,
    data: pressKits
  });
});

// @desc    Get a press kit by ID
// @route   GET /api/press-kits/:id
// @access  Private
const getPressKitById = asyncHandler(async (req, res) => {
  const pressKit = await PressKit.findById(req.params.id);
  
  // Get associated media
  const media = await Media.find({ pressKitId: req.params.id });
  
  res.json({
    success: true,
    data: {
      ...pressKit.toObject(),
      media
    }
  });
});

// @desc    Get a published press kit by slug (public access)
// @route   GET /api/press-kits/public/:slug
// @access  Public
const getPublicPressKitBySlug = asyncHandler(async (req, res, next) => {
  const pressKit = await PressKit.findOne({ 
    slug: req.params.slug,
    isPublished: true
  });
  
  if (!pressKit) {
    return next(new ErrorResponse(`Press kit not found with slug of ${req.params.slug}`, 404));
  }
  
  // Get associated media
  const media = await Media.find({ pressKitId: pressKit._id });
  
  // Record analytics
  const analytics = new Analytics({
    pressKitId: pressKit._id,
    visitorIp: req.ip,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || '',
    interactions: [{ section: 'main', action: 'view' }]
  });
  
  await analytics.save();
  
  res.json({
    success: true,
    data: {
      ...pressKit.toObject(),
      media
    }
  });
});

// @desc    Create a new press kit
// @route   POST /api/press-kits
// @access  Private
const createPressKit = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Add user ID to request body
  req.body.userId = req.user._id;
  
  // Create press kit
  const pressKit = await PressKit.create(req.body);
  
  res.status(201).json({
    success: true,
    data: pressKit
  });
});

// @desc    Update a press kit
// @route   PUT /api/press-kits/:id
// @access  Private
const updatePressKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find press kit and update it
  const pressKit = await PressKit.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.json({
    success: true,
    data: pressKit
  });
});

// @desc    Delete a press kit
// @route   DELETE /api/press-kits/:id
// @access  Private
const deletePressKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find associated media
  const media = await Media.find({ pressKitId: id });
  
  // Delete media files from S3
  for (const item of media) {
    if (item.s3Key) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: item.s3Key
      };
      
      await s3.deleteObject(params).promise();
    }
  }
  
  // Delete media records
  await Media.deleteMany({ pressKitId: id });
  
  // Delete analytics
  await Analytics.deleteMany({ pressKitId: id });
  
  // Delete press kit
  await PressKit.findByIdAndDelete(id);
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Upload media to a press kit
// @route   POST /api/press-kits/:id/media
// @access  Private
const uploadMedia = asyncHandler(async (req, res, next) => {
  upload(req, res, async function(err) {
    if (err) {
      return next(new ErrorResponse(`Error uploading file: ${err.message}`, 400));
    }
    
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    const { id } = req.params;
    const { type, title, description } = req.body;
    
    // Validate type
    if (!['audio', 'video', 'image', 'document'].includes(type)) {
      return next(new ErrorResponse('Invalid media type', 400));
    }
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    
    // Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `press-kits/${id}/${type}s/${fileName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };
    
    const uploadResult = await s3.upload(params).promise();
    
    // Create media record
    const media = await Media.create({
      userId: req.user._id,
      pressKitId: id,
      type,
      title,
      description,
      fileUrl: uploadResult.Location,
      s3Key: uploadResult.Key,
      fileSize: req.file.size,
      // For images, we might want to create a thumbnail
      // For audio/video, we might want to extract duration
    });
    
    res.status(201).json({
      success: true,
      data: media
    });
  });
});

// @desc    Delete media from a press kit
// @route   DELETE /api/press-kits/:id/media/:mediaId
// @access  Private
const deleteMedia = asyncHandler(async (req, res, next) => {
  const { id, mediaId } = req.params;
  
  // Find media
  const media = await Media.findOne({ _id: mediaId, pressKitId: id });
  
  if (!media) {
    return next(new ErrorResponse(`Media not found with id of ${mediaId}`, 404));
  }
  
  // Delete from S3 if there's an S3 key
  if (media.s3Key) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: media.s3Key
    };
    
    await s3.deleteObject(params).promise();
  }
  
  // Delete media record
  await media.remove();
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Get analytics for a press kit
// @route   GET /api/press-kits/:id/analytics
// @access  Private
const getPressKitAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get all analytics for this press kit
  const analytics = await Analytics.find({ pressKitId: id });
  
  // Calculate stats
  const totalViews = analytics.length;
  
  // Count unique visitors by IP
  const uniqueVisitors = new Set();
  analytics.forEach(record => uniqueVisitors.add(record.visitorIp));
  
  // Count by section
  const sectionViews = {};
  analytics.forEach(record => {
    record.interactions.forEach(interaction => {
      if (!sectionViews[interaction.section]) {
        sectionViews[interaction.section] = 0;
      }
      sectionViews[interaction.section]++;
    });
  });
  
  // Count by referrer
  const referrers = {};
  analytics.forEach(record => {
    if (record.referrer) {
      if (!referrers[record.referrer]) {
        referrers[record.referrer] = 0;
      }
      referrers[record.referrer]++;
    }
  });
  
  res.json({
    success: true,
    data: {
      totalViews,
      uniqueVisitors: uniqueVisitors.size,
      sectionViews,
      referrers
    }
  });
});

module.exports = {
  getUserPressKits,
  getPressKitById,
  getPublicPressKitBySlug,
  createPressKit,
  updatePressKit,
  deletePressKit,
  uploadMedia,
  deleteMedia,
  getPressKitAnalytics
};