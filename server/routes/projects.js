// ===== PROJECTS ROUTES =====

const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Project = require('../models/Project');

const router = express.Router();

// ===== VALIDATION MIDDLEWARE =====

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

// @route   GET /api/projects
// @desc    Get all projects with optional filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['AI/ML', 'Web Development', 'Data Science', 'Cloud Computing', 'Mobile App', 'Blockchain', 'Other']),
  query('status').optional().isIn(['Completed', 'In Progress', 'Planned', 'On Hold']),
  query('featured').optional().isBoolean(),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      featured,
      search,
      sort = '-priority,-createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured === 'true';

    // Handle search
    let projects;
    if (search) {
      projects = await Project.search(search);
    } else {
      projects = Project.find(query);
    }

    // Apply sorting
    projects = projects.sort(sort);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    projects = projects.skip(skip).limit(parseInt(limit));

    // Execute query
    const results = await projects.exec();
    
    // Get total count for pagination
    const total = await Project.countDocuments(search ? { $text: { $search: search }, isActive: true } : query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      meta: {
        count: results.length,
        query: req.query
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch projects'
    });
  }
});

// @route   GET /api/projects/featured
// @desc    Get featured projects
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.getFeatured();
    
    res.json({
      success: true,
      data: projects,
      meta: {
        count: projects.length
      }
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch featured projects'
    });
  }
});

// @route   GET /api/projects/categories
// @desc    Get projects grouped by category
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        projects: { $push: '$$ROOT' }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories,
      meta: {
        totalCategories: categories.length
      }
    });
  } catch (error) {
    console.error('Error fetching project categories:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch project categories'
    });
  }
});

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          featuredProjects: { $sum: { $cond: ['$featured', 1, 0] } },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          inProgressProjects: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          avgPriority: { $avg: '$priority' }
        }
      }
    ]);

    const categoryStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const technologyStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$technologies' },
      { $group: { _id: '$technologies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categories: categoryStats,
        topTechnologies: technologyStats
      }
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch project statistics'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid project ID')
], handleValidationErrors, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project || !project.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Increment view count
    await project.incrementViews();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch project'
    });
  }
});

// @route   GET /api/projects/slug/:slug
// @desc    Get single project by slug
// @access  Public
router.get('/slug/:slug', [
  param('slug').isLength({ min: 1, max: 100 }).withMessage('Invalid slug')
], handleValidationErrors, async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true });
    const project = projects.find(p => p.slug === req.params.slug);
    
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    // Increment view count
    await project.incrementViews();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch project'
    });
  }
});

// @route   POST /api/projects/:id/like
// @desc    Like a project
// @access  Public
router.post('/:id/like', [
  param('id').isMongoId().withMessage('Invalid project ID')
], handleValidationErrors, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project || !project.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found'
      });
    }

    project.metrics.likes += 1;
    await project.save();

    res.json({
      success: true,
      message: 'Project liked successfully',
      data: {
        likes: project.metrics.likes
      }
    });
  } catch (error) {
    console.error('Error liking project:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to like project'
    });
  }
});

module.exports = router;
