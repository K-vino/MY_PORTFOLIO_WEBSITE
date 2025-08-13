import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  shortDesc: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  repoUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Repository URL must be a valid HTTP/HTTPS URL'
    }
  },
  liveUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Live URL must be a valid HTTP/HTTPS URL'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  techStack: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  coverImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover image must be a valid image URL'
    }
  },
  gallery: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Gallery images must be valid image URLs'
    }
  }],
  metrics: {
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    latencyMs: {
      type: Number,
      min: 0
    },
    users: {
      type: Number,
      min: 0
    },
    downloads: {
      type: Number,
      min: 0
    },
    stars: {
      type: Number,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'in-progress', 'planned'],
    default: 'active'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProjectSchema.index({ featured: -1, createdAt: -1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ techStack: 1 });
ProjectSchema.index({ status: 1 });

// Virtual for formatted creation date
ProjectSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware to generate slug if not provided
ProjectSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get featured projects
ProjectSchema.statics.getFeatured = function() {
  return this.find({ featured: true, status: 'active' })
    .sort({ priority: -1, createdAt: -1 })
    .limit(6);
};

// Static method to get projects by tag
ProjectSchema.statics.getByTag = function(tag) {
  return this.find({ 
    tags: { $in: [tag] }, 
    status: 'active' 
  }).sort({ featured: -1, createdAt: -1 });
};

// Instance method to toggle featured status
ProjectSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

export default model('Project', ProjectSchema);
