// ===== VERTICAL SCROLL NAVIGATION =====

class VerticalScrollManager {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navbar = document.getElementById('navbar');
    this.progressBar = null;
    this.backToTopBtn = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }

  init() {
    this.createProgressBar();
    this.createBackToTopButton();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.updateActiveSection();
    console.log('🔄 Vertical scroll navigation initialized');
  }

  createProgressBar() {
    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress';
    this.progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(this.progressBar);

    // Add CSS for progress bar
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 9999;
        backdrop-filter: blur(10px);
      }
      
      .scroll-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        width: 0%;
        transition: width 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  createBackToTopButton() {
    // Create back to top button
    this.backToTopBtn = document.createElement('button');
    this.backToTopBtn.className = 'back-to-top';
    this.backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    this.backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(this.backToTopBtn);

    // Add CSS for back to top button
    const style = document.createElement('style');
    style.textContent = `
      .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      
      .back-to-top.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .back-to-top:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Smooth scroll for navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          this.scrollToSection(targetSection);
        }
      });
    });

    // Back to top button
    this.backToTopBtn.addEventListener('click', () => {
      this.scrollToSection(document.getElementById('home'));
    });

    // Scroll events
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
      this.updateBackToTopButton();
      this.updateActiveSection();
      this.updateNavbarOnScroll();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        this.scrollToNextSection();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.scrollToPrevSection();
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.scrollToSection(document.getElementById('home'));
      } else if (e.key === 'End') {
        e.preventDefault();
        this.scrollToSection(this.sections[this.sections.length - 1]);
      }
    });
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.setActiveNavLink(id);
        }
      });
    }, options);

    this.sections.forEach(section => {
      this.observer.observe(section);
    });
  }

  scrollToSection(targetSection) {
    if (!targetSection) return;

    const offsetTop = targetSection.offsetTop - 80; // Account for navbar height
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }

  scrollToNextSection() {
    const currentSection = this.getCurrentSection();
    const currentIndex = Array.from(this.sections).indexOf(currentSection);
    
    if (currentIndex < this.sections.length - 1) {
      this.scrollToSection(this.sections[currentIndex + 1]);
    }
  }

  scrollToPrevSection() {
    const currentSection = this.getCurrentSection();
    const currentIndex = Array.from(this.sections).indexOf(currentSection);
    
    if (currentIndex > 0) {
      this.scrollToSection(this.sections[currentIndex - 1]);
    }
  }

  getCurrentSection() {
    const scrollPosition = window.scrollY + 100;
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      if (section.offsetTop <= scrollPosition) {
        return section;
      }
    }
    
    return this.sections[0];
  }

  setActiveNavLink(activeId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }

  updateActiveSection() {
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      const id = currentSection.getAttribute('id');
      this.setActiveNavLink(id);
    }
  }

  updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (this.progressBar) {
      const progressBarFill = this.progressBar.querySelector('.scroll-progress-bar');
      progressBarFill.style.width = `${Math.min(scrollPercent, 100)}%`;
    }
  }

  updateBackToTopButton() {
    const scrollTop = window.scrollY;

    if (scrollTop > 300) {
      this.backToTopBtn.classList.add('visible');
    } else {
      this.backToTopBtn.classList.remove('visible');
    }
  }

  updateNavbarOnScroll() {
    const scrollTop = window.scrollY;

    if (scrollTop > 100) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.VerticalScrollManager = new VerticalScrollManager();
});

// Make it available globally
window.VerticalScrollManager = VerticalScrollManager;
