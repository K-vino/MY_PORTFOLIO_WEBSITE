// ===== MAIN JAVASCRIPT FILE =====

// Configuration
const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://vino-k-portfolio-api.onrender.com/api', // Production API URL
  TYPING_SPEED: 100,
  TYPING_DELAY: 2000,
  SCROLL_OFFSET: 80,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// DOM Elements
const elements = {
  loadingScreen: document.getElementById('loading-screen'),
  navbar: document.getElementById('navbar'),
  navMenu: document.getElementById('nav-menu'),
  hamburger: document.getElementById('hamburger'),
  navLinks: document.querySelectorAll('.nav-link'),
  contactForm: document.getElementById('contact-form'),
  formStatus: document.getElementById('form-status'),
  projectsContainer: document.getElementById('projects-container'),
  typingText: document.querySelector('.typing-text')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Hide loading screen after a delay
  setTimeout(() => {
    if (elements.loadingScreen) {
      elements.loadingScreen.classList.add('hidden');
    }
  }, 1500);

  // Initialize all components
  initializeNavigation();
  initializeTypingEffect();
  initializeScrollEffects();
  initializeContactForm();
  loadProjects();
  initializeAnimations();

  // Vertical scroll will be initialized by its own script
  console.log('Vertical scroll will be initialized automatically');
  
  console.log('Portfolio website initialized successfully!');
}

// ===== NAVIGATION =====
function initializeNavigation() {
  // Mobile menu toggle
  if (elements.hamburger && elements.navMenu) {
    elements.hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Smooth scrolling for navigation links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Update active nav link on scroll
  window.addEventListener('scroll', updateActiveNavLink);
  
  // Navbar background on scroll
  window.addEventListener('scroll', updateNavbarBackground);
}

function toggleMobileMenu() {
  elements.hamburger.classList.toggle('active');
  elements.navMenu.classList.toggle('active');
  document.body.style.overflow = elements.navMenu.classList.contains('active') ? 'hidden' : '';
}

function handleNavClick(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute('href');
  const targetSection = document.querySelector(targetId);
  
  if (targetSection) {
    const offsetTop = targetSection.offsetTop - CONFIG.SCROLL_OFFSET;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
  
  // Close mobile menu if open
  if (elements.navMenu.classList.contains('active')) {
    toggleMobileMenu();
  }
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + CONFIG.SCROLL_OFFSET;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      elements.navLinks.forEach(link => link.classList.remove('active'));
      if (navLink) navLink.classList.add('active');
    }
  });
}

function updateNavbarBackground() {
  if (window.scrollY > 50) {
    elements.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    elements.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    elements.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    elements.navbar.style.boxShadow = 'none';
  }
}

// ===== TYPING EFFECT =====
function initializeTypingEffect() {
  if (!elements.typingText) return;

  const texts = [
    'AIML Developer',
    'Data Scientist', 
    'Cloud Engineer',
    'Django Developer',
    'Python Expert',
    'Machine Learning Engineer'
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeText() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      elements.typingText.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      elements.typingText.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? CONFIG.TYPING_SPEED / 2 : CONFIG.TYPING_SPEED;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = CONFIG.TYPING_DELAY;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 500;
    }

    setTimeout(typeText, typeSpeed);
  }

  typeText();
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('.reveal');
  
  function revealOnScroll() {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Check on load
}

