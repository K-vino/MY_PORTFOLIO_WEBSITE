// ===== PERFORMANCE OPTIMIZATION =====

class PerformanceOptimizer {
  constructor() {
    this.observers = new Map();
    this.loadedResources = new Set();
    this.criticalResources = new Set();
    
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupResourceHints();
    this.setupCriticalResourceLoading();
    this.setupPerformanceMonitoring();
    this.optimizeImages();
    this.setupServiceWorker();
    
    console.log('Performance optimizer initialized');
  }

  // ===== LAZY LOADING =====
  setupLazyLoading() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });

      this.observers.set('images', imageObserver);
    }

    // Lazy load sections
    this.setupSectionLazyLoading();
  }

  loadImage(img) {
    return new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = tempImg.src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        resolve(img);
      };
      
      tempImg.onerror = () => {
        img.classList.add('error');
        reject(new Error(`Failed to load image: ${img.dataset.src}`));
      };
      
      tempImg.src = img.dataset.src;
    });
  }

  setupSectionLazyLoading() {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          this.loadSectionContent(section);
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('section[data-lazy]').forEach(section => {
      sectionObserver.observe(section);
    });

    this.observers.set('sections', sectionObserver);
  }

  loadSectionContent(section) {
    const sectionId = section.id;
    
    switch (sectionId) {
      case 'projects':
        if (typeof loadProjects === 'function') {
          loadProjects();
        }
        break;
      case 'skills':
        this.animateSkillBars();
        break;
      case 'achievements':
        this.animateCounters();
        break;
    }
    
    section.removeAttribute('data-lazy');
  }

  // ===== RESOURCE HINTS =====
  setupResourceHints() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Prefetch likely next resources
    this.prefetchResources();
    
    // Preconnect to external domains
    this.preconnectDomains();
  }

  preloadCriticalResources() {
    const criticalResources = [
      { href: './css/style.css', as: 'style' },
      { href: './js/main.js', as: 'script' },
      { href: './assets/images/vino.png', as: 'image' }
    ];

    criticalResources.forEach(resource => {
      if (!this.criticalResources.has(resource.href)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') {
          link.onload = () => {
            link.rel = 'stylesheet';
          };
        }
        document.head.appendChild(link);
        this.criticalResources.add(resource.href);
      }
    });
  }

  prefetchResources() {
    const prefetchResources = [
      './assets/resume/VINO_k.pdf',
      'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2'
    ];

    // Prefetch after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        prefetchResources.forEach(href => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          document.head.appendChild(link);
        });
      }, 2000);
    });
  }

  preconnectDomains() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
      'https://unpkg.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // ===== CRITICAL RESOURCE LOADING =====
  setupCriticalResourceLoading() {
    // Load critical CSS inline for above-the-fold content
    this.inlineCriticalCSS();
    
    // Defer non-critical CSS
    this.deferNonCriticalCSS();
    
    // Load JavaScript asynchronously
    this.loadJavaScriptAsync();
  }

  inlineCriticalCSS() {
    // This would typically be done during build process
    // For now, we ensure critical styles are loaded first
    const criticalStyles = `
      body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
      .hero { min-height: 100vh; display: flex; align-items: center; }
      .navbar { position: fixed; top: 0; width: 100%; z-index: 1000; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalStyles;
    document.head.insertBefore(style, document.head.firstChild);
  }

  deferNonCriticalCSS() {
    const nonCriticalCSS = [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      'https://unpkg.com/aos@2.3.1/dist/aos.css'
    ];

    window.addEventListener('load', () => {
      nonCriticalCSS.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
        document.head.appendChild(link);
      });
    });
  }

  loadJavaScriptAsync() {
    const scripts = [
      'https://unpkg.com/aos@2.3.1/dist/aos.js'
    ];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }

  // ===== PERFORMANCE MONITORING =====
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor resource loading
    this.monitorResourceLoading();
    
    // Monitor user interactions
    this.monitorUserInteractions();
  }

  monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  monitorResourceLoading() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      console.log('Resources Loaded:', resources.length);
    });
  }

  monitorUserInteractions() {
    // Track time to first interaction
    let firstInteraction = null;
    
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        if (!firstInteraction) {
          firstInteraction = performance.now();
          console.log('Time to First Interaction:', firstInteraction);
        }
      }, { once: true, passive: true });
    });
  }

  // ===== IMAGE OPTIMIZATION =====
  optimizeImages() {
    // Convert images to WebP if supported
    this.setupWebPSupport();
    
    // Implement responsive images
    this.setupResponsiveImages();
  }

  setupWebPSupport() {
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (supportsWebP()) {
      document.documentElement.classList.add('webp');
    } else {
      document.documentElement.classList.add('no-webp');
    }
  }

  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-sizes]');
    
    images.forEach(img => {
      const sizes = JSON.parse(img.dataset.sizes);
      const srcset = sizes.map(size => `${size.src} ${size.width}w`).join(', ');
      
      img.srcset = srcset;
      img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    });
  }

  // ===== SERVICE WORKER =====
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }

  // ===== ANIMATION HELPERS =====
  animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
      const progress = bar.dataset.progress;
      bar.style.width = `${progress}%`;
    });
  }

  animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.counter);
      let current = 0;
      const increment = target / 60;
      
      const updateCounter = () => {
        current += increment;
        if (current >= target) {
          current = target;
        }
        counter.textContent = Math.floor(current);
        
        if (current < target) {
          requestAnimationFrame(updateCounter);
        }
      };
      
      updateCounter();
    });
  }

  // ===== CLEANUP =====
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.loadedResources.clear();
    this.criticalResources.clear();
  }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}
