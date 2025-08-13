import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ExperienceSchema = new Schema({
  org: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  role: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['work', 'internship', 'freelance', 'volunteer', 'education'],
    default: 'work'
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    default: null // null means current/present
  },
  current: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
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
  achievements: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  companyUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Company URL must be a valid HTTP/HTTPS URL'
    }
  },
  companyLogo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Company logo must be a valid image URL'
    }
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ExperienceSchema.index({ start: -1 });
ExperienceSchema.index({ current: -1, start: -1 });
ExperienceSchema.index({ type: 1, start: -1 });

// Virtual for duration calculation
ExperienceSchema.virtual('duration').get(function() {
  const endDate = this.end || new Date();
  const startDate = this.start;
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
});

// Virtual for formatted date range
ExperienceSchema.virtual('dateRange').get(function() {
  const startFormatted = this.start.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
  
  const endFormatted = this.end 
    ? this.end.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      })
    : 'Present';
  
  return `${startFormatted} - ${endFormatted}`;
});

// Virtual for short date range
ExperienceSchema.virtual('shortDateRange').get(function() {
  const startYear = this.start.getFullYear();
  const endYear = this.end ? this.end.getFullYear() : 'Present';
  
  return startYear === endYear ? startYear.toString() : `${startYear} - ${endYear}`;
});

// Pre-save middleware to update current status
ExperienceSchema.pre('save', function(next) {
  this.current = !this.end;
  next();
});

// Static method to get current experiences
ExperienceSchema.statics.getCurrent = function() {
  return this.find({ current: true })
    .sort({ start: -1 });
};

// Static method to get experiences by type
ExperienceSchema.statics.getByType = function(type) {
  return this.find({ type })
    .sort({ start: -1 });
};

// Static method to get work experience only
ExperienceSchema.statics.getWorkExperience = function() {
  return this.find({ type: { $in: ['work', 'internship', 'freelance'] } })
    .sort({ start: -1 });
};

// Static method to get education
ExperienceSchema.statics.getEducation = function() {
  return this.find({ type: 'education' })
    .sort({ start: -1 });
};

// Instance method to calculate total experience in months
ExperienceSchema.methods.getTotalMonths = function() {
  const endDate = this.end || new Date();
  const startDate = this.start;
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
};

export default model('Experience', ExperienceSchema);
