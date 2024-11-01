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
    const scrambleText = document.querySelector('.scramble-text');
    if (!scrambleText) return;

    const originalText = scrambleText.textContent;
    const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let scrambleInterval;
    
    function scramble(iteration = 0) {
        const currentText = originalText
            .split("")
            .map((char, index) => index < iteration ? char : 
                chars[Math.floor(Math.random() * chars.length)])
            .join("");
        
        scrambleText.textContent = currentText;
        
        if (iteration >= originalText.length) {
            clearInterval(scrambleInterval);
            scrambleText.textContent = originalText;
            return true;
        }
        return false;
    }

    function startScramble() {
        let iteration = 0;
        scrambleInterval = setInterval(() => {
            if (scramble(iteration)) {
                clearInterval(scrambleInterval);
            }
            iteration += 1/3;
        }, 30);
    }

    startScramble();
    setInterval(startScramble, 5000);
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
            // Salida del menú
            gsap.to(menuTitles, {
                duration: 0.4,
                opacity: 0,
                y: -50,
                rotateX: 45,
                filter: "blur(5px)",
                stagger: 0.05,
                ease: "power2.in"
            });

            gsap.to(menuOverlay, {
                duration: 0.5,
                opacity: 0,
                backdropFilter: "blur(0px)",
                ease: "power2.inOut",
                delay: 0.2,
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
    const progressFlags = document.querySelector('.progress-flags');
    
    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculamos el progreso considerando la altura de la ventana
        const scrollable = documentHeight - windowHeight;
        const progress = (scrollTop / scrollable) * 100;
        
        // Actualizamos la barra de progreso
        const progressValue = Math.min(100, Math.max(0, progress));
        progressBar.style.width = `${progressValue}%`;
        
        // Verificamos si se completó el progreso
        if (progressValue >= 99.9) {
            progressBar.classList.add('completed');
        } else {
            progressBar.classList.remove('completed');
        }
    }
    
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress();
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
    const cursorDot = document.createElement('div');
    const cursorCircle = document.createElement('div');
    const blurElement = document.createElement('div');
    
    cursorDot.className = 'cursor-dot';
    cursorCircle.className = 'cursor-circle';
    blurElement.className = 'cursor-blur';
    
    document.body.appendChild(blurElement);
    document.body.appendChild(cursorCircle);
    document.body.appendChild(cursorDot);
    
    let cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let dotPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let circlePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    document.addEventListener('mousemove', e => {
        cursorPos.x = e.clientX;
        cursorPos.y = e.clientY;
    });
    
    function animateCursor() {
        dotPos.x += (cursorPos.x - dotPos.x) * 0.2;
        dotPos.y += (cursorPos.y - dotPos.y) * 0.2;
        
        circlePos.x += (cursorPos.x - circlePos.x) * 0.1;
        circlePos.y += (cursorPos.y - circlePos.y) * 0.1;
        
        cursorDot.style.transform = `translate(${dotPos.x - 4}px, ${dotPos.y - 4}px)`;
        cursorCircle.style.transform = `translate(${circlePos.x - 20}px, ${circlePos.y - 20}px)`;
        blurElement.style.transform = `translate(${circlePos.x - 20}px, ${circlePos.y - 20}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Interactive elements handling
    const interactiveElements = document.querySelectorAll('a, button, input, .hamburger-menu, .theme-switch');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorCircle.classList.add('hover');
            blurElement.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursorCircle.classList.remove('hover');
            blurElement.classList.remove('hover');
        });
    });
}

/**
 * Initialization
 * Starts all site functionality
 */
function init() {
    initHorizontalScroll();
    ScrollTrigger.refresh();
    initThemeSwitch();
    initScrambleText();
    initNavigation();
    initMenuToggle();
    initProgressBar();
    initCursor();
}

// Initialize on load
window.addEventListener('load', init);