// ===== CONTACT FORM =====
function initializeContactForm() {
  if (!elements.contactForm) return;

  elements.contactForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(elements.contactForm);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message')
  };

  // Validate form data
  if (!validateFormData(data)) {
    showFormStatus('Please fill in all required fields.', 'error');
    return;
  }

  // Show loading state
  const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;

  try {
    // Try API first, then fallback to mailto
    const response = await fetch(`${CONFIG.API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showFormStatus('Thank you! Your message has been sent successfully.', 'success');
      elements.contactForm.reset();
    } else {
      throw new Error('API failed');
    }
  } catch (error) {
    console.log('API unavailable, using mailto fallback');

    // Fallback to mailto with correct email
    const mailtoLink = createMailtoLink(data);
    window.open(mailtoLink, '_blank');

    showFormStatus('Opening your email client... Please send the message from there.', 'info');
    elements.contactForm.reset();
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function createMailtoLink(data) {
  const to = 'vinokoffical@gmail.com'; // Updated to correct email
  const subject = encodeURIComponent(data.subject);
  const body = encodeURIComponent(
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Subject: ${data.subject}\n\n` +
    `Message:\n${data.message}`
  );

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function validateFormData(data) {
  return data.name && data.email && data.subject && data.message && 
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
}

function showFormStatus(message, type) {
  if (elements.formStatus) {
    elements.formStatus.textContent = message;
    elements.formStatus.className = `form-status ${type}`;
    elements.formStatus.style.display = 'block';

    // Style the status message
    elements.formStatus.style.padding = '10px';
    elements.formStatus.style.borderRadius = '5px';
    elements.formStatus.style.marginTop = '10px';
    elements.formStatus.style.fontWeight = 'bold';

    if (type === 'success') {
      elements.formStatus.style.backgroundColor = '#d4edda';
      elements.formStatus.style.color = '#155724';
      elements.formStatus.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      elements.formStatus.style.backgroundColor = '#f8d7da';
      elements.formStatus.style.color = '#721c24';
      elements.formStatus.style.border = '1px solid #f5c6cb';
    } else if (type === 'info') {
      elements.formStatus.style.backgroundColor = '#d1ecf1';
      elements.formStatus.style.color = '#0c5460';
      elements.formStatus.style.border = '1px solid #bee5eb';
    }

    setTimeout(() => {
      elements.formStatus.style.display = 'none';
    }, 5000);
  }
}

// ===== PROJECTS LOADING =====
async function loadProjects() {
  if (!elements.projectsContainer) return;

  let attempts = 0;

  while (attempts < CONFIG.RETRY_ATTEMPTS) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/projects/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        renderProjects(result.data || result);
        return;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      attempts++;
      console.error(`Error loading projects (attempt ${attempts}):`, error);

      if (attempts < CONFIG.RETRY_ATTEMPTS) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
      } else {
        // All attempts failed, show fallback
        renderFallbackProjects();
      }
    }
  }
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    renderFallbackProjects();
    return;
  }

  const projectsHTML = projects.map((project, index) => `
    <div class="project-card" data-aos="fade-up" data-aos-delay="${index * 100}">
      <div class="project-image">
        ${project.image ?
          `<img src="${project.image}" alt="${project.title}" loading="lazy">` :
          `<i class="fas fa-${project.icon || 'code'}"></i>`
        }
      </div>
      <div class="project-content">
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-description">${escapeHtml(project.description)}</p>
        <div class="project-tech">
          ${project.technologies.map(tech => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}
        </div>
        <div class="project-links">
          ${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>` : ''}
          ${project.demoUrl ? `<a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fas fa-play"></i> Demo
          </a>` : ''}
          ${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link secondary">
            <i class="fab fa-github"></i> Code
          </a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  elements.projectsContainer.innerHTML = projectsHTML;

  // Reinitialize AOS for new elements
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}

function renderFallbackProjects() {
  const fallbackProjects = [
    {
      title: 'AI Resume Analyzer',
      description: 'NLP-based resume parser with ATS keyword matching using Python and Streamlit.',
      technologies: ['Python', 'NLP', 'Streamlit', 'Machine Learning'],
      icon: 'brain',
      githubUrl: 'https://github.com/K-vino'
    },
    {
      title: 'Smart AI for LIFE',
      description: 'AI assistant automating tasks with Python and voice commands.',
      technologies: ['Python', 'AI', 'Voice Recognition', 'Automation'],
      icon: 'robot',
      githubUrl: 'https://github.com/K-vino'
    },
    {
      title: 'Expense Tracker',
      description: 'Full-stack budgeting app with Node.js, Express, MongoDB, and REST API.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      icon: 'chart-line',
      githubUrl: 'https://github.com/K-vino'
    },
    {
      title: 'Web3 Blockchain Voting App',
      description: 'Decentralized voting application built with blockchain technology.',
      technologies: ['Blockchain', 'Web3', 'Smart Contracts', 'JavaScript'],
      icon: 'vote-yea',
      githubUrl: 'https://github.com/K-vino'
    }
  ];

  renderProjects(fallbackProjects);
}

// ===== ANIMATIONS =====
function initializeAnimations() {
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
}

// Debounced scroll handler
const debouncedScrollHandler = debounce(() => {
  updateActiveNavLink();
  updateNavbarBackground();
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
  console.error('JavaScript error:', e.error);
});

// ===== PERFORMANCE OPTIMIZATION =====
// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}
