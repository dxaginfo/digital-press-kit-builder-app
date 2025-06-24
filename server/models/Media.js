const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pressKitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PressKit',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['audio', 'video', 'image', 'document']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    fileSize: Number,
    duration: Number,  // For audio/video
    s3Key: String,     // For deletion from S3
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Media', MediaSchema);