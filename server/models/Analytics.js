const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema(
  {
    section: String,
    action: String,  // view, play, download, etc.
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const AnalyticsSchema = new mongoose.Schema(
  {
    pressKitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PressKit',
      required: true
    },
    visitorIp: String,
    userAgent: String,
    referrer: String,
    country: String,
    city: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    interactions: [InteractionSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);