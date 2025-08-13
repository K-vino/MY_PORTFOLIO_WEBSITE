import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AchievementSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  org: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['certification', 'award', 'hackathon', 'competition', 'recognition', 'publication', 'patent'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Link must be a valid HTTP/HTTPS URL'
    }
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: 100
  },
  credentialUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Credential URL must be a valid HTTP/HTTPS URL'
    }
  },
  issueDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  technologies: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  rank: {
    type: Number,
    min: 1
  },
  totalParticipants: {
    type: Number,
    min: 1
  },
  score: {
    type: Number
  },
  maxScore: {
    type: Number
  },
  grade: {
    type: String,
    trim: true,
    maxlength: 10
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Logo must be a valid image URL'
    }
  },
  badge: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Badge must be a valid image URL'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
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
AchievementSchema.index({ date: -1 });
AchievementSchema.index({ type: 1, date: -1 });
AchievementSchema.index({ featured: -1, date: -1 });
AchievementSchema.index({ org: 1 });

// Virtual for formatted date
AchievementSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for short date
AchievementSchema.virtual('shortDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
});

// Virtual for year only
AchievementSchema.virtual('year').get(function() {
  return this.date.getFullYear();
});

// Virtual for time ago
AchievementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.date;
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  return 'Recently';
});

// Virtual for credential status
AchievementSchema.virtual('credentialStatus').get(function() {
  if (!this.expiryDate) return 'valid';
  
  const now = new Date();
  const daysUntilExpiry = Math.floor((this.expiryDate - now) / 86400000);
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'expiring-soon';
  return 'valid';
});

// Virtual for performance percentage (if rank and total participants available)
AchievementSchema.virtual('performancePercentage').get(function() {
  if (!this.rank || !this.totalParticipants) return null;
  return Math.round(((this.totalParticipants - this.rank + 1) / this.totalParticipants) * 100);
});

// Virtual for score percentage (if score and max score available)
AchievementSchema.virtual('scorePercentage').get(function() {
  if (!this.score || !this.maxScore) return null;
  return Math.round((this.score / this.maxScore) * 100);
});

// Static method to get featured achievements
AchievementSchema.statics.getFeatured = function() {
  return this.find({ featured: true })
    .sort({ priority: -1, date: -1 });
};

// Static method to get achievements by type
AchievementSchema.statics.getByType = function(type) {
  return this.find({ type })
    .sort({ date: -1 });
};

// Static method to get certifications
AchievementSchema.statics.getCertifications = function() {
  return this.find({ type: 'certification' })
    .sort({ date: -1 });
};

// Static method to get awards and recognitions
AchievementSchema.statics.getAwards = function() {
  return this.find({ type: { $in: ['award', 'recognition', 'hackathon', 'competition'] } })
    .sort({ date: -1 });
};

// Static method to get recent achievements
AchievementSchema.statics.getRecent = function(limit = 5) {
  return this.find()
    .sort({ date: -1 })
    .limit(limit);
};

// Instance method to toggle featured status
AchievementSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

// Instance method to check if expired
AchievementSchema.methods.isExpired = function() {
  return this.expiryDate && this.expiryDate < new Date();
};

// Instance method to check if expiring soon
AchievementSchema.methods.isExpiringSoon = function(days = 30) {
  if (!this.expiryDate) return false;
  const daysUntilExpiry = Math.floor((this.expiryDate - new Date()) / 86400000);
  return daysUntilExpiry > 0 && daysUntilExpiry <= days;
};

export default model('Achievement', AchievementSchema);
