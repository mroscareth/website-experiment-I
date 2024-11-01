/**
 * GSAP Plugin Registration
 */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Theme Management
 * Handles light/dark theme switching
 */
function initThemeSwitch() {
    const checkbox = document.querySelector('#checkbox');
    checkbox.checked = true; // Default to dark theme
    
    checkbox.addEventListener('change', () => {
        document.documentElement.setAttribute('data-theme', 
            checkbox.checked ? 'dark' : 'light'
        );
    });
}

/**
 * Text Effects
 * Scramble animation for specified text elements
 */
function initScrambleText() {
    const scrambleTexts = document.querySelectorAll('.scramble-text');
    if (!scrambleTexts.length) return;

    const chars = "⌰⍜⋏☌ ⌰⟟⎐⟒ ⏁⊑⟒ ⟒⏁⊑⟒⍀⟒⏃⋏ ⟒⋔⌿⟟⍀⟒";
    let scrambleIntervals = [];
    
    function scramble(element, iteration = 0) {
        element.classList.remove('initially-hidden');
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        
        const originalText = element.getAttribute('data-original') || element.textContent;
        if (!element.getAttribute('data-original')) {
            element.setAttribute('data-original', originalText);
        }
        
        const currentText = originalText
            .split("")
            .map((char, index) => index < iteration ? char : 
                chars[Math.floor(Math.random() * chars.length)])
            .join("");
        
        element.textContent = currentText;
        
        if (iteration >= originalText.length) {
            return true;
        }
        return false;
    }

    function startScramble(element) {
        let iteration = 0;
        const interval = setInterval(() => {
            if (scramble(element, iteration)) {
                clearInterval(interval);
            }
            iteration += 1/2;
        }, 20);
        return interval;
    }

    function animateAll() {
        scrambleIntervals.forEach(interval => clearInterval(interval));
        scrambleIntervals = [];
        
        scrambleTexts.forEach(text => {
            text.classList.add('initially-hidden');
        });
        
        scrambleTexts.forEach((text, index) => {
            setTimeout(() => {
                const interval = startScramble(text);
                scrambleIntervals.push(interval);
            }, index * 400);
        });
    }

    animateAll();
    setInterval(animateAll, 8000);
}

/**
 * Navigation System
 * Handles smooth scrolling and section detection
 */
function initNavigation() {
    // Smooth scroll navigation
    document.querySelectorAll('.nav-dots a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: target,
                        autoKill: true
                    },
                    ease: "power2.inOut",
                    onComplete: () => {
                        if (target.classList.contains('horizontal-wrapper')) {
                            const st = ScrollTrigger.getAll().find(st => st.trigger === target);
                            if (st) {
                                st.scroll(st.start);
                                st.update();
                            }
                        }
                    }
                });
            }
        });
    });

    // Section detection
    document.querySelectorAll('section[id]').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => updateActiveNav(section.id),
            onEnterBack: () => updateActiveNav(section.id),
            onLeave: () => {
                const nextSection = section.nextElementSibling;
                if (nextSection && nextSection.id) {
                    updateActiveNav(nextSection.id);
                }
            },
            onLeaveBack: () => {
                const prevSection = section.previousElementSibling;
                if (prevSection && prevSection.id) {
                    updateActiveNav(prevSection.id);
                }
            }
        });
    });
}

/**
 * Navigation Helper
 * Updates active state of navigation dots
 */
