// ===== EXPERIENCE MANAGER =====
// Handles filtering and interactions for the experience section

class ExperienceManager {
    constructor() {
        this.currentFilter = 'all';
        this.timelineItems = [];
        this.categoryButtons = [];
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.updateCounts();
        this.animateOnScroll();
    }
    
    setupElements() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        
        // Add category classes to timeline items based on content
        this.categorizeTimelineItems();
    }
    
    categorizeTimelineItems() {
        this.timelineItems.forEach(item => {
            const content = item.textContent.toLowerCase();
            const date = item.querySelector('.timeline-date')?.textContent || '';
            
            // Add category classes based on content and date
            if (date.includes('2025')) {
                item.classList.add('current');
            }
            
            if (content.includes('internship') || content.includes('intern')) {
                item.classList.add('internships');
            }
            
            if (content.includes('certificate') || content.includes('certification') || 
                content.includes('credential') || item.querySelector('.certificate-link')) {
                item.classList.add('certifications');
            }
        });
    }
    
    setupEventListeners() {
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterExperience(category);
                this.updateActiveButton(e.target);
            });
        });
        
        // Certificate link tracking
        document.querySelectorAll('.certificate-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackCertificateClick(e.target);
            });
        });
    }
    
    filterExperience(category) {
        this.currentFilter = category;
        
        this.timelineItems.forEach((item, index) => {
            const shouldShow = this.shouldShowItem(item, category);
            
            if (shouldShow) {
                item.classList.remove('hidden');
                item.style.display = 'flex';
                // Stagger animation
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        this.updateCounts();
    }
    
    shouldShowItem(item, category) {
        switch (category) {
            case 'all':
                return true;
            case 'current':
                return item.classList.contains('current');
            case 'internships':
                return item.classList.contains('internships');
            case 'certifications':
                return item.classList.contains('certifications');
            default:
                return true;
        }
    }
    
    updateActiveButton(activeButton) {
        this.categoryButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    updateCounts() {
        const counts = this.getCategoryCounts();
        
        this.categoryButtons.forEach(button => {
            const category = button.dataset.category;
            const count = counts[category] || 0;
            const originalText = button.textContent.split('(')[0].trim();
            button.textContent = `${originalText} (${count})`;
        });
    }
    
    getCategoryCounts() {
        const counts = {
            all: this.timelineItems.length,
            current: 0,
            internships: 0,
            certifications: 0
        };
        
        this.timelineItems.forEach(item => {
            if (item.classList.contains('current')) counts.current++;
            if (item.classList.contains('internships')) counts.internships++;
            if (item.classList.contains('certifications')) counts.certifications++;
        });
        
        return counts;
    }
    
    trackCertificateClick(link) {
        const certificateName = link.textContent.trim();
        const timelineItem = link.closest('.timeline-item');
        const experienceTitle = timelineItem?.querySelector('h3')?.textContent || 'Unknown';
        
        // Analytics tracking (if implemented)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'certificate_click', {
                certificate_name: certificateName,
                experience_title: experienceTitle,
                category: 'engagement'
            });
        }
        
        console.log(`📜 Certificate clicked: ${certificateName} from ${experienceTitle}`);
    }
    
    animateOnScroll() {
        // Intersection Observer for timeline items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate certificate links
                    const certificateLinks = entry.target.querySelectorAll('.certificate-link');
                    certificateLinks.forEach((link, index) => {
                        setTimeout(() => {
                            link.style.opacity = '1';
                            link.style.transform = 'translateY(0)';
                        }, 200 + (index * 100));
                    });
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.timelineItems.forEach(item => {
            observer.observe(item);
            
            // Set initial state for certificate links
            const certificateLinks = item.querySelectorAll('.certificate-link');
            certificateLinks.forEach(link => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(20px)';
                link.style.transition = 'all 0.4s ease';
            });
        });
    }
    
    // Public methods
    showCategory(category) {
        const button = document.querySelector(`[data-category="${category}"]`);
        if (button) {
            button.click();
        }
    }
    
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    getVisibleItemsCount() {
        return Array.from(this.timelineItems).filter(item => 
            !item.classList.contains('hidden')
        ).length;
    }
    
    highlightExperience(experienceTitle) {
        this.timelineItems.forEach(item => {
            const title = item.querySelector('h3')?.textContent;
            if (title && title.toLowerCase().includes(experienceTitle.toLowerCase())) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                item.style.background = 'rgba(37, 99, 235, 0.1)';
                item.style.borderRadius = 'var(--radius-lg)';
                item.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    item.style.background = '';
                }, 2000);
            }
        });
    }
}

// Enhanced timeline animations
function addTimelineAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .timeline-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .timeline-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .timeline-item:nth-child(even) {
            transform: translateX(-30px);
        }
        
        .timeline-item:nth-child(even).animate-in {
            transform: translateX(0);
        }
        
        .certificate-link {
            position: relative;
            overflow: hidden;
        }
        
        .certificate-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .certificate-link:hover::before {
            left: 100%;
        }
        
        .experience-summary {
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s ease;
        }
        
        .experience-summary.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .stat-item {
            transform: scale(0.9);
            transition: all 0.4s ease;
        }
        
        .stat-item.animate-in {
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);
}

// Initialize experience manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other scripts to load
    setTimeout(() => {
        window.experienceManager = new ExperienceManager();
        addTimelineAnimations();
        
        // Animate summary section
        const summaryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate stat items
                    const statItems = entry.target.querySelectorAll('.stat-item');
                    statItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate-in');
                        }, index * 150);
                    });
                }
            });
        }, { threshold: 0.3 });
        
        const summarySection = document.querySelector('.experience-summary');
        if (summarySection) {
            summaryObserver.observe(summarySection);
        }
        
        console.log('💼 Experience Manager initialized');
    }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperienceManager;
}
