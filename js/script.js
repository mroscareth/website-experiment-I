/**
 * GSAP Plugin Registration
 */
gsap.registerPlugin(ScrollToPlugin);

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
    const scrambleTexts = document.querySelectorAll('#section1 .scramble-text, .preloader .scramble-text');
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
    const navLinks = document.querySelectorAll('.nav-dots a');
    const mainSections = ['section1', 'section2', 'section3', 'section4', 'section5'];
    const controller = new ScrollMagic.Controller();

    if (!navLinks.length) {
        console.warn('Navigation dots not found');
        return;
    }

    // Configurar la navegación
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Si es el primer dot, ir al inicio absoluto
            if (index === 0) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                updateActiveNav(targetId);
                return;
            }

            // Para los demás dots, mantener el comportamiento actual
            const target = document.getElementById(targetId);
            if (target) {
                const targetBounds = target.getBoundingClientRect();
                const targetPosition = window.pageYOffset + targetBounds.top;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Crear escenas para detectar cada sección principal
    mainSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            new ScrollMagic.Scene({
                triggerElement: section,
                triggerHook: 0.5,
                duration: window.innerHeight
            })
            .on('enter', () => {
                updateActiveNav(sectionId);
            })
            .addTo(controller);
        }
    });

    // Función para actualizar el estado activo de los dots
    function updateActiveNav(sectionId) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Actualizar en resize
    window.addEventListener('resize', () => {
        controller.update(true);
    });

    // Actualización inicial
    setTimeout(() => {
        const scrollPosition = window.pageYOffset;
        const sectionIndex = Math.floor(scrollPosition / window.innerHeight);
        const currentSectionId = mainSections[sectionIndex] || mainSections[0];
        updateActiveNav(currentSectionId);
    }, 100);
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
                stagger: 0.05, // Reducir el stagger para que desaparezcan más rpido
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
 * Implements horizontal scrolling sections using ScrollMagic
 */
