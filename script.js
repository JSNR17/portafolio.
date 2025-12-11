// ===== OPTIMIZACIÓN DE PERFORMANCE Y SCROLL =====

// Variables globales
let ticking = false;
let lastScrollY = 0;

// Fix para prevenir doble scroll
document.documentElement.style.overflow = 'hidden';
document.body.style.overflowY = 'auto';
document.body.style.overflowX = 'hidden';

// Throttle function para optimizar eventos
function throttle(func, wait) {
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

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ===== ANIMACIÓN DE TEXTO =====
const textoAnimadoSpan = document.querySelector('.texto-animado');
const textoCompleto = textoAnimadoSpan ? textoAnimadoSpan.textContent : '';
if (textoAnimadoSpan) {
    textoAnimadoSpan.textContent = '';
}

let index = 0;

function typeWriter() {
    const velocidadEscritura = 70;
    if (!textoAnimadoSpan) return;

    if (index < textoCompleto.length) {
        textoAnimadoSpan.textContent += textoCompleto.charAt(index);
        index++;
        setTimeout(typeWriter, velocidadEscritura);
    } else {
        textoAnimadoSpan.classList.add('mostrando-cursor');
    }
}

// ===== INTERSECTION OBSERVER OPTIMIZADO =====
function setupScrollAnimations() {
    const elementosAnimables = document.querySelectorAll('.animacion-desplazamiento, .desenfoque-entrada, .revelacion-desplazamiento');

    // Configuración optimizada del observer
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                // Usar requestAnimationFrame para animaciones suaves
                requestAnimationFrame(() => {
                    entrada.target.classList.add('visible');
                });
                // Dejar de observar el elemento una vez animado
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px'
    });

    elementosAnimables.forEach((el) => observador.observe(el));
}

// ===== PARALLAX OPTIMIZADO =====
function setupParallax() {
    const hero = document.querySelector('.seccion-hero');
    const burbujas = hero ? hero.querySelectorAll('.hero-decoraciones .burbuja') : [];
    
    if (hero && burbujas.length) {
        // Usar throttle para limitar las llamadas
        const handleMouseMove = throttle((e) => {
            requestAnimationFrame(() => {
                const rect = hero.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width - 0.5;
                const relY = (e.clientY - rect.top) / rect.height - 0.5;
                
                burbujas.forEach((b, i) => {
                    const intensity = (i + 1) * 8;
                    b.style.transform = `translate(${relX * intensity}px, ${relY * intensity}px)`;
                });
            });
        }, 16); // ~60fps

        hero.addEventListener('pointermove', handleMouseMove, { passive: true });
    }
}

// ===== NAVBAR Y MENÚ ACTIVO OPTIMIZADO =====
const barraNavegacion = document.querySelector('.barra-navegacion');
const contenedorEnlaces = document.querySelector('.enlaces-navegacion');
const indicador = contenedorEnlaces ? contenedorEnlaces.querySelector('.indicador-activo') : null;

function actualizarIndicadorActivo(link) {
    if (!indicador || !link || !contenedorEnlaces) return;
    
    requestAnimationFrame(() => {
        const rectLink = link.getBoundingClientRect();
        const rectContainer = contenedorEnlaces.getBoundingClientRect();
        const width = Math.max(24, rectLink.width * 0.6);
        const left = rectLink.left - rectContainer.left + (rectLink.width - width) / 2;
        
        indicador.style.width = `${width}px`;
        indicador.style.transform = `translateX(${left}px)`;
    });
}

window.actualizarIndicadorActivo = actualizarIndicadorActivo;

function updateActiveMenu() {
    const sections = document.querySelectorAll('section');
    const enlacesNavegacionLinks = document.querySelectorAll('.enlace-navegacion');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    if (!currentSection && enlacesNavegacionLinks.length) {
        const firstHref = enlacesNavegacionLinks[0].getAttribute('href');
        currentSection = firstHref ? firstHref.replace('#', '') : '';
    }

    enlacesNavegacionLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        if (isActive && !link.classList.contains('activo')) {
            link.classList.add('activo');
            actualizarIndicadorActivo(link);
        } else if (!isActive) {
            link.classList.remove('activo');
        }
    });
}

