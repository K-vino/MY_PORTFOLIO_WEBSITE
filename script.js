document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Typing Effect (Hero Section) ---
    const typingText = document.getElementById('typing-text');
    const roles = [
        "Data Scientist",
        "ML Engineer",
        "AI Developer",
        "Open-Source Contributor"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    if (typingText) type();


    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });


    // --- 3. Sticky Navbar & Active Link Highlight ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        // Sticky Navbar Class
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'rgba(10, 10, 10, 0.85)';
            navbar.style.boxShadow = 'none';
        }

        // Active Link Highlight
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });

        // --- 6. Scroll to Top Button Visibility ---
        const scrollTopBtn = document.getElementById('scroll-top');
        if (scrollTopBtn) {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });


    // --- 4. Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });


    // --- 5. Stats Counter Animation ---
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    const statsSection = document.querySelector('.github-stats');

    if (statsSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasCounted) {
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // ms
                    const increment = target / (duration / 16); // 60fps

                    let current = 0;
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target + "+";
                        }
                    };
                    updateCounter();
                });
                hasCounted = true;
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // --- 6. Scroll to Top Action ---
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 7. Element Reveal on Scroll ---
    const revealElements = document.querySelectorAll('.project-card, .skill-category, .timeline-item');

    // Initial hidden state for animation
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // --- 8. Dynamic Project Rendering ---
    const projectsGrid = document.querySelector('.projects-grid');

    if (projectsGrid && typeof projectsData !== 'undefined') {
        const projects = projectsData.repositories;

        // Function to render projects
        function renderProjects(category = 'all') {
            projectsGrid.innerHTML = '';

            // Filter projects
            const filteredProjects = projects.filter(project => {
                if (category === 'all') return true;
                if (category === 'featured' && project.category === 'featured') return true;
                // Simple keyword matching for other categories
                const searchStr = (project.name + ' ' + (project.description || '') + ' ' + (project.tags || []).join(' ')).toLowerCase();
                const catStr = category.toLowerCase().replace(/-/g, ' ');
                if (searchStr.includes(catStr)) return true;

                return false;
            });

            // Limit to top 9 filtered results
            const projectsToShow = filteredProjects.slice(0, 9);

            if (projectsToShow.length === 0) {
                projectsGrid.innerHTML = '<p class="no-projects" style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No projects found in this category.</p>';
                return;
            }

            projectsToShow.forEach((project, index) => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.style.opacity = '0'; // For animation
                card.style.transform = 'translateY(20px)';

                // Determine tech badges
                const techBadges = Array.isArray(project.tags)
                    ? project.tags.slice(0, 4).map(tag => `<span class="tech-badge">${tag}</span>`).join('')
                    : `<span class="tech-badge">${project.language || 'Code'}</span>`;

                card.innerHTML = `
                    <div class="project-content">
                        <div class="project-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <h3 class="project-title" style="margin:0; font-size:1.2rem;">${project.name.replace(/-/g, ' ')}</h3>
                            <span class="project-lang-dot" style="width:10px; height:10px; border-radius:50%; background-color: ${project.languageColor || '#00f260'}; display:inline-block;"></span>
                        </div>
                        <p class="project-desc">${project.description || 'No description available.'}</p>
                        <div class="project-tech">
                            ${techBadges}
                        </div>
                        <div class="project-links">
                            <a href="${project.githubUrl}" target="_blank" class="btn-icon"><i class="fab fa-github"></i> Code</a>
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="btn-icon"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
                        </div>
                    </div>
                `;

                projectsGrid.appendChild(card);

                // Animate entry
                setTimeout(() => {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }

        // Initial Render
        renderProjects('featured');

        // Create Filter Buttons
        const projectsSection = document.querySelector('#projects .container');
        const title = projectsSection.querySelector('.section-title');

        // Check if filter container already exists to avoid duplicates
        if (!document.querySelector('.project-filters')) {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'project-filters';
            filterContainer.style.cssText = 'display:flex; justify-content:center; gap:15px; margin-bottom:40px; flex-wrap:wrap;';

            const filters = [
                { id: 'all', label: 'All Projects' },
                { id: 'featured', label: 'Featured' },
                { id: 'machine-learning', label: 'ML / AI' },
                { id: 'data-science', label: 'Data Science' },
                { id: 'python', label: 'Python' }
            ];

            filters.forEach(filter => {
                const btn = document.createElement('button');
                btn.textContent = filter.label;
                btn.className = filter.id === 'featured' ? 'btn btn-outline active' : 'btn btn-outline';
                btn.dataset.filter = filter.id;

                // Style adjustments
                btn.style.borderRadius = '30px';
                btn.style.fontSize = '0.9rem';
                btn.style.padding = '8px 20px';
                if (filter.id !== 'featured') {
                    btn.style.borderColor = 'rgba(255,255,255,0.1)';
                    btn.style.color = 'var(--text-muted)';
                }

                btn.addEventListener('click', () => {
                    document.querySelectorAll('.project-filters .btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.borderColor = 'rgba(255,255,255,0.1)';
                        b.style.color = 'var(--text-muted)';
                        b.style.background = 'transparent';
                    });
                    btn.classList.add('active');
                    btn.style.borderColor = 'var(--accent-primary)';
                    btn.style.color = 'var(--accent-primary)';

                    renderProjects(filter.id);
                });

                filterContainer.appendChild(btn);
            });

            title.insertAdjacentElement('afterend', filterContainer);
        }
    }

});
