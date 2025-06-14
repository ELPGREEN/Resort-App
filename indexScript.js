// indexScript.js
document.addEventListener('DOMContentLoaded', () => {
    // Menu Lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    
    // Função para fechar o menu
    const closeMenu = () => {
        sideMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    
    // Toggle do menu
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', sideMenu.classList.contains('active'));
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (event) => {
        if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMenu();
        }
    });
    
    // Submenu
    const hasSubmenu = document.querySelector('.has-submenu');
    hasSubmenu.addEventListener('click', () => {
        const submenu = hasSubmenu.querySelector('.submenu');
        submenu.classList.toggle('active');
        hasSubmenu.classList.toggle('active');
    });
    
    // Slide Interativo
    const slideWrapper = document.querySelector('.slide-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.slide-prev');
    const nextButton = document.querySelector('.slide-next');
    let currentSlide = 0;
    
    const updateSlide = () => {
        slideWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    };
    
    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlide();
    };
    
    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlide();
    });
    
    nextButton.addEventListener('click', nextSlide);
    
    // Troca automática de slides
    setInterval(nextSlide, 5000);
    
    // Seções Expansíveis
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const header = section.querySelector('h2');
        const content = section.querySelector('.section-content');
        header.addEventListener('click', () => {
            const isActive = content.classList.contains('active');
            sections.forEach(s => s.querySelector('.section-content').classList.remove('active'));
            if (!isActive) content.classList.add('active');
        });
    });
});