// ===== SCROLL HANDLER OPTIMIZADO =====
function handleScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            
            // Actualizar clase scroll-fijo
            if (scrollY > 50) {
                barraNavegacion?.classList.add('scroll-fijo');
            } else {
                barraNavegacion?.classList.remove('scroll-fijo');
            }

            // Progreso de scroll
            const docAltura = document.documentElement.scrollHeight - window.innerHeight;
            const progreso = Math.max(0, Math.min(1, scrollY / (docAltura || 1)));
            barraNavegacion?.style.setProperty('--scroll-progress', progreso);
            barraNavegacion?.classList.add('scroll-progreso');

            // Actualizar menú activo (solo si cambió significativamente)
            if (Math.abs(scrollY - lastScrollY) > 50) {
                updateActiveMenu();
                lastScrollY = scrollY;
            }

            ticking = false;
        });
        ticking = true;
    }
}

// ===== NAVEGACIÓN SUAVE =====
function setupSmoothScroll() {
    document.querySelectorAll('.enlace-navegacion').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && barraNavegacion) {
                const offsetTop = targetElement.offsetTop - barraNavegacion.offsetHeight;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
           
            const enlacesNavegacion = document.querySelector('.enlaces-navegacion');
            if (enlacesNavegacion?.classList.contains('menu-movil-abierto')) {
                enlacesNavegacion.classList.remove('menu-movil-abierto');
            }
            
            actualizarIndicadorActivo(this);
        });
    });
}

// ===== TEMA =====
function setupTheme() {
    const alternarTema = document.getElementById('alternar-tema');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark-theme', savedTheme === 'dark');
    }

    function updateThemeIcons() {
        if (!alternarTema) return;
        const isDark = body.classList.contains('dark-theme');
        const sunIcon = alternarTema.querySelector('.fa-sun');
        const moonIcon = alternarTema.querySelector('.fa-moon');
        
        if (isDark) {
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
        }
    }

    updateThemeIcons();

    if (alternarTema) {
        alternarTema.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
            alternarTema.classList.remove('theme-pulse');
            void alternarTema.offsetWidth;
            alternarTema.classList.add('theme-pulse');
        });
    }

    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            body.classList.toggle('dark-theme', e.matches);
            updateThemeIcons();
        }
    });
}

// ===== MENÚ MÓVIL =====
function setupMobileMenu() {
    const alternadorMenuMovil = document.querySelector('.alternador-menu-movil');
    const enlacesNavegacion = document.querySelector('.enlaces-navegacion');

    if (alternadorMenuMovil && enlacesNavegacion) {
        alternadorMenuMovil.addEventListener('click', () => {
            enlacesNavegacion.classList.toggle('menu-movil-abierto');
        });
    }
}

// ===== ANIMACIÓN DE HABILIDADES =====
function animateSkills() {
    const barrasProgreso = document.querySelectorAll('.barra-progreso-habilidad');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0';
                
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
                
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    barrasProgreso.forEach(bar => observer.observe(bar));
}

// ===== CARRUSEL DE PROYECTOS =====
function setupCarousel() {
    const carruselTrack = document.querySelector('.carrusel-track');
    const flechaIzquierda = document.querySelector('.flecha-izquierda');
    const flechaDerecha = document.querySelector('.flecha-derecha');
    const contenedorIndicadores = document.querySelector('.indicadores-carrusel');
    const tarjetas = Array.from(document.querySelectorAll('.carrusel-track .tarjeta-proyecto'));
    
    let slideActual = 0;
    const totalSlides = tarjetas.length;
    let isTransitioning = false;
    
    function actualizarIndicadores() {
        if (!contenedorIndicadores) return;
        contenedorIndicadores.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const indicador = document.createElement('button');
            indicador.className = 'indicador' + (i === slideActual ? ' activo' : '');
            indicador.setAttribute('data-slide', i);
            indicador.addEventListener('click', () => irASlide(i));
            contenedorIndicadores.appendChild(indicador);
        }
    }

    function actualizarCarrusel() {
        if (isTransitioning || !carruselTrack) return;
        isTransitioning = true;
        
        requestAnimationFrame(() => {
            const porcentaje = slideActual * 100;
            carruselTrack.style.transform = `translateX(-${porcentaje}%)`;
            
            Array.from(contenedorIndicadores?.children || []).forEach((ind, idx) => {
                ind.classList.toggle('activo', idx === slideActual);
            });
            
            // Ajustar altura del contenedor
            const tarjetaActual = tarjetas[slideActual];
            const contenedor = document.querySelector('.contenedor-carrusel');
            if (tarjetaActual && contenedor) {
                setTimeout(() => {
                    const nuevaAltura = tarjetaActual.offsetHeight;
                    contenedor.style.height = `${Math.ceil(nuevaAltura)}px`;
                }, 310);
            }
            
            setTimeout(() => {
                isTransitioning = false;
            }, 600);
        });
    }

    function moverCarrusel(direccion) {
        if (isTransitioning) return;
        
        if (direccion === 'izquierda') {
            slideActual = (slideActual - 1 + totalSlides) % totalSlides;
        } else {
            slideActual = (slideActual + 1) % totalSlides;
        }
        actualizarCarrusel();
    }

    function irASlide(slide) {
        if (isTransitioning || slide === slideActual) return;
        slideActual = slide;
        actualizarCarrusel();
    }

    // Event listeners
    flechaIzquierda?.addEventListener('click', () => moverCarrusel('izquierda'));
    flechaDerecha?.addEventListener('click', () => moverCarrusel('derecha'));

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moverCarrusel('izquierda');
        else if (e.key === 'ArrowRight') moverCarrusel('derecha');
    });

    // Swipe para móviles
    let startX = 0;
    let endX = 0;

    carruselTrack?.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    carruselTrack?.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            moverCarrusel(diff > 0 ? 'derecha' : 'izquierda');
        }
    });

    // Resize optimizado
    const handleResize = debounce(() => {
        const tarjetaActual = tarjetas[slideActual];
        const contenedor = document.querySelector('.contenedor-carrusel');
        if (tarjetaActual && contenedor) {
            contenedor.style.height = `${Math.ceil(tarjetaActual.offsetHeight)}px`;
        }
    }, 250);

    window.addEventListener('resize', handleResize);

    // Inicializar
    actualizarIndicadores();
    actualizarCarrusel();
}

