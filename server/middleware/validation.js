// ===== VALIDATION MIDDLEWARE =====

const { body, query, param, validationResult } = require('express-validator');

// ===== COMMON VALIDATION FUNCTIONS =====

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// ===== CONTACT FORM VALIDATION =====

const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email cannot be more than 100 characters'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Subject contains invalid characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,&()]+$/)
    .withMessage('Company name contains invalid characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid website URL'),
  
  body('category')
    .optional()
    .isIn(['Job Opportunity', 'Freelance Project', 'Collaboration', 'General Inquiry', 'Technical Support', 'Other'])
    .withMessage('Invalid category selected')
];

// ===== PROJECT VALIDATION =====

const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('technologies')
    .isArray({ min: 1 })
    .withMessage('At least one technology must be specified'),
  
  body('technologies.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each technology must be between 1 and 50 characters'),
  
  body('category')
    .isIn(['AI/ML', 'Web Development', 'Data Science', 'Cloud Computing', 'Mobile App', 'Blockchain', 'Other'])
    .withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(['Completed', 'In Progress', 'Planned', 'On Hold'])
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  
  body('githubUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  
  body('liveUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid live URL'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value')
];

// ===== QUERY VALIDATION =====

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .matches(/^[\w\-,]+$/)
    .withMessage('Invalid sort parameter')
];

const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Search query contains invalid characters')
];

const filterValidation = [
  query('category')
    .optional()
    .isIn(['AI/ML', 'Web Development', 'Data Science', 'Cloud Computing', 'Mobile App', 'Blockchain', 'Other'])
    .withMessage('Invalid category filter'),
  
  query('status')
    .optional()
    .isIn(['Completed', 'In Progress', 'Planned', 'On Hold'])
    .withMessage('Invalid status filter'),
  
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured filter must be a boolean value')
];

// ===== PARAMETER VALIDATION =====

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const slugValidation = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid slug')
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
];

// ===== SANITIZATION FUNCTIONS =====

const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// ===== RATE LIMITING VALIDATION =====

const validateRateLimit = (windowMs, max, message) => {
  return (req, res, next) => {
    // This would typically be handled by express-rate-limit
    // but we can add custom validation here if needed
    next();
  };
};

// ===== SPAM DETECTION =====

const spamDetection = (req, res, next) => {
  if (req.body.message) {
    const message = req.body.message.toLowerCase();
    const spamKeywords = [
      'viagra', 'casino', 'lottery', 'winner', 'congratulations',
      'urgent', 'act now', 'limited time', 'free money', 'click here'
    ];
    
    const spamCount = spamKeywords.filter(keyword => 
      message.includes(keyword)
    ).length;
    
    if (spamCount > 2) {
      return res.status(400).json({
        error: 'Spam Detected',
        message: 'Your message appears to be spam. Please try again with a different message.'
      });
    }
  }
  
  next();
};

// ===== FILE UPLOAD VALIDATION =====

const fileUploadValidation = [
  body('file')
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        }
        
        if (req.file.size > maxSize) {
          throw new Error('File size too large. Maximum size is 5MB.');
        }
      }
      return true;
    })
];

module.exports = {
  handleValidationErrors,
  contactValidation,
  projectValidation,
  paginationValidation,
  searchValidation,
  filterValidation,
  mongoIdValidation,
  slugValidation,
  sanitizeInput,
  validateRateLimit,
  spamDetection,
  fileUploadValidation
};
