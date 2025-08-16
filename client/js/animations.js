// ===== ADVANCED ANIMATIONS =====

class AnimationController {
  constructor() {
    this.observers = new Map();
    this.animationQueue = [];
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupScrollAnimations();
    this.setupHoverAnimations();
    this.setupLoadAnimations();
    
    console.log('Animation controller initialized');
  }

  // ===== INTERSECTION OBSERVER =====
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
        }
      });
    }, options);

    // Observe elements with animation classes
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    this.observers.set('intersection', observer);
  }

  // ===== SCROLL ANIMATIONS =====
  setupScrollAnimations() {
    let ticking = false;

    const updateAnimations = () => {
      this.updateParallaxElements();
      this.updateProgressBars();
      this.updateCounters();
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
      }
    });
  }

  updateParallaxElements() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && !bar.classList.contains('animated')) {
        const progress = bar.dataset.progress || 0;
        this.animateProgressBar(bar, progress);
        bar.classList.add('animated');
      }
    });
  }

  updateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
      const rect = counter.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && !counter.classList.contains('counted')) {
        const target = parseInt(counter.dataset.counter);
        this.animateCounter(counter, target);
        counter.classList.add('counted');
      }
    });
  }

  // ===== HOVER ANIMATIONS =====
  setupHoverAnimations() {
    // Magnetic effect for buttons
    document.querySelectorAll('.btn, .project-card, .skill-item').forEach(element => {
      element.addEventListener('mouseenter', (e) => this.addMagneticEffect(e.target));
      element.addEventListener('mouseleave', (e) => this.removeMagneticEffect(e.target));
      element.addEventListener('mousemove', (e) => this.updateMagneticEffect(e));
    });

    // Tilt effect for cards
    document.querySelectorAll('.project-card, .achievement-card').forEach(card => {
      card.addEventListener('mouseenter', () => this.addTiltEffect(card));
      card.addEventListener('mouseleave', () => this.removeTiltEffect(card));
      card.addEventListener('mousemove', (e) => this.updateTiltEffect(e, card));
    });
  }

  // ===== LOAD ANIMATIONS =====
  setupLoadAnimations() {
    // Stagger animation for grid items
    this.staggerGridItems('.skills-grid .skill-item', 100);
    this.staggerGridItems('.projects-container .project-card', 150);
    this.staggerGridItems('.achievements-grid .achievement-card', 200);
  }

  // ===== ANIMATION METHODS =====
  triggerAnimation(element) {
    const animationType = element.dataset.animate;
    const delay = parseInt(element.dataset.delay) || 0;

    setTimeout(() => {
      switch (animationType) {
        case 'fadeInUp':
          this.fadeInUp(element);
          break;
        case 'fadeInLeft':
          this.fadeInLeft(element);
          break;
        case 'fadeInRight':
          this.fadeInRight(element);
          break;
        case 'scaleIn':
          this.scaleIn(element);
          break;
        case 'slideInUp':
          this.slideInUp(element);
          break;
        default:
          this.fadeInUp(element);
      }
    }, delay);
  }

  fadeInUp(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }

  fadeInLeft(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(-30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    });
  }

  fadeInRight(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    });
  }

  scaleIn(element) {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.8)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    });
  }

  slideInUp(element) {
    element.style.transform = 'translateY(100%)';
    element.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)';
    });
  }

  // ===== PROGRESS BAR ANIMATION =====
  animateProgressBar(bar, targetProgress) {
    const progressFill = bar.querySelector('.progress-fill') || bar;
    let currentProgress = 0;
    const increment = targetProgress / 60; // 60 frames for smooth animation

    const animate = () => {
      currentProgress += increment;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
      }

      progressFill.style.width = `${currentProgress}%`;

      if (currentProgress < targetProgress) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // ===== COUNTER ANIMATION =====
  animateCounter(element, target) {
    let current = 0;
    const increment = target / 60; // 60 frames
    const suffix = element.dataset.suffix || '';

    const animate = () => {
      current += increment;
      if (current >= target) {
        current = target;
      }

      element.textContent = Math.floor(current) + suffix;

      if (current < target) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // ===== MAGNETIC EFFECT =====
  addMagneticEffect(element) {
    element.style.transition = 'transform 0.3s ease';
  }

  removeMagneticEffect(element) {
    element.style.transform = 'translate(0, 0)';
  }

  updateMagneticEffect(e) {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const moveX = x * 0.1;
    const moveY = y * 0.1;
    
    element.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  // ===== TILT EFFECT =====
  addTiltEffect(element) {
    element.style.transition = 'transform 0.3s ease';
    element.style.transformStyle = 'preserve-3d';
  }

  removeTiltEffect(element) {
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }

  updateTiltEffect(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // ===== STAGGER ANIMATIONS =====
  staggerGridItems(selector, delay) {
    const items = document.querySelectorAll(selector);
    
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * delay);
    });
  }

  // ===== UTILITY METHODS =====
  addToQueue(animation) {
    this.animationQueue.push(animation);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.animationQueue.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;
    const animation = this.animationQueue.shift();
    
    animation().then(() => {
      this.processQueue();
    });
  }

  // ===== CLEANUP =====
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.animationQueue = [];
  }
}

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || 2,
      particleSpeed: options.particleSpeed || 1,
      particleColor: options.particleColor || '#3b82f6',
      ...options
    };
    
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.createParticles();
    this.animate();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '-1';
    
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }

  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.particleSpeed,
        vy: (Math.random() - 0.5) * this.options.particleSpeed,
        size: Math.random() * this.options.particleSize + 1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.options.particleColor;
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  window.animationController = new AnimationController();
  
  // Add particle system to hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    new ParticleSystem(heroSection, {
      particleCount: 30,
      particleSize: 1,
      particleSpeed: 0.5,
      particleColor: 'rgba(59, 130, 246, 0.3)'
    });
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationController, ParticleSystem };
}
