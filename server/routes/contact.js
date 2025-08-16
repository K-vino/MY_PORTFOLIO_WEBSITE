// ===== CONTACT ROUTES =====

const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

const router = express.Router();

// ===== EMAIL CONFIGURATION =====

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// ===== VALIDATION MIDDLEWARE =====

const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('category')
    .optional()
    .isIn(['Job Opportunity', 'Freelance Project', 'Collaboration', 'General Inquiry', 'Technical Support', 'Other'])
    .withMessage('Invalid category')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// ===== ROUTES =====

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      phone,
      company,
      website,
      category = 'General Inquiry'
    } = req.body;

    // Extract request metadata
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrer = req.get('Referer');

    // Create contact record
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      company,
      website,
      category,
      userAgent,
      ipAddress,
      referrer,
      source: 'Portfolio Website'
    });

    // Save to database
    await contact.save();

    // Check if it's spam
    if (contact.isSpam) {
      console.log(`Spam detected from ${email} with score ${contact.spamScore}`);
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
        data: {
          id: contact._id,
          status: 'received'
        }
      });
    }

    // Send email notification
    let emailSent = false;
    let emailError = null;

    try {
      await sendEmailNotification(contact);
      await sendAutoReply(contact);
      emailSent = true;
      
      // Update contact record
      contact.emailSent = true;
      contact.emailSentAt = new Date();
      await contact.save();
      
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      emailError = emailErr.message;
      
      // Update contact record with error
      contact.emailError = emailError;
      await contact.save();
    }

    // Add initial note
    await contact.addNote(`Contact form submitted from ${ipAddress}. Email ${emailSent ? 'sent successfully' : 'failed to send'}.`);

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! I will get back to you within 24 hours.',
      data: {
        id: contact._id,
        status: 'received',
        emailSent,
        ...(emailError && { emailError })
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact form statistics
// @access  Public (limited info)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          unreadMessages: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
          spamMessages: { $sum: { $cond: ['$isSpam', 1, 0] } },
          avgResponseTime: { $avg: '$responseTimeInHours' }
        }
      }
    ]);

    const categoryStats = await Contact.aggregate([
      { $match: { isSpam: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalMessages: 0, unreadMessages: 0, spamMessages: 0 },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch contact statistics'
    });
  }
});

// ===== EMAIL FUNCTIONS =====

async function sendEmailNotification(contact) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: `New Contact Form Submission: ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Contact Information</h3>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
          ${contact.company ? `<p><strong>Company:</strong> ${contact.company}</p>` : ''}
          ${contact.website ? `<p><strong>Website:</strong> ${contact.website}</p>` : ''}
          <p><strong>Category:</strong> ${contact.category}</p>
          <p><strong>Priority:</strong> ${contact.priority}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Subject</h3>
          <p>${contact.subject}</p>
          
          <h3 style="color: #1e293b;">Message</h3>
          <p style="white-space: pre-wrap;">${contact.message}</p>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #64748b;">Technical Information</h4>
          <p><strong>Submitted:</strong> ${contact.createdAt.toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${contact.ipAddress}</p>
          <p><strong>User Agent:</strong> ${contact.userAgent}</p>
          ${contact.referrer ? `<p><strong>Referrer:</strong> ${contact.referrer}</p>` : ''}
          <p><strong>Spam Score:</strong> ${contact.spamScore}/100</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #64748b;">
            This message was sent from your portfolio website contact form.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendAutoReply(contact) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: contact.email,
    subject: `Thank you for contacting me - ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #f59e0b); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Thank You!</h1>
          <p style="margin: 10px 0 0 0;">Your message has been received</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hi ${contact.name},</p>
          
          <p>Thank you for reaching out to me through my portfolio website. I have received your message regarding "<strong>${contact.subject}</strong>" and I appreciate you taking the time to contact me.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">What happens next?</h3>
            <ul style="color: #64748b; line-height: 1.6;">
              <li>I will review your message within 24 hours</li>
              <li>You will receive a personalized response from me</li>
              <li>If needed, I may ask for additional information</li>
              <li>For urgent matters, feel free to connect with me on LinkedIn</li>
            </ul>
          </div>
          
          <p>In the meantime, feel free to:</p>
          <ul style="color: #64748b; line-height: 1.6;">
            <li>Check out my latest projects on <a href="https://github.com/K-vino" style="color: #2563eb;">GitHub</a></li>
            <li>Connect with me on <a href="https://linkedin.com/in/vino-k" style="color: #2563eb;">LinkedIn</a></li>
            <li>View my certifications and achievements on <a href="https://unstop.com/u/vinok2769" style="color: #2563eb;">Unstop</a></li>
          </ul>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>Quick Response Time:</strong> I typically respond to messages within 2-6 hours during business days.</p>
          </div>
          
          <p>Best regards,<br>
          <strong>Vino K</strong><br>
          AIML Developer | Data Scientist | Cloud Engineer<br>
          📧 vk5571859@gmail.com<br>
          🔗 <a href="https://vinok.netlify.app" style="color: #2563eb;">vinok.netlify.app</a></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
          <p>This is an automated response. Please do not reply to this email.</p>
          <p>© 2025 Vino K. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
