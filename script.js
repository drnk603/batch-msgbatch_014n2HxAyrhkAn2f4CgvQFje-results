(function() {
    'use strict';

    const app = {
        initialized: false,
        modules: {}
    };

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    class BurgerMenu {
        constructor() {
            this.toggle = document.querySelector('.c-nav__toggle');
            this.menu = document.querySelector('.navbar-collapse');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.isOpen = false;
            
            if (this.toggle && this.menu) {
                this.init();
            }
        }

        init() {
            this.toggle.addEventListener('click', () => this.toggleMenu());
            
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isOpen && window.innerWidth < 768) {
                        this.closeMenu();
                    }
                });
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
                    this.closeMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                }
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 768 && this.isOpen) {
                    this.closeMenu();
                }
            }, 150));
        }

        toggleMenu() {
            this.isOpen ? this.closeMenu() : this.openMenu();
        }

        openMenu() {
            this.isOpen = true;
            this.menu.classList.add('show');
            this.menu.style.height = `calc(100vh - var(--header-h))`;
            this.toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('u-no-scroll');
        }

        closeMenu() {
            this.isOpen = false;
            this.menu.classList.remove('show');
            this.menu.style.height = '';
            this.toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('u-no-scroll');
        }
    }

    class ScrollSpy {
        constructor() {
            this.sections = document.querySelectorAll('section[id]');
            this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
            
            if (this.sections.length && this.navLinks.length) {
                this.init();
            }
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.updateActiveLink(entry.target.id);
                        }
                    });
                },
                {
                    rootMargin: '-20% 0px -60% 0px',
                    threshold: 0
                }
            );

            this.sections.forEach(section => observer.observe(section));
        }

        updateActiveLink(id) {
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
                
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetId = href.substring(1);
                const target = document.getElementById(targetId);

                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.l-header')?.offsetHeight || 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    class FormValidator {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.patterns = {
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                phone: /^[\+\d\s\(\)\-]{10,20}$/,
                name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
                message: /^.{10,}$/
            };
            
            if (this.forms.length) {
                this.init();
            }
        }

        init() {
            this.forms.forEach(form => {
                form.noValidate = true;
                form.addEventListener('submit', (e) => this.handleSubmit(e, form));

                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => {
                        if (input.classList.contains('is-invalid')) {
                            this.validateField(input);
                        }
                    });
                });
            });
        }

        validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            const id = field.id;
            let isValid = true;
            let message = '';

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                message = 'Dit veld is verplicht';
            } else if (value) {
                if (type === 'email' || id.includes('email')) {
                    if (!this.patterns.email.test(value)) {
                        isValid = false;
                        message = 'Voer een geldig e-mailadres in';
                    }
                } else if (type === 'tel' || id.includes('phone')) {
                    if (!this.patterns.phone.test(value)) {
                        isValid = false;
                        message = 'Voer een geldig telefoonnummer in';
                    }
                } else if (id.includes('name') || id.includes('Name')) {
                    if (!this.patterns.name.test(value)) {
                        isValid = false;
                        message = 'Voer een geldige naam in (alleen letters)';
                    }
                } else if (id.includes('message')) {
                    if (!this.patterns.message.test(value)) {
                        isValid = false;
                        message = 'Bericht moet minimaal 10 tekens bevatten';
                    }
                }
            }

            if (type === 'checkbox' && field.hasAttribute('required')) {
                if (!field.checked) {
                    isValid = false;
                    message = 'U moet akkoord gaan met de voorwaarden';
                }
            }

            this.updateFieldStatus(field, isValid, message);
            return isValid;
        }

        updateFieldStatus(field, isValid, message) {
            const feedbackEl = field.parentElement.querySelector('.invalid-feedback') || 
                              this.createFeedbackElement(field);

            if (isValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                feedbackEl.textContent = '';
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                feedbackEl.textContent = message;
            }
        }

        createFeedbackElement(field) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentElement.appendChild(feedback);
            return feedback;
        }

        handleSubmit(e, form) {
            e.preventDefault();

            const fields = form.querySelectorAll('input, textarea, select');
            let isFormValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verzenden...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            setTimeout(() => {
                window.location.href = 'thank_you.html';
            }, 1000);
        }
    }

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('img, .card, .btn, h1, h2, h3, p, .accordion-item');
            
            if (this.elements.length) {
                this.init();
            }
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            this.elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `opacity 0.8s ease-out ${index * 0.05}s, transform 0.8s ease-out ${index * 0.05}s`;
                observer.observe(el);
            });
        }
    }

    class ButtonEffects {
        constructor() {
            this.buttons = document.querySelectorAll('.btn, .c-button, .c-btn, a.nav-link');
            
            if (this.buttons.length) {
                this.init();
            }
        }

        init() {
            this.buttons.forEach(btn => {
                btn.addEventListener('mouseenter', (e) => {
                    const ripple = document.createElement('span');
                    ripple.className = 'ripple-effect';
                    ripple.style.cssText = `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        width: 20px;
                        height: 20px;
                        pointer-events: none;
                        animation: ripple-animation 0.6s ease-out;
                    `;
                    
                    const rect = btn.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                    
                    if (btn.style.position !== 'absolute' && btn.style.position !== 'relative') {
                        btn.style.position = 'relative';
                    }
                    btn.style.overflow = 'hidden';
                    
                    btn.appendChild(ripple);
                    
                    setTimeout(() => ripple.remove(), 600);
                });
            });

            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    class CountUp {
        constructor() {
            this.counters = document.querySelectorAll('[data-count]');
            
            if (this.counters.length) {
                this.init();
            }
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateCount(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            this.counters.forEach(counter => observer.observe(counter));
        }

        animateCount(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }
    }

    class CardHoverEffects {
        constructor() {
            this.cards = document.querySelectorAll('.card, .c-service-card, .c-team-card');
            
            if (this.cards.length) {
                this.init();
            }
        }

        init() {
            this.cards.forEach(card => {
                card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                    card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.boxShadow = '';
                });
            });
        }
    }

    class AccordionEnhancement {
        constructor() {
            this.accordions = document.querySelectorAll('.accordion-button');
            
            if (this.accordions.length) {
                this.init();
            }
        }

        init() {
            this.accordions.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const target = button.getAttribute('data-bs-target');
                    const collapse = document.querySelector(target);
                    
                    if (collapse) {
                        const isExpanded = button.getAttribute('aria-expanded') === 'true';
                        
                        button.setAttribute('aria-expanded', !isExpanded);
                        button.classList.toggle('collapsed', isExpanded);
                        collapse.classList.toggle('show', !isExpanded);
                    }
                });
            });
        }
    }

    class ImageLazyLoad {
        constructor() {
            this.images = document.querySelectorAll('img');
            this.videos = document.querySelectorAll('video');
            
            if (this.images.length || this.videos.length) {
                this.init();
            }
        }

        init() {
            this.images.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }

                img.addEventListener('error', () => {
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236c757d" font-family="system-ui" font-size="14"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';
                }, { once: true });
            });

            this.videos.forEach(video => {
                if (!video.hasAttribute('loading')) {
                    video.setAttribute('loading', 'lazy');
                }
            });
        }
    }

    class ScrollToTop {
        constructor() {
            this.button = this.createButton();
            this.init();
        }

        createButton() {
            const btn = document.createElement('button');
            btn.innerHTML = '↑';
            btn.className = 'scroll-to-top';
            btn.setAttribute('aria-label', 'Scroll naar boven');
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--color-accent);
                color: white;
                border: none;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s ease;
                z-index: 999;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            document.body.appendChild(btn);
            return btn;
        }

        init() {
            window.addEventListener('scroll', throttle(() => {
                if (window.pageYOffset > 300) {
                    this.button.style.opacity = '1';
                    this.button.style.visibility = 'visible';
                } else {
                    this.button.style.opacity = '0';
                    this.button.style.visibility = 'hidden';
                }
            }, 100));

            this.button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            this.button.addEventListener('mouseenter', () => {
                this.button.style.transform = 'scale(1.1)';
                this.button.style.background = 'var(--color-primary)';
            });

            this.button.addEventListener('mouseleave', () => {
                this.button.style.transform = 'scale(1)';
                this.button.style.background = 'var(--color-accent)';
            });
        }
    }

    class ActiveMenuHighlight {
        constructor() {
            this.currentPath = window.location.pathname;
            this.navLinks = document.querySelectorAll('.nav-link');
            
            if (this.navLinks.length) {
                this.init();
            }
        }

        init() {
            this.navLinks.forEach(link => {
                const href = link.getAttribute('href');
                
                if (href === this.currentPath || 
                    (this.currentPath === '/' && href === '/index.html') ||
                    (this.currentPath === '/index.html' && href === '/')) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
    }

    function initAll() {
        if (app.initialized) return;
        app.initialized = true;

        app.modules.burgerMenu = new BurgerMenu();
        app.modules.scrollSpy = new ScrollSpy();
        app.modules.smoothScroll = new SmoothScroll();
        app.modules.formValidator = new FormValidator();
        app.modules.scrollAnimations = new ScrollAnimations();
        app.modules.buttonEffects = new ButtonEffects();
        app.modules.countUp = new CountUp();
        app.modules.cardHover = new CardHoverEffects();
        app.modules.accordion = new AccordionEnhancement();
        app.modules.imageLazyLoad = new ImageLazyLoad();
        app.modules.scrollToTop = new ScrollToTop();
        app.modules.activeMenu = new ActiveMenuHighlight();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    window.__app = app;

})();