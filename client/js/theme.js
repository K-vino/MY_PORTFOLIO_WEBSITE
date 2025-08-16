// ===== THEME TOGGLE FUNCTIONALITY =====

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
    
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Add event listener to theme toggle button
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Listen for system theme changes
    this.watchSystemTheme();
    
    console.log('Theme manager initialized with theme:', this.currentTheme);
  }

  getStoredTheme() {
    return localStorage.getItem('portfolio-theme');
  }

  getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    this.updateThemeToggleIcon();
    this.updateMetaThemeColor();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    
    // Add a subtle animation effect
    this.animateThemeTransition();
  }

  updateThemeToggleIcon() {
    if (!this.themeToggle) return;
    
    const icon = this.themeToggle.querySelector('i');
    if (icon) {
      if (this.currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
        this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
      } else {
        icon.className = 'fas fa-moon';
        this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  updateMetaThemeColor() {
    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    const themeColors = {
      light: '#ffffff',
      dark: '#0f172a'
    };
    
    metaThemeColor.content = themeColors[this.currentTheme];
  }

  animateThemeTransition() {
    // Add a smooth transition effect when switching themes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  watchSystemTheme() {
    // Listen for changes in system color scheme preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!this.getStoredTheme()) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }

  // Method to get current theme (useful for other components)
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Method to check if dark mode is active
  isDarkMode() {
    return this.currentTheme === 'dark';
  }
}

// ===== THEME-AWARE COMPONENTS =====

class ThemeAwareChart {
  constructor() {
    this.themeManager = window.themeManager;
  }

  getChartColors() {
    const isDark = this.themeManager?.isDarkMode();
    
    return {
      primary: isDark ? '#3b82f6' : '#2563eb',
      secondary: isDark ? '#64748b' : '#64748b',
      background: isDark ? '#334155' : '#ffffff',
      text: isDark ? '#f1f5f9' : '#1e293b',
      grid: isDark ? '#475569' : '#e2e8f0'
    };
  }
}

// ===== THEME UTILITIES =====

const ThemeUtils = {
  // Get CSS custom property value
  getCSSVariable(property) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim();
  },

  // Set CSS custom property value
  setCSSVariable(property, value) {
    document.documentElement.style.setProperty(property, value);
  },

  // Get theme-appropriate color
  getThemeColor(lightColor, darkColor) {
    const isDark = window.themeManager?.isDarkMode();
    return isDark ? darkColor : lightColor;
  },

  // Apply theme to external libraries (like charts)
  applyThemeToLibrary(libraryName, config) {
    const isDark = window.themeManager?.isDarkMode();
    
    switch (libraryName) {
      case 'chart.js':
        return {
          ...config,
          options: {
            ...config.options,
            plugins: {
              ...config.options?.plugins,
              legend: {
                ...config.options?.plugins?.legend,
                labels: {
                  ...config.options?.plugins?.legend?.labels,
                  color: isDark ? '#f1f5f9' : '#1e293b'
                }
              }
            },
            scales: {
              ...config.options?.scales,
              x: {
                ...config.options?.scales?.x,
                ticks: {
                  ...config.options?.scales?.x?.ticks,
                  color: isDark ? '#cbd5e1' : '#64748b'
                },
                grid: {
                  ...config.options?.scales?.x?.grid,
                  color: isDark ? '#475569' : '#e2e8f0'
                }
              },
              y: {
                ...config.options?.scales?.y,
                ticks: {
                  ...config.options?.scales?.y?.ticks,
                  color: isDark ? '#cbd5e1' : '#64748b'
                },
                grid: {
                  ...config.options?.scales?.y?.grid,
                  color: isDark ? '#475569' : '#e2e8f0'
                }
              }
            }
          }
        };
      
      default:
        return config;
    }
  }
};

// ===== THEME ANIMATIONS =====

class ThemeAnimations {
  static fadeTransition(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.opacity = '1';
      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    }, 50);
  }

  static slideTransition(element, direction = 'up', duration = 300) {
    const transforms = {
      up: 'translateY(20px)',
      down: 'translateY(-20px)',
      left: 'translateX(20px)',
      right: 'translateX(-20px)'
    };

    element.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
    element.style.transform = transforms[direction];
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
      setTimeout(() => {
        element.style.transition = '';
        element.style.transform = '';
      }, duration);
    }, 50);
  }
}

// ===== INITIALIZATION =====

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, ThemeUtils, ThemeAnimations };
}
