// ===== UTILIDADES =====
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ===== TEXTO ESCRITO =====
const textoAnimadoSpan = document.querySelector('.texto-animado');
const textoCompleto = textoAnimadoSpan ? textoAnimadoSpan.textContent : '';
if (textoAnimadoSpan) {
    textoAnimadoSpan.textContent = '';
}

let index = 0;

function typeWriter() {
    if (!textoAnimadoSpan) return;

    if (index < textoCompleto.length) {
        textoAnimadoSpan.textContent += textoCompleto.charAt(index);
        index += 1;
        setTimeout(typeWriter, 55);
    } else {
        textoAnimadoSpan.classList.add('mostrando-cursor');
    }
}

// ===== ANIMACIONES AL SCROLL =====
function setupScrollAnimations() {
    const elementos = document.querySelectorAll('.animacion-desplazamiento');

    if (!('IntersectionObserver' in window)) {
        elementos.forEach((el) => el.classList.add('visible'));
        return;
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
    });

    elementos.forEach((el) => observador.observe(el));
}

// ===== PARALLAX SUAVE =====
function setupParallax() {
    const hero = document.querySelector('.seccion-hero');
    const burbujas = hero ? hero.querySelectorAll('.hero-decoraciones .burbuja') : [];
    if (!hero || !burbujas.length) return;

    const handleMouseMove = throttle((e) => {
        const rect = hero.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        burbujas.forEach((b, i) => {
            const intensity = (i + 1) * 10;
            b.style.transform = `translate(${relX * intensity}px, ${relY * intensity}px)`;
        });
    }, 16);

    hero.addEventListener('pointermove', handleMouseMove, { passive: true });
}

// ===== NAV ACTIVA =====
const barraNavegacion = document.querySelector('.barra-navegacion');
const contenedorEnlaces = document.querySelector('.enlaces-navegacion');
const indicador = contenedorEnlaces
    ? contenedorEnlaces.querySelector('.indicador-activo')
    : null;

function actualizarIndicadorActivo(link) {
    if (!indicador || !link || !contenedorEnlaces) return;
    if (window.matchMedia('(max-width: 960px)').matches) return;

    const rectLink = link.getBoundingClientRect();
    const rectContainer = contenedorEnlaces.getBoundingClientRect();
    const width = Math.max(20, rectLink.width * 0.55);
    const left = rectLink.left - rectContainer.left + (rectLink.width - width) / 2;

    indicador.style.width = `${width}px`;
    indicador.style.transform = `translateX(${left}px)`;
}

function updateActiveMenu() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.enlace-navegacion');
    const scrollPosition = window.scrollY + 120;
    let currentSection = '';

    sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = section.id;
        }
    });

    if (!currentSection && links.length) {
        currentSection = (links[0].getAttribute('href') || '').replace('#', '');
    }

    links.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        link.classList.toggle('activo', isActive);
        if (isActive) actualizarIndicadorActivo(link);
    });
}

let ticking = false;
let lastScrollY = 0;

function handleScroll() {
    if (ticking) return;

    requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (scrollY > 40) {
            barraNavegacion?.classList.add('scroll-fijo');
        } else {
            barraNavegacion?.classList.remove('scroll-fijo');
        }

        const docAltura = document.documentElement.scrollHeight - window.innerHeight;
        const progreso = Math.max(0, Math.min(1, scrollY / (docAltura || 1)));
        barraNavegacion?.style.setProperty('--scroll-progress', progreso);

        if (Math.abs(scrollY - lastScrollY) > 40) {
            updateActiveMenu();
            lastScrollY = scrollY;
        }

        ticking = false;
    });

    ticking = true;
}

function setupSmoothScroll() {
    document.querySelectorAll('.enlace-navegacion, .logo-navegacion').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const target = document.getElementById(href.slice(1));
            if (!target || !barraNavegacion) return;

            e.preventDefault();
            const offsetTop = target.offsetTop - barraNavegacion.offsetHeight + 1;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });

            contenedorEnlaces?.classList.remove('menu-movil-abierto');
            const toggle = document.querySelector('.alternador-menu-movil');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');

            actualizarIndicadorActivo(link);
        });
    });
}

function setupMobileMenu() {
    const toggle = document.querySelector('.alternador-menu-movil');
    if (!toggle || !contenedorEnlaces) return;

    toggle.addEventListener('click', () => {
        const abierto = contenedorEnlaces.classList.toggle('menu-movil-abierto');
        toggle.setAttribute('aria-expanded', String(abierto));
    });

    document.addEventListener('click', (e) => {
        if (!contenedorEnlaces.classList.contains('menu-movil-abierto')) return;
        if (contenedorEnlaces.contains(e.target) || toggle.contains(e.target)) return;
        contenedorEnlaces.classList.remove('menu-movil-abierto');
        toggle.setAttribute('aria-expanded', 'false');
    });
}

function animateSkills() {
    // Las barras de progreso ya no se usan; se mantiene por compatibilidad.
}

document.addEventListener('DOMContentLoaded', () => {
    const anio = document.getElementById('anio-actual');
    if (anio) anio.textContent = String(new Date().getFullYear());

    setupScrollAnimations();
    setupParallax();
    setupMobileMenu();
    setupSmoothScroll();
    animateSkills();

    const activeLink = document.querySelector('.enlace-navegacion');
    if (activeLink) actualizarIndicadorActivo(activeLink);
    updateActiveMenu();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', debounce(() => {
        const activo = document.querySelector('.enlace-navegacion.activo') || document.querySelector('.enlace-navegacion');
        if (activo) actualizarIndicadorActivo(activo);
    }, 200));
});

window.addEventListener('load', () => {
    if (textoAnimadoSpan) typeWriter();
});
