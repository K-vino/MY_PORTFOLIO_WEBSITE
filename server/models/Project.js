// ===== PROJECT MODEL =====

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  longDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Long description cannot be more than 2000 characters']
  },
  
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: {
      values: ['AI/ML', 'Web Development', 'Data Science', 'Cloud Computing', 'Mobile App', 'Blockchain', 'Other'],
      message: 'Category must be one of: AI/ML, Web Development, Data Science, Cloud Computing, Mobile App, Blockchain, Other'
    }
  },
  
  status: {
    type: String,
    enum: {
      values: ['Completed', 'In Progress', 'Planned', 'On Hold'],
      message: 'Status must be one of: Completed, In Progress, Planned, On Hold'
    },
    default: 'Completed'
  },
  
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot be more than 10'],
    default: 5
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  githubUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub URL'
    }
  },
  
  liveUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  
  demoUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid demo URL'
    }
  },
  
  image: {
    type: String,
    trim: true
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  icon: {
    type: String,
    trim: true,
    default: 'code'
  },
  
  startDate: {
    type: Date
  },
  
  endDate: {
    type: Date
  },
  
  duration: {
    type: String,
    trim: true
  },
  
  teamSize: {
    type: Number,
    min: [1, 'Team size must be at least 1'],
    default: 1
  },
  
  myRole: {
    type: String,
    trim: true
  },
  
  challenges: [{
    type: String,
    trim: true
  }],
  
  solutions: [{
    type: String,
    trim: true
  }],
  
  learnings: [{
    type: String,
    trim: true
  }],
  
  features: [{
    type: String,
    trim: true
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    stars: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: String,
    default: 'Vino K'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: -1, priority: -1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ isActive: 1 });

// ===== VIRTUALS =====
projectSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
});

projectSchema.virtual('projectDuration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`.trim();
    }
  }
  return this.duration || 'Not specified';
});

// ===== MIDDLEWARE =====

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Auto-generate meta title and description if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title;
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.description.substring(0, 157) + '...';
  }
  
  // Auto-generate keywords from technologies and tags
  if (!this.seo.keywords || this.seo.keywords.length === 0) {
    this.seo.keywords = [...this.technologies, ...this.tags].map(item => item.toLowerCase());
  }
  
  next();
});

// ===== STATIC METHODS =====

// Get featured projects
projectSchema.statics.getFeatured = function() {
  return this.find({ featured: true, isActive: true })
    .sort({ priority: -1, createdAt: -1 })
    .limit(6);
};

// Get projects by category
projectSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ priority: -1, createdAt: -1 });
};

// Search projects
projectSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// ===== INSTANCE METHODS =====

// Increment view count
projectSchema.methods.incrementViews = function() {
  this.metrics.views += 1;
  return this.save();
};

// Toggle featured status
projectSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);
