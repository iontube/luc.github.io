// ============================================
// FLORENTINA STANCIU WEBSITE - JAVASCRIPT
// Interactive features and smooth animations
// ============================================

// ============================================
// DOM ELEMENTS
// ============================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('a[href^="#"]');
const galleryItems = document.querySelectorAll('.gallery-item');

// ============================================
// NAVBAR SCROLL EFFECT
// Add semi-transparent background on scroll
// ============================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ============================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ============================================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetSection.offsetTop - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const mobileMenu = document.getElementById('navbar-default');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// ============================================
// GALLERY LIGHTBOX FUNCTIONALITY
// Simple lightbox effect for gallery images
// ============================================
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            openLightbox(img.src, img.alt);
        }
    });
});

// Create and show lightbox
function openLightbox(src, alt) {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-4 cursor-pointer';
    lightbox.id = 'lightbox';

    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'max-w-6xl max-h-full relative animate-fade-in';

    // Create image
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    `;
    closeBtn.className = 'absolute top-4 right-4 text-white hover:text-rose-400 transition-colors bg-black bg-opacity-50 rounded-full p-2';

    // Assemble lightbox
    imgContainer.appendChild(img);
    imgContainer.appendChild(closeBtn);
    lightbox.appendChild(imgContainer);
    document.body.appendChild(lightbox);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Close lightbox on click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === closeBtn || e.target.closest('button') === closeBtn) {
            closeLightbox();
        }
    });

    // Close lightbox on ESC key
    document.addEventListener('keydown', handleEscKey);
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscKey);
    }
}

// Handle ESC key press
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// Animate elements when they come into view
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('section > div, .service-card, .gallery-item');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
});

// ============================================
// MOBILE MENU ACCESSIBILITY
// Improve mobile menu behavior
// ============================================
const menuToggle = document.querySelector('[data-collapse-toggle]');
const mobileMenu = document.getElementById('navbar-default');

if (menuToggle && mobileMenu) {
    // Add keyboard support
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            menuToggle.click();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = navbar.contains(e.target);
        const isMenuOpen = !mobileMenu.classList.contains('hidden');

        if (!isClickInside && isMenuOpen) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// ============================================
// LAZY LOADING IMAGES
// Improve performance by lazy loading images
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// FORM VALIDATION (if needed later)
// Placeholder for contact form validation
// ============================================
function validateForm(formData) {
    const errors = {};

    // Add validation rules here when contact form is implemented

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for resize events
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Optimize scroll listener with debounce
const optimizedScroll = debounce(() => {
    // Additional scroll-based animations can be added here
}, 100);

window.addEventListener('scroll', optimizedScroll);

// ============================================
// ANALYTICS INTEGRATION (Placeholder)
// Add Google Analytics or other tracking here
// ============================================
function trackEvent(category, action, label) {
    // Example: gtag('event', action, { event_category: category, event_label: label });
    console.log(`Event tracked: ${category} - ${action} - ${label}`);
}

// Track Instagram button clicks
const instagramButton = document.querySelector('a[href*="instagram.com"]');
if (instagramButton) {
    instagramButton.addEventListener('click', () => {
        trackEvent('Social Media', 'Click', 'Instagram Button - @florentina__s__mua');
    });
}

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('%c✨ Florentina Stanciu - Make-up & Lami Artist ✨', 'color: #c9a686; font-size: 16px; font-weight: bold;');
console.log('%cWebsite developed with love using Tailwind CSS & Flowbite', 'color: #d5b69a; font-size: 12px;');