function updateActiveNav(sectionId) {
    document.querySelectorAll('.nav-dots a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-dots a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Menu System
 * Handles hamburger menu toggle and silky smooth scroll
 */
function initMenuToggle() {
    const menuButton = document.querySelector('.hamburger-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuTitles = document.querySelectorAll('.menu-titles h1');
    const body = document.body;
    
    let currentScroll = 0;
    let targetScroll = 0;
    let ease = 0.075; // Factor de suavizado más natural

    // Evento wheel para scroll suave
    menuOverlay.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetScroll = Math.max(0, 
            Math.min(
                targetScroll + e.deltaY, 
                menuOverlay.scrollHeight - menuOverlay.clientHeight
            )
        );
    });

    // Animación del scroll
    function smoothScroll() {
        if (!menuOverlay.classList.contains('active')) return;

        // Interpolación suave entre posición actual y objetivo
        currentScroll += (targetScroll - currentScroll) * ease;
        
        // Aplicar transformación para mejor rendimiento
        menuOverlay.scrollTop = Math.round(currentScroll * 100) / 100;
        
        requestAnimationFrame(smoothScroll);
    }
    
    // Toggle del menú mejorado
    menuButton.addEventListener('click', () => {
        menuButton.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        
        if (menuOverlay.classList.contains('active')) {
            body.style.overflow = 'hidden';
            currentScroll = targetScroll = 0;
            menuOverlay.scrollTop = 0;
            
            // Entrada del menú
            gsap.fromTo(menuOverlay, 
                { 
                    opacity: 0,
                    backdropFilter: "blur(0px)"
                },
                { 
                    duration: 0.5, 
                    opacity: 1,
                    backdropFilter: "blur(10px)",
                    ease: "power2.inOut",
                    onComplete: () => {
                        smoothScroll();
                    }
                }
            );

            // Animación de los títulos
            gsap.fromTo(menuTitles, 
                {
                    opacity: 0,
                    y: 50,
                    rotateX: -45,
                    filter: "blur(10px)"
                },
                {
                    duration: 0.8,
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                    stagger: 0.1,
                    ease: "power4.out",
                    delay: 0.2
                }
            );

        } else {
            // Salida del menú con blur
            gsap.to(menuTitles, {
                duration: 0.1, // Reducir duración para que desaparezcan más rápido
                opacity: 0,
                filter: "blur(10px)",
                stagger: 0.05, // Reducir el stagger para que desaparezcan más rápido
                ease: "power4.in"
            });

            gsap.to(menuOverlay, {
                duration: 0.5, // Mantener duración para que el overlay desaparezca después
                opacity: 0,
                backdropFilter: "blur(0px)",
                ease: "power2.inOut",
                delay: 0.1, // Añadir un pequeño delay para que el overlay desaparezca después de los títulos
                onComplete: () => {
                    body.style.overflow = 'auto';
                }
            });
        }
    });

    // Click handler para los enlaces
    document.querySelectorAll('.menu-titles a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            gsap.to(menuOverlay, {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    menuButton.classList.remove('active');
                    menuOverlay.classList.remove('active');
                    body.style.overflow = 'auto';
                    
                    if (target) {
                        gsap.to(window, {
                            duration: 1.5,
                            scrollTo: {
                                y: target,
                                autoKill: true
                            },
                            ease: "power2.inOut"
                        });
                    }
                }
            });
        });
    });
}

/**
 * Progress Indicator
 * Updates progress bar based on scroll position
 */
function initProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    const sections = document.querySelectorAll('section');

    function updateProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const progressValue = (scrollTop / totalHeight) * 100;
        gsap.to(progressBar, { width: `${progressValue}%`, duration: 0.1 });

        // Cambiar a completado
        if (progressValue >= 99.9) {
            gsap.to(progressBar, { backgroundColor: '#00ff00', duration: 0.5, ease: "power2.inOut" });
            progressBar.classList.add('completed');
        } else {
            gsap.to(progressBar, { backgroundColor: '#00ffff', duration: 0.5, ease: "power2.inOut" });
            progressBar.classList.remove('completed');
        }
    }
    
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    window.addEventListener('load', updateProgress);
}

/**
 * Horizontal Scroll System
 * Implements horizontal scrolling sections using GSAP
 */
function initHorizontalScroll() {
    const sections = document.querySelectorAll(".horizontal-wrapper");
    
    sections.forEach(section => {
        const wrapper = section.querySelector('.horizontal-slider');
        
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                pin: true,
                scrub: 1,
                end: () => "+=" + wrapper.offsetWidth,
                invalidateOnRefresh: true
            }
        });
        
        tl.to(wrapper, {
            x: () => -(wrapper.offsetWidth - window.innerWidth),
            ease: "none"
        });
    });
}

