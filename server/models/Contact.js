// ===== CONTACT MODEL =====

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    minlength: [5, 'Subject must be at least 5 characters long'],
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  
  category: {
    type: String,
    enum: {
      values: ['Job Opportunity', 'Freelance Project', 'Collaboration', 'General Inquiry', 'Technical Support', 'Other'],
      message: 'Category must be one of: Job Opportunity, Freelance Project, Collaboration, General Inquiry, Technical Support, Other'
    },
    default: 'General Inquiry'
  },
  
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: 'Priority must be one of: Low, Medium, High, Urgent'
    },
    default: 'Medium'
  },
  
  status: {
    type: String,
    enum: {
      values: ['New', 'Read', 'In Progress', 'Replied', 'Resolved', 'Closed'],
      message: 'Status must be one of: New, Read, In Progress, Replied, Resolved, Closed'
    },
    default: 'New'
  },
  
  source: {
    type: String,
    enum: {
      values: ['Portfolio Website', 'LinkedIn', 'GitHub', 'Email', 'Referral', 'Other'],
      message: 'Source must be one of: Portfolio Website, LinkedIn, GitHub, Email, Referral, Other'
    },
    default: 'Portfolio Website'
  },
  
  // Technical information
  userAgent: {
    type: String,
    trim: true
  },
  
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Basic IP validation (IPv4 and IPv6)
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
      },
      message: 'Please provide a valid IP address'
    }
  },
  
  referrer: {
    type: String,
    trim: true
  },
  
  // Response tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  
  emailSentAt: {
    type: Date
  },
  
  emailError: {
    type: String,
    trim: true
  },
  
  responseTime: {
    type: Date
  },
  
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot be more than 500 characters']
    },
    addedBy: {
      type: String,
      default: 'System'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Spam detection
  isSpam: {
    type: Boolean,
    default: false
  },
  
  spamScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: {
    type: Date
  },
  
  // Archive
  isArchived: {
    type: Boolean,
    default: false
  },
  
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ isSpam: 1 });
contactSchema.index({ isArchived: 1 });
contactSchema.index({ name: 'text', subject: 'text', message: 'text' });

// ===== VIRTUALS =====
contactSchema.virtual('fullContact').get(function() {
  return `${this.name} <${this.email}>`;
});

contactSchema.virtual('isUrgent').get(function() {
  return this.priority === 'Urgent' || this.priority === 'High';
});

contactSchema.virtual('responseTimeInHours').get(function() {
  if (this.responseTime && this.createdAt) {
    const diffTime = Math.abs(this.responseTime - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }
  return null;
});

// ===== MIDDLEWARE =====

// Pre-save middleware
contactSchema.pre('save', function(next) {
  // Auto-detect potential spam
  if (this.isNew) {
    this.spamScore = this.calculateSpamScore();
    this.isSpam = this.spamScore > 70;
  }
  
  // Set follow-up date for high priority items
  if (this.priority === 'High' || this.priority === 'Urgent') {
    this.followUpRequired = true;
    if (!this.followUpDate) {
      this.followUpDate = new Date(Date.now() + (this.priority === 'Urgent' ? 2 : 24) * 60 * 60 * 1000);
    }
  }
  
  next();
});

// ===== STATIC METHODS =====

// Get unread messages
contactSchema.statics.getUnread = function() {
  return this.find({ status: 'New', isSpam: false, isArchived: false })
    .sort({ priority: 1, createdAt: -1 });
};

// Get messages by status
contactSchema.statics.getByStatus = function(status) {
  return this.find({ status, isArchived: false })
    .sort({ createdAt: -1 });
};

// Get urgent messages
contactSchema.statics.getUrgent = function() {
  return this.find({ 
    priority: { $in: ['High', 'Urgent'] }, 
    status: { $in: ['New', 'Read', 'In Progress'] },
    isSpam: false,
    isArchived: false
  }).sort({ priority: 1, createdAt: -1 });
};

// Search messages
contactSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isArchived: false
  }).sort({ score: { $meta: 'textScore' } });
};

// ===== INSTANCE METHODS =====

// Mark as read
contactSchema.methods.markAsRead = function() {
  if (this.status === 'New') {
    this.status = 'Read';
    return this.save();
  }
  return Promise.resolve(this);
};

// Mark as replied
contactSchema.methods.markAsReplied = function() {
  this.status = 'Replied';
  this.responseTime = new Date();
  return this.save();
};

// Add note
contactSchema.methods.addNote = function(content, addedBy = 'System') {
  this.notes.push({
    content,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

// Calculate spam score
contactSchema.methods.calculateSpamScore = function() {
  let score = 0;
  
  // Check for suspicious patterns
  const suspiciousWords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'urgent', 'act now'];
  const messageText = (this.subject + ' ' + this.message).toLowerCase();
  
  suspiciousWords.forEach(word => {
    if (messageText.includes(word)) {
      score += 20;
    }
  });
  
  // Check for excessive caps
  const capsRatio = (this.message.match(/[A-Z]/g) || []).length / this.message.length;
  if (capsRatio > 0.5) {
    score += 30;
  }
  
  // Check for excessive exclamation marks
  const exclamationCount = (this.message.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    score += 20;
  }
  
  // Check for suspicious email patterns
  if (this.email.includes('temp') || this.email.includes('disposable')) {
    score += 40;
  }
  
  return Math.min(score, 100);
};

// Archive message
contactSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);