// ===== GALERÍA COVERFLOW =====
function setupGallery() {
    const galeriaItems = Array.from(document.querySelectorAll('.galeria-item'));
    const flechaIzq = document.querySelector('.galeria-flecha-izq');
    const flechaDer = document.querySelector('.galeria-flecha-der');
    const galeriaTitulo = document.querySelector('.galeria-titulo');
    let actual = 0;

    function renderGaleria() {
        requestAnimationFrame(() => {
            galeriaItems.forEach((item, idx) => {
                item.classList.remove('centro', 'izq', 'der', 'fuera');
                if (idx === actual) {
                    item.classList.add('centro');
                } else if (idx === actual - 1) {
                    item.classList.add('izq');
                } else if (idx === actual + 1) {
                    item.classList.add('der');
                } else {
                    item.classList.add('fuera');
                }
            });
            
            if (galeriaTitulo) {
                galeriaTitulo.textContent = galeriaItems[actual]?.dataset.titulo || '';
            }
        });
    }

    function moverGaleria(dir) {
        if (dir === 'izq') {
            actual = (actual - 1 + galeriaItems.length) % galeriaItems.length;
        } else if (dir === 'der') {
            actual = (actual + 1) % galeriaItems.length;
        }
        renderGaleria();
    }

    flechaIzq?.addEventListener('click', () => moverGaleria('izq'));
    flechaDer?.addEventListener('click', () => moverGaleria('der'));

    galeriaItems.forEach((item, idx) => {
        item.addEventListener('click', function() {
            if (idx !== actual) {
                actual = idx;
                renderGaleria();
            }
        });
    });

    renderGaleria();
}

// ===== MANEJO DE ERRORES DE MEDIOS =====
document.addEventListener('error', function(e) {
    const el = e.target;
    if (el.tagName === 'IMG') {
        el.src = 'logo.svg';
        el.style.objectFit = 'contain';
    }
}, true);

// ===== INICIALIZACIÓN =====
window.addEventListener('load', () => {
    if (textoAnimadoSpan) typeWriter();
    animateSkills();
});

document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
    setupParallax();
    setupTheme();
    setupMobileMenu();
    setupSmoothScroll();
    setupCarousel();
    setupGallery();
    
    // Actualizar indicador activo inicial
    const activeLink = document.querySelector('.enlace-navegacion.activo') || 
                      document.querySelector('.enlace-navegacion');
    if (activeLink) actualizarIndicadorActivo(activeLink);
    
    // Event listener optimizado para scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Event listeners optimizados para resize
    window.addEventListener('resize', debounce(() => {
        const activo = document.querySelector('.enlace-navegacion.activo');
        if (activo) actualizarIndicadorActivo(activo);
    }, 250));
});

// Verificar carga de imágenes
window.addEventListener('load', () => {
    const imgs = Array.from(document.images);
    const missing = imgs.filter(img => !img.complete || img.naturalWidth === 0);
    if (missing.length) {
        console.warn('Imágenes con problemas de carga:', missing.map(i => i.src));
    }
});