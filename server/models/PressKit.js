const mongoose = require('mongoose');
const slugify = require('slugify');

const SectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['bio', 'music', 'videos', 'photos', 'press', 'tour', 'contact']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: mongoose.Schema.Types.Mixed,
    order: {
      type: Number,
      default: 0
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const CustomizationSchema = new mongoose.Schema(
  {
    colors: {
      primary: String,
      secondary: String,
      text: String,
      background: String
    },
    fonts: {
      heading: String,
      body: String
    }
  },
  { _id: false }
);

const PressKitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    template: {
      type: String,
      required: [true, 'Template is required']
    },
    customization: {
      type: CustomizationSchema,
      default: {
        colors: {
          primary: '#1976d2',
          secondary: '#9c27b0',
          text: '#212121',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Roboto',
          body: 'Roboto'
        }
      }
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isPasswordProtected: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      select: false
    },
    sections: [SectionSchema],
    lastPublishedAt: Date
  },
  {
    timestamps: true
  }
);

// Generate slug from title
PressKitSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.isModified('isPublished') && this.isPublished) {
    this.lastPublishedAt = Date.now();
  }

  next();
});

module.exports = mongoose.model('PressKit', PressKitSchema);