/**
 * Custom Cursor System
 * Implements custom cursor with dot, circle and blur effects
 */
function initCursor() {
    const cursorCircle = document.createElement('div');
    cursorCircle.className = 'cursor-circle';
    document.body.appendChild(cursorCircle);
    
    document.addEventListener('mousemove', e => {
        cursorCircle.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)${cursorCircle.classList.contains('hover') ? ' scale(1.5)' : ''}`;
    });
    
    const interactiveElements = document.querySelectorAll('a, button, input, .hamburger-menu, .theme-switch');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorCircle.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorCircle.classList.remove('hover'));
    });
}

/**
 * Initialization
 * Starts all site functionality
 */
function init() {
    const preloader = document.querySelector('.preloader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            setTimeout(() => {
                preloader.style.display = 'none';
                
                // Iniciar funcionalidades base
                initHorizontalScroll();
                ScrollTrigger.refresh();
                
                // Delay reducido a 0.5 segundos para todas las animaciones de UI
                setTimeout(() => {
                    // Progress Wrapper
                    const progressWrapper = document.querySelector('.progress-wrapper');
                    progressWrapper.style.opacity = '1';
                    progressWrapper.classList.add('animate-in');
                    initProgressBar();

                    // Logo
                    animateLogo();

                    // Theme Switch
                    const themeSwitch = document.querySelector('.theme-switch-wrapper');
                    themeSwitch.style.opacity = '1';
                    themeSwitch.classList.add('animate-in');
                    initThemeSwitch();

                    // Hamburger Menu
                    const hamburgerMenu = document.querySelector('.hamburger-menu');
                    hamburgerMenu.style.opacity = '1';
                    hamburgerMenu.classList.add('animate-in');
                    initMenuToggle();

                    // Nav Dots
                    const navDots = document.querySelector('.nav-dots');
                    navDots.style.opacity = '1';
                    navDots.classList.add('animate-in');
                    initNavigation();

                    // Scramble Text
                    initScrambleText();

                    // Cursor
                    initCursor();
                    
                }, 500); // Reducido a 0.5 segundos
                
            }, 500); // Tiempo del fade-out del preloader
        }, 2000); // Tiempo inicial del preloader
    });
}

// Remover el event listener anterior
window.removeEventListener('load', init);

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

let logoAnimationComplete = false;

function animateLogo() {
    // Resetear el estado del logo
    const logoPaths = document.querySelectorAll('.site-logo .cls-1');
    logoAnimationComplete = false;
    
    // Resetear los valores iniciales
    logoPaths.forEach(path => {
        path.style.strokeDashoffset = '1000';
        path.style.fill = 'transparent';
    });

    // Crear nueva animación
    const tl = gsap.timeline({
        onComplete: () => {
            logoAnimationComplete = true;
        }
    });

    // Animación del trazo
    tl.to(logoPaths, {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.inOut"
    })
    // Animación del relleno
    .to(logoPaths, {
        fill: "#ffffff",
        duration: 1,
        ease: "power2.inOut"
    }, "+=0.2");
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    const logoPaths = document.querySelectorAll('.site-logo .cls-1');

    function updateProgress() {
        if (!logoAnimationComplete) return;

        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const progressValue = (scrollTop / totalHeight) * 100;

        gsap.to(progressBar, { width: `${progressValue}%`, duration: 0.1 });

        if (progressValue >= 99.9) {
            progressBar.classList.add('completed');
        } else {
            progressBar.classList.remove('completed');
        }
    }

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    // No necesitamos el setTimeout aquí ya que el timing se maneja en init()
    updateProgress();
}

window.addEventListener('load', () => {
    animateLogo();
    updateProgressBar();
});

// Ejecutar la animación cuando la página se vuelve visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        animateLogo();
    }
});

