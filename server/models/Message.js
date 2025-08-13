import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const MessageSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name should only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 255,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
    minlength: 10
  },
  source: {
    type: String,
    trim: true,
    maxlength: 500,
    default: 'direct'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ email: 1 });
MessageSchema.index({ createdAt: -1 });

// Virtual for formatted creation date
MessageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for time ago
MessageSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
});

// Static method to get unread messages
MessageSchema.statics.getUnread = function() {
  return this.find({ status: 'new' })
    .sort({ createdAt: -1 });
};

// Static method to get messages by status
MessageSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .sort({ createdAt: -1 });
};

// Static method to get recent messages
MessageSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to mark as read
MessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Instance method to mark as replied
MessageSchema.methods.markAsReplied = function() {
  this.status = 'replied';
  return this.save();
};

// Instance method to archive
MessageSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Pre-save middleware to set priority based on keywords
MessageSchema.pre('save', function(next) {
  if (this.isNew) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately'];
    const highKeywords = ['important', 'priority', 'deadline', 'job', 'opportunity'];
    
    const messageText = this.message.toLowerCase();
    
    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'high';
    }
  }
  next();
});

export default model('Message', MessageSchema);