function initHorizontalScroll() {
    const controller = new ScrollMagic.Controller();
    const sections = document.querySelectorAll(".horizontal-wrapper");
    
    sections.forEach(section => {
        const wrapper = section.querySelector('.horizontal-slider');
        const panels = wrapper.querySelectorAll('.panel');
        
        // Asegurar posición inicial correcta
        gsap.set(wrapper, { x: 0 });
        
        // Establecer el ancho total del slider
        const totalWidth = panels.length * 100;
        wrapper.style.width = `${totalWidth}vw`;

        // Crear la animación GSAP
        const timeline = gsap.timeline();
        timeline.fromTo(wrapper, 
            { x: 0 }, // Estado inicial explícito
            {
                x: () => -(wrapper.offsetWidth - window.innerWidth),
                ease: "none",
                duration: 1
            }
        );

        // Crear la escena de ScrollMagic
        const scene = new ScrollMagic.Scene({
            triggerElement: section,
            triggerHook: 0,
            duration: `${(panels.length - 1) * 100}%`,
        })
        .setPin(section)
        .setTween(timeline)
        .addTo(controller);

        // Actualizar en resize
        window.addEventListener('resize', () => {
            scene.duration(`${(panels.length - 1) * 100}%`);
            timeline.clear();
            timeline.fromTo(wrapper,
                { x: 0 },
                {
                    x: () => -(wrapper.offsetWidth - window.innerWidth),
                    ease: "none",
                    duration: 1
                }
            );
            scene.refresh();
        });

        // Forzar actualización después de que todo esté listo
        setTimeout(() => {
            scene.refresh();
            controller.update(true);
        }, 100);
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
    
    // Variables para animación suave
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    
    // Usar requestAnimationFrame para movimiento más suave
    function updateCursor() {
        // Interpolación suave
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        
        // Usar transform en lugar de left/top para mejor rendimiento
        cursorCircle.style.transform = `translate(${currentX - 20}px, ${currentY - 20}px)${
            cursorCircle.classList.contains('hover') ? ' scale(1.5)' : ''
        }`;
        
        requestAnimationFrame(updateCursor);
    }
    
    // Actualizar solo las coordenadas objetivo
    document.addEventListener('mousemove', e => {
        targetX = e.clientX;
        targetY = e.clientY;
    }, { passive: true });
    
    // Iniciar loop de animación
    updateCursor();
    
    // Optimizar los event listeners de hover
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
    // Limpiar listeners anteriores
    cleanup();
    
    const preloader = document.querySelector('.preloader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            setTimeout(() => {
                preloader.style.display = 'none';
                
                // Iniciar funcionalidades base
                initHorizontalScroll();
                
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
    const progressContainer = document.querySelector('.progress-container');
    
    // Validación temprana
    if (!progressBar || !progressContainer) {
        console.warn('Progress bar elements not found');
        return;
    }
    
    const progressHelper = document.createElement('div');
    progressHelper.className = 'progress-helper';
    progressContainer.appendChild(progressHelper);
    
    let isDragging = false;
    let startX;
    let scrollStart;

    function updateProgress() {
        // Solo actualizar si tenemos logoAnimationComplete y los elementos existen
        if (!logoAnimationComplete || !progressBar || !progressHelper) return;

        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const progressValue = (scrollTop / totalHeight) * 100;

        requestAnimationFrame(() => {
            gsap.to(progressBar, { width: `${progressValue}%`, duration: 0.1 });
            gsap.to(progressHelper, {
                left: `${progressValue}%`,
                duration: 0.1
            });
        });
    }

    function startDragging(e) {
        e.preventDefault();
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        scrollStart = window.pageYOffset;
        progressContainer.classList.add('dragging');
        progressHelper.classList.add('dragging');
    }

    function stopDragging() {
        isDragging = false;
        progressContainer.classList.remove('dragging');
        progressHelper.classList.remove('dragging');
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();
        const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const containerRect = progressContainer.getBoundingClientRect();
        const relativeX = x - containerRect.left;
        const percentage = (relativeX / containerRect.width) * 100;
        
        // Limitar el porcentaje entre 0 y 100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        // Actualizar posición del helper y barra de progreso inmediatamente
        progressHelper.style.left = `${clampedPercentage}%`;
        progressBar.style.width = `${clampedPercentage}%`;

        // Calcular y aplicar el scroll inmediatamente
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = (clampedPercentage / 100) * totalHeight;
        
        // Scroll inmediato sin animación
        window.scrollTo(0, targetScroll);

        // Aplicar efectos visuales con GSAP para suavidad
        requestAnimationFrame(() => {
            gsap.to(progressHelper, {
                left: `${clampedPercentage}%`,
                duration: 0.1,
                overwrite: true
            });
            
            gsap.to(progressBar, {
                width: `${clampedPercentage}%`,
                duration: 0.1,
                overwrite: true
            });
        });
    }

    // Optimizar el evento de drag usando requestAnimationFrame
    let rafId = null;
    function optimizedDrag(e) {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => drag(e));
    }

    // Usar el drag optimizado en los event listeners
    progressHelper.addEventListener('mousedown', startDragging);
    progressHelper.addEventListener('touchstart', startDragging, { passive: false });
    
    window.addEventListener('mousemove', optimizedDrag);
    window.addEventListener('touchmove', optimizedDrag, { passive: false });
    
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    window.addEventListener('mouseleave', stopDragging);

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
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

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 2000);
    });
});

// Al inicio del archivo
(function() {
    function initPreloaderScramble() {
        const preloaderText = document.querySelector('.preloader .scramble-text');
        if (!preloaderText) return;

        const chars = "⌰⍜⋏☌ ⌰⟟⎐⟒ ⏁⊑⟒ ⟒⏁⊑⟒⍀⏃⋏ ⟒⋔⌿⟟⍀⟒";
        
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

        let iteration = 0;
        const interval = setInterval(() => {
            if (scramble(preloaderText, iteration)) {
                clearInterval(interval);
            }
            iteration += 1/2;
        }, 20);
    }

    // Observar cuando el preloader se añade al DOM
    const observer = new MutationObserver((mutations, obs) => {
        const preloader = document.querySelector('.preloader .scramble-text');
        if (preloader) {
            initPreloaderScramble();
            obs.disconnect(); // Dejar de observar una vez que se encuentra
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();

// Al inicio del archivo, después de las variables globales
const cleanupFunctions = new Set();

// Función helper para agregar event listeners con limpieza automática
function addCleanableEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    cleanupFunctions.add(() => {
        element.removeEventListener(event, handler, options);
    });
}

// Función para limpiar todos los event listeners
function cleanup() {
    cleanupFunctions.forEach(cleanup => cleanup());
    cleanupFunctions.clear();
}

