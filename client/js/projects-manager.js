// ===== PROJECTS MANAGER =====
// Handles all project-related functionality

class ProjectsManager {
    constructor() {
        this.projects = projectsData.repositories;
        this.profile = projectsData.profile;
        this.currentFilter = 'all';
        this.currentSort = 'updated';
        this.searchQuery = '';
        this.projectsPerPage = 6;
        this.currentPage = 1;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.renderProfileCard();
        this.setupEventListeners();
        this.renderProjects();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }
        
        // Search input
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Clear search button
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreProjects');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProjects();
            });
        }
    }
    
    renderProfileCard() {
        const profileContainer = document.querySelector('.github-profile-card');
        if (!profileContainer) return;
        
        profileContainer.innerHTML = `
            <div class="profile-avatar">
                <div class="avatar-initials">VK</div>
                <div class="avatar-status"></div>
            </div>
            <div class="profile-info">
                <h3>${this.profile.displayName}</h3>
                <p class="profile-username">@${this.profile.username}</p>
                <p class="profile-description">${this.profile.description}</p>
                <div class="profile-stats">
                    <span class="stat-item">
                        <i class="fas fa-book"></i>
                        <strong>${this.profile.stats.repositories}</strong> Repositories
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-star"></i>
                        <strong>${this.profile.stats.stars}</strong> Stars
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-users"></i>
                        <strong>${this.profile.stats.followers}</strong> Followers
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-user-plus"></i>
                        <strong>${this.profile.stats.following}</strong> Following
                    </span>
                </div>
                <div class="profile-actions">
                    <a href="${this.profile.githubUrl}" target="_blank" class="btn btn-primary">
                        <i class="fab fa-github"></i>
                        View GitHub
                    </a>
                    <a href="#contact" class="btn btn-outline">
                        <i class="fas fa-envelope"></i>
                        Contact Me
                    </a>
                </div>
            </div>
        `;
    }
    
    getFilteredProjects() {
        let filtered = [...this.projects];
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(project => 
                project.name.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query) ||
                project.language.toLowerCase().includes(query) ||
                project.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(project => {
                switch (this.currentFilter) {
                    case 'featured':
                        return project.category === 'featured';
                    case 'python':
                        return project.language === 'Python';
                    case 'typescript':
                        return project.language === 'TypeScript';
                    case 'javascript':
                        return project.language === 'JavaScript';
                    case 'html':
                        return project.language === 'HTML';
                    case 'ai-ml':
                        return project.category === 'ai-ml' || project.tags.includes('ai') || project.tags.includes('machine-learning');
                    case 'web':
                        return project.category === 'web' || project.language === 'HTML' || project.language === 'JavaScript';
                    case 'public':
                        return project.status === 'public';
                    case 'private':
                        return project.status === 'private';
                    case 'forked':
                        return project.isForked;
                    default:
                        return true;
                }
            });
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'stars':
                    return b.stars - a.stars;
                case 'updated':
                    return this.parseDate(b.updated) - this.parseDate(a.updated);
                case 'language':
                    return a.language.localeCompare(b.language);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }
    
    parseDate(dateStr) {
        // Simple date parsing for sorting
        if (dateStr.includes('minute') || dateStr.includes('hour')) return new Date();
        if (dateStr.includes('day')) return new Date(Date.now() - parseInt(dateStr) * 24 * 60 * 60 * 1000);
        if (dateStr.includes('week')) return new Date(Date.now() - parseInt(dateStr) * 7 * 24 * 60 * 60 * 1000);
        return new Date(dateStr);
    }
    
    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;
        
        const filteredProjects = this.getFilteredProjects();
        const projectsToShow = filteredProjects.slice(0, this.currentPage * this.projectsPerPage);
        
        grid.innerHTML = '';
        
        if (projectsToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-projects">
                    <i class="fas fa-search"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }
        
        projectsToShow.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            grid.appendChild(projectCard);
        });
        
        this.updateLoadMoreButton(projectsToShow.length, filteredProjects.length);
        this.updateProjectCounter(projectsToShow.length, filteredProjects.length);
    }
    
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = `project-card ${project.status}`;
        card.style.animationDelay = `${(index % this.projectsPerPage) * 0.1}s`;
        
        const languageIcon = this.getLanguageIcon(project.language);
        const statusBadge = project.status === 'private' ? 
            '<span class="status-badge private"><i class="fas fa-lock"></i> Private</span>' : 
            '<span class="status-badge public"><i class="fas fa-globe"></i> Public</span>';
        
        const forkedBadge = project.isForked ? 
            '<span class="forked-badge"><i class="fas fa-code-branch"></i> Forked</span>' : '';
        
        card.innerHTML = `
            <div class="project-header">
                <div class="project-thumbnail" style="background: ${project.languageColor}20; border-left: 4px solid ${project.languageColor}">
                    <div class="thumbnail-icon">
                        <i class="${languageIcon}"></i>
                    </div>
                    <div class="project-language" style="background: ${project.languageColor}">
                        ${project.language}
                    </div>
                </div>
                <div class="project-badges">
                    ${statusBadge}
                    ${forkedBadge}
                </div>
            </div>
            
            <div class="project-content">
                <h3 class="project-title">
                    <a href="${project.githubUrl}" target="_blank">
                        ${project.name}
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </h3>
                
                <p class="project-description">${project.description}</p>
                
                <div class="project-tags">
                    ${project.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${project.tags.length > 3 ? `<span class="tag-more">+${project.tags.length - 3}</span>` : ''}
                </div>
                
                <div class="project-meta">
                    <div class="project-stats">
                        <span class="stat">
                            <i class="fas fa-star"></i>
                            ${project.stars}
                        </span>
                        <span class="stat">
                            <i class="fas fa-code-branch"></i>
                            ${project.forks}
                        </span>
                        ${project.license ? `<span class="stat"><i class="fas fa-balance-scale"></i> ${project.license}</span>` : ''}
                    </div>
                    <div class="project-updated">
                        <i class="fas fa-clock"></i>
                        Updated ${project.updated}
                    </div>
                </div>
                
                <div class="project-actions">
                    <a href="${project.githubUrl}" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fab fa-github"></i>
                        View Code
                    </a>
                    ${project.liveUrl ? `
                        <a href="${project.liveUrl}" target="_blank" class="btn btn-outline btn-sm">
                            <i class="fas fa-external-link-alt"></i>
                            Live Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        return card;
    }
    
    getLanguageIcon(language) {
        const icons = {
            'Python': 'fab fa-python',
            'JavaScript': 'fab fa-js-square',
            'TypeScript': 'fab fa-js-square',
            'HTML': 'fab fa-html5',
            'CSS': 'fab fa-css3-alt',
            'Jupyter Notebook': 'fas fa-book',
            'Config': 'fas fa-cog',
            'Java': 'fab fa-java',
            'C++': 'fas fa-code',
            'React': 'fab fa-react',
            'Vue': 'fab fa-vuejs',
            'Angular': 'fab fa-angular'
        };
        
        return icons[language] || 'fas fa-file-code';
    }
    
    handleFilterChange(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.currentPage = 1;
        this.renderProjects();
        this.updateStats();
    }
    
    handleSortChange(sort) {
        this.currentSort = sort;
        this.renderProjects();
    }
    
    handleSearch(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        this.renderProjects();
        
        // Show/hide clear button
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.style.display = query ? 'block' : 'none';
        }
    }
    
    clearSearch() {
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.value = '';
            this.handleSearch('');
        }
    }
    
    loadMoreProjects() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadMoreBtn = document.getElementById('loadMoreProjects');
        
        // Show loading state
        if (loadMoreBtn) {
            loadMoreBtn.classList.add('loading');
            loadMoreBtn.disabled = true;
        }
        
        // Simulate loading delay
        setTimeout(() => {
            this.currentPage++;
            this.renderProjects();
            this.isLoading = false;
            
            if (loadMoreBtn) {
                loadMoreBtn.classList.remove('loading');
                loadMoreBtn.disabled = false;
            }
        }, 800);
    }
    
    updateLoadMoreButton(shown, total) {
        const loadMoreBtn = document.getElementById('loadMoreProjects');
        if (!loadMoreBtn) return;
        
        if (shown >= total) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
    
    updateProjectCounter(shown, total) {
        const shownElement = document.getElementById('shownProjects');
        const totalElement = document.getElementById('totalProjects');
        
        if (shownElement) shownElement.textContent = shown;
        if (totalElement) totalElement.textContent = total;
    }
    
    updateStats() {
        const filteredProjects = this.getFilteredProjects();
        
        // Update filter button counts
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.dataset.filter;
            let count = 0;
            
            if (filter === 'all') {
                count = this.projects.length;
            } else {
                count = this.projects.filter(project => {
                    switch (filter) {
                        case 'featured': return project.category === 'featured';
                        case 'python': return project.language === 'Python';
                        case 'typescript': return project.language === 'TypeScript';
                        case 'javascript': return project.language === 'JavaScript';
                        case 'html': return project.language === 'HTML';
                        case 'ai-ml': return project.category === 'ai-ml' || project.tags.includes('ai');
                        case 'web': return project.category === 'web' || ['HTML', 'JavaScript', 'CSS'].includes(project.language);
                        case 'public': return project.status === 'public';
                        case 'private': return project.status === 'private';
                        case 'forked': return project.isForked;
                        default: return true;
                    }
                }).length;
            }
            
            // Update button text with count
            const originalText = btn.textContent.split('(')[0].trim();
            btn.textContent = `${originalText} (${count})`;
        });
    }
}

// Initialize projects manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof projectsData !== 'undefined') {
        window.projectsManager = new ProjectsManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
}
