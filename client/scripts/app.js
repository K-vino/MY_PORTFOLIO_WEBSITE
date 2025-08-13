// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Load featured projects on homepage
  if (document.getElementById('featured')) {
    loadFeaturedProjects();
  }
  
  // Initialize smooth scrolling for anchor links
  initSmoothScrolling();
  
  // Initialize intersection observer for animations
  initScrollAnimations();
});

// Load featured projects from API
async function loadFeaturedProjects() {
  try {
    const response = await fetch('/api/projects?featured=true');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const projects = await response.json();
    const grid = document.getElementById('featured');
    
    if (projects.length === 0) {
      grid.innerHTML = '<p class="text-center" style="color: var(--muted);">No featured projects found.</p>';
      return;
    }
    
    grid.innerHTML = projects.map(project => createProjectCard(project)).join('');
    
    // Add loading animation
    const cards = grid.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
  } catch (error) {
    console.error('Error loading featured projects:', error);
    const grid = document.getElementById('featured');
    grid.innerHTML = `
      <div class="error-message" style="text-align: center; color: var(--muted); grid-column: 1 / -1;">
        <p>Unable to load projects at the moment. Please try again later.</p>
      </div>
    `;
  }
}

// Create project card HTML
function createProjectCard(project) {
  const tags = (project.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const repoLink = project.repoUrl ? `<a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer">Code</a>` : '';
  const liveLink = project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : '';
  const links = [repoLink, liveLink].filter(Boolean).join(' · ');
  
  return `
    <article class="card" data-project="${escapeHtml(project.slug || '')}">
      ${project.coverImage ? `<img src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
      <h3>${escapeHtml(project.title || 'Untitled Project')}</h3>
      <p>${escapeHtml(project.shortDesc || 'No description available.')}</p>
      <div class="tags">${tags}</div>
      ${links ? `<div class="project-links" style="margin-top: 16px;">${links}</div>` : ''}
      ${project.metrics ? createMetricsDisplay(project.metrics) : ''}
    </article>
  `;
}

// Create metrics display
function createMetricsDisplay(metrics) {
  const metricItems = [];
  
  if (metrics.accuracy) {
    metricItems.push(`<span>Accuracy: ${metrics.accuracy}%</span>`);
  }
  if (metrics.latencyMs) {
    metricItems.push(`<span>Latency: ${metrics.latencyMs}ms</span>`);
  }
  if (metrics.users) {
    metricItems.push(`<span>Users: ${metrics.users.toLocaleString()}</span>`);
  }
  
  if (metricItems.length === 0) return '';
  
  return `
    <div class="project-metrics" style="margin-top: 12px; font-size: 12px; color: var(--muted);">
      ${metricItems.join(' · ')}
    </div>
  `;
}

// Utility function to escape HTML
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Initialize smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Initialize scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe sections for animation
  document.querySelectorAll('.featured-section, .skills-section').forEach(section => {
    observer.observe(section);
  });
}

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
  .featured-section, .skills-section {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease;
  }
  
  .featured-section.animate-in, .skills-section.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .project-links a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .project-links a:hover {
    color: var(--accent-hover);
    text-decoration: underline;
  }
  
  .error-message {
    padding: 40px 20px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
  }
`;
document.head.appendChild(style);

// Export functions for potential use in other scripts
window.portfolioApp = {
  loadFeaturedProjects,
  createProjectCard,
  escapeHtml
};
