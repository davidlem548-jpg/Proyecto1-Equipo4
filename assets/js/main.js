// Main JavaScript for Insurance System GitHub Pages
// Developed by David Fernando Ávila Díaz (CU: 197851)
// Academic project for COM-11117 - ITAM 2025

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page functionality
    initializeNavigation();
    initializeAnimations();
    initializeInteractions();
    initializeAccessibility();
    
    console.log('GitHub Pages initialized successfully');
});

/**
 * Navigation functionality
 */
function initializeNavigation() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    navbarToggler.click();
                }
            }
        });
    });
    
    // Update active navigation item on scroll
    window.addEventListener('scroll', updateActiveNavigation);
}

/**
 * Update active navigation item based on scroll position
 */
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize scroll animations
 */
function initializeAnimations() {
    // Create intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.feature-card, .team-card, .tech-card, .card, .stat-card'
    );
    
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
    
    // Add CSS for animations
    addAnimationStyles();
}

/**
 * Add animation CSS styles
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-element {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-element.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animate-element:nth-child(2) { transition-delay: 0.1s; }
        .animate-element:nth-child(3) { transition-delay: 0.2s; }
        .animate-element:nth-child(4) { transition-delay: 0.3s; }
        .animate-element:nth-child(5) { transition-delay: 0.4s; }
        .animate-element:nth-child(6) { transition-delay: 0.5s; }
        
        @media (prefers-reduced-motion: reduce) {
            .animate-element {
                opacity: 1;
                transform: none;
                transition: none;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize interactive elements
 */
function initializeInteractions() {
    // Add hover effects to cards
    addCardHoverEffects();
    
    // Add click effects to buttons
    addButtonClickEffects();
    
    // Add tooltips to technical elements
    addTooltips();
    
    // Initialize copy to clipboard functionality
    initializeCopyFeatures();
}

/**
 * Add hover effects to cards
 */
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .team-card, .tech-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Add click effects to buttons
 */
function addButtonClickEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add tooltips to technical elements
 */
function addTooltips() {
    const tooltipElements = [
        {
            selector: '.file-item',
            content: 'Click to view file details'
        },
        {
            selector: '.tech-item .badge',
            content: 'Technology category'
        },
        {
            selector: '.advanced-feature',
            content: 'Advanced technical feature'
        }
    ];
    
    tooltipElements.forEach(({ selector, content }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute('title', content);
            el.setAttribute('data-bs-toggle', 'tooltip');
        });
    });
}

/**
 * Initialize copy to clipboard functionality
 */
function initializeCopyFeatures() {
    // Add copy buttons to code-like elements
    const fileItems = document.querySelectorAll('.file-item strong');
    
    fileItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const text = this.textContent;
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    showCopyNotification(this);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyNotification(this);
            }
        });
    });
}

/**
 * Show copy notification
 */
function showCopyNotification(element) {
    const notification = document.createElement('div');
    notification.textContent = 'Copied!';
    notification.style.cssText = `
        position: absolute;
        background: var(--success-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        z-index: 1050;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: none;
    `;
    
    const rect = element.getBoundingClientRect();
    notification.style.left = rect.left + 'px';
    notification.style.top = (rect.top - 40) + 'px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Add skip to content link
    addSkipToContentLink();
    
    // Improve keyboard navigation
    improveKeyboardNavigation();
    
    // Add ARIA labels where needed
    addAriaLabels();
    
    // Handle focus management
    handleFocusManagement();
}

/**
 * Add skip to content link for accessibility
 */
function addSkipToContentLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#contribuciones';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.className = 'visually-hidden-focusable btn btn-primary';
    skipLink.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1060;
        padding: 0.5rem 1rem;
        text-decoration: none;
    `;
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Improve keyboard navigation
 */
function improveKeyboardNavigation() {
    // Add keyboard support for card interactions
    const interactiveCards = document.querySelectorAll('.feature-card, .team-card');
    
    interactiveCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Add ARIA labels for better accessibility
 */
function addAriaLabels() {
    // Add labels to navigation
    const navbar = document.querySelector('.navbar');
    navbar.setAttribute('aria-label', 'Navegación principal');
    
    // Add labels to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const heading = section.querySelector('h1, h2, h3');
        if (heading) {
            section.setAttribute('aria-labelledby', heading.id || heading.textContent);
        }
    });
    
    // Add labels to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const heading = card.querySelector('.card-header h5, h4, h5, h6');
        if (heading) {
            card.setAttribute('aria-labelledby', heading.textContent);
        }
    });
}

/**
 * Handle focus management
 */
function handleFocusManagement() {
    // Manage focus for mobile menu
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            setTimeout(() => {
                if (navbarCollapse.classList.contains('show')) {
                    const firstNavLink = navbarCollapse.querySelector('.nav-link');
                    if (firstNavLink) {
                        firstNavLink.focus();
                    }
                }
            }, 350); // Wait for Bootstrap animation
        });
    }
}

/**
 * Performance monitoring
 */
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }
    });
    
    // Monitor scroll performance
    let ticking = false;
    
    function optimizedScrollHandler() {
        updateActiveNavigation();
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(optimizedScrollHandler);
            ticking = true;
        }
    });
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Export for potential use by other scripts
window.GitHubPagesApp = {
    initializeNavigation,
    initializeAnimations,
    initializeInteractions,
    initializeAccessibility
};