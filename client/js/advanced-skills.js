// ===== ADVANCED SKILLS FUNCTIONALITY =====

class AdvancedSkillsManager {
  constructor() {
    this.searchInput = document.getElementById('skills-search');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.skillCategories = document.querySelectorAll('.skill-category');
    this.skillItems = document.querySelectorAll('.skill-item');
    this.categoryHeaders = document.querySelectorAll('.category-header');
    
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.collapsedCategories = new Set();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCategoryToggle();
    this.addSkillLevels();
    this.setupSkillHover();
    console.log('🎯 Advanced Skills Manager initialized');
  }

  setupEventListeners() {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterSkills();
      });

      // Clear search on escape
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.searchInput.value = '';
          this.searchTerm = '';
          this.filterSkills();
        }
      });
    }

    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveFilter(btn);
        this.currentFilter = btn.dataset.filter;
        this.filterSkills();
      });
    });
  }

  setupCategoryToggle() {
    this.categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        this.toggleCategory(header);
      });
    });
  }

  toggleCategory(header) {
    const category = header.closest('.skill-category');
    const skillsGrid = category.querySelector('.skills-grid');
    const toggleIcon = header.querySelector('.toggle-icon');
    const categoryId = category.dataset.category;

    if (this.collapsedCategories.has(categoryId)) {
      // Expand
      this.collapsedCategories.delete(categoryId);
      skillsGrid.classList.remove('collapsed');
      header.classList.remove('collapsed');
      toggleIcon.style.transform = 'rotate(0deg)';
    } else {
      // Collapse
      this.collapsedCategories.add(categoryId);
      skillsGrid.classList.add('collapsed');
      header.classList.add('collapsed');
      toggleIcon.style.transform = 'rotate(-90deg)';
    }
  }

  setActiveFilter(activeBtn) {
    this.filterButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  filterSkills() {
    let visibleCategories = 0;

    this.skillCategories.forEach(category => {
      const categoryType = category.dataset.category;
      const skillItems = category.querySelectorAll('.skill-item');
      let visibleSkills = 0;

      // Check if category matches filter
      const categoryMatches = this.currentFilter === 'all' || 
                             categoryType === this.currentFilter ||
                             this.categoryMatchesFilter(categoryType);

      if (!categoryMatches) {
        category.classList.add('hidden');
        return;
      }

      // Filter skills within category
      skillItems.forEach(skill => {
        const skillText = skill.dataset.skill || skill.textContent.toLowerCase();
        const matchesSearch = this.searchTerm === '' || 
                             skillText.includes(this.searchTerm);

        if (matchesSearch) {
          skill.style.display = 'flex';
          skill.classList.remove('search-match');
          
          // Highlight search matches
          if (this.searchTerm && skillText.includes(this.searchTerm)) {
            skill.classList.add('search-match');
          }
          
          visibleSkills++;
        } else {
          skill.style.display = 'none';
          skill.classList.remove('search-match');
        }
      });

      // Show/hide category based on visible skills
      if (visibleSkills > 0) {
        category.classList.remove('hidden');
        visibleCategories++;
      } else {
        category.classList.add('hidden');
      }
    });

    // Show no results message if needed
    this.showNoResultsMessage(visibleCategories === 0);
  }

  categoryMatchesFilter(categoryType) {
    const filterMappings = {
      'ai': ['ai'],
      'ml': ['ml'],
      'data': ['data'],
      'cloud': ['cloud'],
      'dev': ['dev']
    };

    return filterMappings[this.currentFilter]?.includes(categoryType) || false;
  }

  showNoResultsMessage(show) {
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (show && !noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
          <h3>No skills found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      `;
      document.querySelector('.skills-container').appendChild(noResultsMsg);
    } else if (!show && noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  addSkillLevels() {
    // Add skill levels based on predefined expertise
    const skillLevels = {
      'expert': [
        'python', 'sql', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 
        'keras', 'django', 'flask', 'git', 'aws', 'azure', 'power bi'
      ],
      'advanced': [
        'pytorch', 'nlp', 'computer vision', 'machine learning', 'deep learning',
        'data science', 'mongodb', 'postgresql', 'docker', 'kubernetes'
      ],
      'intermediate': [
        'transformers', 'langchain', 'rag', 'automl', 'mlflow', 'airflow',
        'kafka', 'terraform', 'react', 'nodejs'
      ]
    };

    this.skillItems.forEach(skill => {
      const skillName = skill.dataset.skill || skill.textContent.toLowerCase();
      
      for (const [level, skills] of Object.entries(skillLevels)) {
        if (skills.some(s => skillName.includes(s))) {
          skill.setAttribute('data-level', level);
          break;
        }
      }
    });
  }

  setupSkillHover() {
    this.skillItems.forEach(skill => {
      skill.addEventListener('mouseenter', () => {
        skill.classList.add('pulse');
      });

      skill.addEventListener('mouseleave', () => {
        skill.classList.remove('pulse');
      });

      // Add click functionality for skill details
      skill.addEventListener('click', () => {
        this.showSkillDetails(skill);
      });
    });
  }

  showSkillDetails(skillElement) {
    const skillName = skillElement.dataset.skill || skillElement.textContent;
    const skillLevel = skillElement.getAttribute('data-level') || 'intermediate';
    
    // Create modal or tooltip with skill details
    this.createSkillModal(skillName, skillLevel);
  }

  createSkillModal(skillName, level) {
    // Remove existing modal
    const existingModal = document.querySelector('.skill-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'skill-modal';
    modal.innerHTML = `
      <div class="skill-modal-content">
        <div class="skill-modal-header">
          <h3>${skillName}</h3>
          <button class="skill-modal-close">&times;</button>
        </div>
        <div class="skill-modal-body">
          <div class="skill-level">
            <span class="level-label">Proficiency Level:</span>
            <span class="level-value ${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
          </div>
          <div class="skill-description">
            ${this.getSkillDescription(skillName)}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('skill-modal-close')) {
        modal.remove();
      }
    });

    // Add CSS for modal
    this.addModalStyles();
  }

  getSkillDescription(skillName) {
    const descriptions = {
      'python': 'Primary programming language for AI/ML development, data science, and web applications.',
      'tensorflow': 'Deep learning framework for building and training neural networks.',
      'pytorch': 'Dynamic deep learning framework preferred for research and production.',
      'langchain': 'Framework for developing applications powered by language models.',
      'aws': 'Cloud computing platform with extensive AI/ML and data services.',
      'docker': 'Containerization platform for deploying applications consistently.',
      // Add more descriptions as needed
    };

    return descriptions[skillName.toLowerCase()] || 
           `Experienced in ${skillName} for various AI/ML and development projects.`;
  }

  addModalStyles() {
    if (document.querySelector('#skill-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'skill-modal-styles';
    styles.textContent = `
      .skill-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      .skill-modal-content {
        background: var(--bg-primary);
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }
      
      .skill-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 12px 12px 0 0;
      }
      
      .skill-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .skill-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .skill-modal-body {
        padding: 20px;
      }
      
      .skill-level {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .level-value {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      .level-value.expert {
        background: #27ae60;
        color: white;
      }
      
      .level-value.advanced {
        background: #f39c12;
        color: white;
      }
      
      .level-value.intermediate {
        background: #3498db;
        color: white;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // Public method to expand all categories
  expandAllCategories() {
    this.collapsedCategories.clear();
    this.categoryHeaders.forEach(header => {
      const skillsGrid = header.closest('.skill-category').querySelector('.skills-grid');
      const toggleIcon = header.querySelector('.toggle-icon');
      
      skillsGrid.classList.remove('collapsed');
      header.classList.remove('collapsed');
      toggleIcon.style.transform = 'rotate(0deg)';
    });
  }

  // Public method to collapse all categories
  collapseAllCategories() {
    this.skillCategories.forEach(category => {
      const categoryId = category.dataset.category;
      const header = category.querySelector('.category-header');
      const skillsGrid = category.querySelector('.skills-grid');
      const toggleIcon = header.querySelector('.toggle-icon');
      
      this.collapsedCategories.add(categoryId);
      skillsGrid.classList.add('collapsed');
      header.classList.add('collapsed');
      toggleIcon.style.transform = 'rotate(-90deg)';
    });
  }
}

// Global function for category toggle (called from HTML)
function toggleCategory(header) {
  if (window.advancedSkillsManager) {
    window.advancedSkillsManager.toggleCategory(header);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.skills-container')) {
    window.advancedSkillsManager = new AdvancedSkillsManager();
  }
});
