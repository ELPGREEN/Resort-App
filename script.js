// script.js - Gerencia menu lateral, carrossel, seções expansíveis, formulários, busca, favoritos e mapa
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js: Inicializado');

    // === Utilitários ===
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // === Gerenciador de Menu Lateral ===
    class SideMenu {
        constructor() {
            this.toggle = document.querySelector('.menu-toggle');
            this.menu = document.querySelector('.side-menu');
            this.submenus = document.querySelectorAll('.has-submenu');

            if (!this.toggle || !this.menu) {
                console.error('script.js: .menu-toggle ou .side-menu não encontrados.');
                return;
            }

            console.log('script.js: SideMenu inicializado com sucesso.');
            this.init();
        }

        init() {
            this.toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            document.addEventListener('click', (e) => {
                if (!this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.menu.classList.contains('active')) {
                    this.closeMenu();
                }
            });

            this.submenus.forEach((submenu, index) => {
                submenu.addEventListener('click', debounce((e) => {
                    e.stopPropagation();
                    const menu = submenu.querySelector('.submenu');
                    if (!menu) {
                        console.warn(`script.js: Submenu ${index} não encontrado.`);
                        return;
                    }
                    const isActive = menu.classList.toggle('active');
                    submenu.classList.toggle('active');
                    console.log(`script.js: Submenu ${index + 1} ${isActive ? 'aberto' : 'fechado'}`);
                    e.preventDefault();
                }, 100));
            });

            this.touchStartX = 0;
            this.menu.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                console.log('script.js: Swipe iniciado.');
            });

            this.menu.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                const diffX = this.touchStartX - touchEndX;
                console.log(`script.js: Swipe finalizado, diffX: ${diffX}`);
                if (diffX > 50) this.closeMenu();
                else if (diffX < -50 && !this.menu.classList.contains('active')) {
                    this.openMenu();
                }
            });

            this.menu.addEventListener('touchmove', (e) => {
                if (this.menu.classList.contains('active')) {
                    e.preventDefault();
                }
            });
        }

        toggleMenu() {
            const isActive = this.menu.classList.toggle('active');
            this.toggle.setAttribute('aria-expanded', isActive);
            console.log(`script.js: Menu lateral ${isActive ? 'aberto' : 'fechado'}`);
        }

        openMenu() {
            this.menu.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
        }

        closeMenu() {
            this.menu.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.toggle.focus();
        }
    }

    // === Gerenciador de Carrossel ===
    class Carousel {
        constructor() {
            this.container = document.querySelector('.slide-container');
            this.wrapper = document.querySelector('.slide-wrapper');
            this.slides = document.querySelectorAll('.slide');
            this.prevButton = document.querySelector('.slide-prev');
            this.nextButton = document.querySelector('.slide-next');
            this.currentSlide = 0;
            this.isDragging = false;
            this.startX = 0;
            this.autoplayInterval = 4000;
            this.autoplay = null;
            this.isPaused = false;

            if (!this.container || !this.wrapper || this.slides.length === 0 || !this.prevButton || !this.nextButton) {
                console.warn('script.js: Elementos do carrossel não encontrados');
                return;
            }

            this.init();
        }

        init() {
            this.createDots();
            this.lazyLoadImages();
            this.prevButton.addEventListener('click', () => this.prevSlide());
            this.nextButton.addEventListener('click', () => this.nextSlide());
            this.startAutoplay();
            this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoplay());
            this.wrapper.addEventListener('touchstart', (e) => {
                this.startX = e.changedTouches[0].screenX;
                this.isDragging = true;
                this.pauseAutoplay();
            });
            this.wrapper.addEventListener('touchmove', (e) => {
                if (!this.isDragging) return;
                const currentX = e.changedTouches[0].screenX;
                const diffX = this.startX - currentX;
                this.wrapper.style.transform = `translateX(calc(-${this.currentSlide * 100}% - ${diffX}px))`;
            });
            this.wrapper.addEventListener('touchend', (e) => {
                if (!this.isDragging) return;
                this.isDragging = false;
                const endX = e.changedTouches[0].screenX;
                const diffX = this.startX - endX;
                if (diffX > 50) this.nextSlide();
                else if (diffX < -50) this.prevSlide();
                else this.updateSlide();
            });
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                else if (e.key === 'ArrowRight') this.nextSlide();
            });
            window.addEventListener('resize', debounce(() => this.updateSlide(), 200));
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.lazyLoadImages();
                    observer.unobserve(this.container);
                }
            }, { threshold: 0.1 });
            observer.observe(this.container);
            const visibilityObserver = new IntersectionObserver((entries) => {
                entries[0].isIntersecting ? this.resumeAutoplay() : this.pauseAutoplay();
            }, { threshold: 0 });
            visibilityObserver.observe(this.container);
        }

        createDots() {
            const dotsContainer = document.createElement('div');
            dotsContainer.classList.add('slide-dots');
            this.slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    this.currentSlide = i;
                    this.updateSlide();
                    this.pauseAutoplay();
                });
                dotsContainer.appendChild(dot);
            });
            this.container.appendChild(dotsContainer);
        }

        lazyLoadImages() {
            this.slides.forEach(slide => {
                const img = slide.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }

        updateSlide() {
            this.wrapper.style.transition = 'transform 0.6s ease';
            this.wrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
            document.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentSlide);
            });
            console.log(`script.js: Slide atual: ${this.currentSlide + 1}`);
        }

        nextSlide() {
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;
            this.updateSlide();
            this.pauseAutoplay();
        }

        prevSlide() {
            this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.updateSlide();
            this.pauseAutoplay();
        }

        startAutoplay() {
            this.autoplay = setInterval(() => {
                requestAnimationFrame(() => this.nextSlide());
            }, this.autoplayInterval);
        }

        pauseAutoplay() {
            clearInterval(this.autoplay);
            this.isPaused = true;
        }

        resumeAutoplay() {
            if (!this.isPaused) return;
            this.isPaused = false;
            this.startAutoplay();
        }
    }

    // === Gerenciador de Seções Expansíveis ===
    class ExpandableSections {
        constructor() {
            this.sections = document.querySelectorAll('.section');
            this.faqs = document.querySelectorAll('.faq-item');
            this.states = JSON.parse(localStorage.getItem('sectionStates') || '{}');

            if (this.sections.length === 0 && this.faqs.length === 0) {
                console.warn('script.js: Seções expansíveis ou FAQs não encontrados');
                return;
            }

            this.init();
        }

        init() {
            this.sections.forEach((section, index) => {
                const header = section.querySelector('h2');
                const content = section.querySelector('.section-content');
                if (header && content) {
                    header.addEventListener('click', () => this.toggleSection(section, content, index));
                    header.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.toggleSection(section, content, index);
                        }
                    });
                    if (this.states[index]) {
                        content.classList.add('active');
                        content.style.maxHeight = `${content.scrollHeight}px`;
                    }
                }
            });
            this.faqs.forEach((faq, index) => {
                const header = faq.querySelector('h3');
                const content = faq.querySelector('.faq-content');
                if (header && content) {
                    header.addEventListener('click', () => {
                        const isActive = content.classList.toggle('active');
                        header.querySelector('i').classList.toggle('fa-chevron-up', isActive);
                        header.querySelector('i').classList.toggle('fa-chevron-down', !isActive);
                        console.log(`script.js: FAQ ${index + 1} ${isActive ? 'aberto' : 'fechado'}`);
                    });
                }
            });
            if (Object.keys(this.states).length > 50) {
                localStorage.removeItem('sectionStates');
                this.states = {};
            }
        }

        toggleSection(section, content, index) {
            const isActive = content.classList.contains('active');
            this.sections.forEach(s => {
                const c = s.querySelector('.section-content');
                if (c) {
                    c.classList.remove('active');
                    c.style.maxHeight = null;
                }
            });
            if (!isActive) {
                content.classList.add('active');
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
            this.states[index] = !isActive;
            localStorage.setItem('sectionStates', JSON.stringify(this.states));
        }
    }

    // === Gerenciador de Formulários ===
    class FormHandler {
        constructor() {
            this.franchiseForm = document.getElementById('franchise-application');
            this.response = document.getElementById('franchise-response');
            this.searchForm = document.getElementById('search-form'); // pesquisa.html
            this.indexSearchForm = document.querySelector('.search-form'); // index.html
            this.newsletterForm = document.querySelector('.newsletter-form');
            this.searchResponse = document.createElement('div');

            if (!this.franchiseForm || !this.response) {
                console.warn('script.js: Formulário de franquia ou resposta não encontrados');
            }

            if (!this.searchForm && !this.indexSearchForm) {
                console.warn('script.js: Formulário de busca não encontrado');
            }

            if (!this.newsletterForm) {
                console.warn('script.js: Formulário de newsletter não encontrado');
            }

            this.init();
        }

        init() {
            // Formulário de franquia
            if (this.franchiseForm && this.response) {
                this.franchiseForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    try {
                        const data = new FormData(this.franchiseForm);
                        console.log('script.js: Dados do formulário de franquia:', Object.fromEntries(data));
                        this.response.textContent = 'Candidatura enviada! Entraremos em contato em 72h.';
                        this.response.style.display = 'block';
                        this.response.style.color = '#10b981';
                        this.franchiseForm.reset();
                        setTimeout(() => {
                            this.response.style.display = 'none';
                        }, 5000);
                    } catch (error) {
                        console.error('script.js: Erro ao processar formulário de franquia:', error);
                        this.response.textContent = 'Erro ao enviar. Tente novamente.';
                        this.response.style.display = 'block';
                        this.response.style.color = '#ef4444';
                    }
                });
            }

            // Formulário de busca (pesquisa.html)
            if (this.searchForm) {
                this.searchResponse.classList.add('search-response');
                this.searchResponse.setAttribute('aria-live', 'polite');
                this.searchForm.appendChild(this.searchResponse);
                const destinationInput = document.getElementById('search-destination');
                if (destinationInput) {
                    destinationInput.addEventListener('focus', () => {
                        console.log('script.js: Campo search-destination focado');
                    });
                    destinationInput.addEventListener('input', (e) => {
                        console.log('script.js: Texto digitado em search-destination:', e.target.value);
                    });
                    destinationInput.addEventListener('touchstart', (e) => {
                        e.target.focus();
                        console.log('script.js: Toque no campo search-destination');
                    });
                }
                this.searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const destination = document.getElementById('search-destination')?.value;
                    const date = document.getElementById('search-date')?.value;
                    const guests = document.getElementById('search-guests')?.value;
                    const budget = document.getElementById('search-budget')?.value;

                    if (destination && date && guests && budget) {
                        this.searchResponse.textContent = `Pesquisa: ${destination} em ${date} para ${guests} pessoas com até ${budget}€`;
                        this.searchResponse.style.color = '#10b981';
                    } else {
                        this.searchResponse.textContent = 'Preencha todos os campos!';
                        this.searchResponse.style.color = '#ef4444';
                    }
                    this.searchResponse.style.display = 'block';
                    setTimeout(() => {
                        this.searchResponse.style.display = 'none';
                    }, 5000);
                });
            }

            // Formulário de busca (index.html)
            if (this.indexSearchForm) {
                this.indexSearchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const destination = document.getElementById('destination')?.value;
                    const checkIn = document.getElementById('check-in')?.value;
                    const checkOut = document.getElementById('check-out')?.value;

                    if (destination && checkIn && checkOut) {
                        console.log(`script.js: Pesquisa em index.html: ${destination}, Check-in: ${checkIn}, Check-out: ${checkOut}`);
                        // Redireciona para pesquisa.html com parâmetros
                        const params = new URLSearchParams({
                            destination,
                            checkIn,
                            checkOut
                        });
                        window.location.href = `pesquisa.html?${params.toString()}`;
                    } else {
                        const response = document.createElement('div');
                        response.classList.add('search-response');
                        response.setAttribute('aria-live', 'polite');
                        response.textContent = 'Preencha todos os campos!';
                        response.style.color = '#ef4444';
                        response.style.display = 'block';
                        this.indexSearchForm.appendChild(response);
                        setTimeout(() => {
                            response.remove();
                        }, 5000);
                    }
                });

                const destinationInput = document.getElementById('destination');
                if (destinationInput) {
                    destinationInput.addEventListener('focus', () => {
                        console.log('script.js: Campo destination focado');
                    });
                    destinationInput.addEventListener('input', (e) => {
                        console.log('script.js: Texto digitado em destination:', e.target.value);
                    });
                    destinationInput.addEventListener('touchstart', (e) => {
                        e.target.focus();
                        console.log('script.js: Toque no campo destination');
                    });
                }
            }

            // Formulário de newsletter
            if (this.newsletterForm) {
                this.newsletterForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email')?.value;
                    const response = document.createElement('div');
                    response.classList.add('search-response');
                    response.setAttribute('aria-live', 'polite');

                    if (email) {
                        console.log('script.js: Newsletter inscrita com email:', email);
                        response.textContent = 'Inscrição realizada com sucesso!';
                        response.style.color = '#10b981';
                    } else {
                        response.textContent = 'Por favor, insira um e-mail válido!';
                        response.style.color = '#ef4444';
                    }

                    this.newsletterForm.appendChild(response);
                    response.style.display = 'block';
                    setTimeout(() => {
                        response.remove();
                    }, 5000);
                    this.newsletterForm.reset();
                });
            }
        }
    }

    // === Gerenciador de Favoritos ===
    class FavoritesHandler {
        constructor() {
            this.favoriteButtons = document.querySelectorAll('.add-favorite');
            this.response = document.createElement('div');
            this.response.classList.add('favorite-response');
            this.response.setAttribute('aria-live', 'polite');

            if (this.favoriteButtons.length === 0) {
                console.warn('script.js: Botões de favoritos não encontrados');
                return;
            }

            document.body.appendChild(this.response);
            this.init();
        }

        init() {
            this.favoriteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const li = e.target.closest('li');
                    if (li) {
                        const text = li.textContent.replace(/Adicionar/gi, '').trim();
                        this.response.textContent = `Adicionado aos favoritos: ${text}`;
                        this.response.style.color = '#10b981';
                        this.response.style.display = 'block';
                        setTimeout(() => {
                            this.response.style.display = 'none';
                        }, 3000);
                    }
                });
            });
        }
    }

    // === Gerenciador de Mapa ===
    class MapHandler {
        constructor() {
            this.mapContainer = document.getElementById('map');
            if (!this.mapContainer) {
                console.warn('script.js: Elemento #map não encontrado');
                return;
            }

            if (typeof L === 'undefined') {
                console.error('script.js: Biblioteca Leaflet não carregada');
                return;
            }

            this.init();
        }

        init() {
            try {
                // Mapa já inicializado no script inline da index.html
                console.log('script.js: Mapa já gerenciado pelo script inline da index.html');
            } catch (error) {
                console.error('script.js: Erro ao inicializar o mapa:', error);
            }
        }
    }

    // === Inicialização ===
    try {
        new SideMenu();
        new Carousel();
        new ExpandableSections();
        new FormHandler();
        new FavoritesHandler();
        new MapHandler();
    } catch (error) {
        console.error('script.js: Erro na inicialização:', error);
    }
});