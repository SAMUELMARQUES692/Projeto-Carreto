/* Marcelo Fretes — Projeto Carreto N2: interação e movimento (Vanilla JS) */

document.addEventListener('DOMContentLoaded', () => {

    // --- MENU MOBILE ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileMenuToggle && mobileNav) {
        const closeMenu = () => {
            mobileNav.classList.remove('open');
            mobileMenuToggle.classList.remove('open');
        };

        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileNav.classList.toggle('open');
            mobileMenuToggle.classList.toggle('open', isOpen);
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // --- COMMAND BAR: classe "scrolled" (encolhe e ganha véu de leitura) ---
    const header = document.getElementById('site-header');

    const handleHeaderScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    handleHeaderScroll();
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // --- PARALLAX: veículo e anotações técnicas ---
    const truckImage = document.getElementById('truck-image');
    const annotations = document.querySelectorAll('.annotation');

    // Ordem no DOM: Chassi, Baú, Rota
    const annotationSpeeds = [0.08, -0.05, 0.12];

    // --- COMO FUNCIONA: linha de processo preenchida pelo scroll ---
    const processList = document.getElementById('process-list');
    const processFill = document.getElementById('process-fill');
    const processSteps = document.querySelectorAll('.process-step');

    const updateProcessFill = () => {
        if (!processList || !processFill) return;

        const scrollY = window.scrollY;
        const viewportH = window.innerHeight;
        const rect = processList.getBoundingClientRect();
        const listAbsTop = rect.top + scrollY;
        const listAbsBottom = listAbsTop + rect.height;
        const maxScrollY = document.documentElement.scrollHeight - viewportH;

        // A barra começa a preencher quando o topo da lista entra 85% da tela
        // (de baixo pra cima) e termina quando a base passa a marca de 35% —
        // acompanhando a leitura, não o topo/fundo exatos da seção. O alvo
        // final é limitado ao scroll máximo da página: se "Como Funciona" for
        // a última seção, não sobra espaço abaixo para chegar aos 35%, então
        // o preenchimento completa junto com o fim real do scroll.
        const startScrollY = listAbsTop - viewportH * 0.85;
        const idealEndScrollY = listAbsBottom - viewportH * 0.35;
        const endScrollY = Math.min(idealEndScrollY, Math.max(maxScrollY, startScrollY + 1));

        let progress = (scrollY - startScrollY) / (endScrollY - startScrollY);
        progress = Math.max(0, Math.min(1, progress));

        processFill.style.height = `${progress * 100}%`;

        processSteps.forEach((step, index) => {
            const stepProgress = (index + 0.5) / processSteps.length;
            step.classList.toggle('reached', progress >= stepProgress);
        });
    };

    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;

        if (truckImage) {
            const truckOffset = scrollY * 0.12;
            truckImage.style.transform = `translate3d(0, ${truckOffset}px, 0)`;
        }

        annotations.forEach((item, index) => {
            const speed = annotationSpeeds[index] || 0.05;
            item.style.setProperty('--scroll-translate', `${scrollY * speed}px`);
        });

        updateProcessFill();

        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProcessFill, { passive: true });
    updateProcessFill();

    // --- NAVEGAÇÃO ATIVA: acompanha a seção visível ---
    const navLinks = document.querySelectorAll('.nav-link');
    const trackedSections = document.querySelectorAll('main > section[id]');

    // rootMargin encolhe a área de observação para uma faixa fina no centro da
    // tela — necessário porque as seções são bem mais altas que o viewport,
    // então um threshold de área (ex.: 0.5) nunca dispararia.
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

    trackedSections.forEach(section => navObserver.observe(section));

    // --- REVEAL ON SCROLL: anima elementos .reveal-el quando entram na tela ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal-el').forEach(el => revealObserver.observe(el));

    // --- FLASHLIGHT: brilho que segue o cursor nos cards de serviço ---
    document.querySelectorAll('.flashlight-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // --- CURSOR CUSTOMIZADO (mira/crosshair) ---
    const cursorFollower = document.getElementById('cursor-follower');

    if (cursorFollower && window.matchMedia('(min-width: 1025px)').matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const updateCursor = () => {
            followerX += (mouseX - followerX) * 0.18;
            followerY += (mouseY - followerY) * 0.18;

            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;

            requestAnimationFrame(updateCursor);
        };

        requestAnimationFrame(updateCursor);

        const addActiveCursor = () => cursorFollower.classList.add('active');
        const removeActiveCursor = () => cursorFollower.classList.remove('active');

        const updateClickableListeners = () => {
            const clickables = document.querySelectorAll('a, button, .annotation, .logo');
            clickables.forEach(item => {
                item.removeEventListener('mouseenter', addActiveCursor);
                item.removeEventListener('mouseleave', removeActiveCursor);
                item.addEventListener('mouseenter', addActiveCursor);
                item.addEventListener('mouseleave', removeActiveCursor);
            });
        };

        updateClickableListeners();

        const observer = new MutationObserver(updateClickableListeners);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- MODAL DE ORÇAMENTO: questionário antes de seguir pro WhatsApp ---
    const WHATSAPP_NUMBER = '5511984563115';

    const orcamentoOverlay = document.getElementById('orcamento-overlay');
    const orcamentoModal = document.querySelector('.orcamento-modal');
    const orcamentoForm = document.getElementById('orcamento-form');
    const orcamentoClose = document.getElementById('orcamento-close');
    const orcamentoTriggers = document.querySelectorAll('.js-open-orcamento');

    if (orcamentoOverlay && orcamentoForm && orcamentoTriggers.length) {
        const openOrcamento = (e) => {
            e.preventDefault();
            orcamentoOverlay.classList.add('open');
            orcamentoOverlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('no-scroll');
        };

        const closeOrcamento = () => {
            orcamentoOverlay.classList.remove('open');
            orcamentoOverlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        };

        orcamentoTriggers.forEach(trigger => trigger.addEventListener('click', openOrcamento));

        orcamentoClose.addEventListener('click', closeOrcamento);

        orcamentoOverlay.addEventListener('click', (e) => {
            if (!orcamentoModal.contains(e.target)) closeOrcamento();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && orcamentoOverlay.classList.contains('open')) closeOrcamento();
        });

        orcamentoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = new FormData(orcamentoForm);
            const origem = data.get('origem').trim();
            const destino = data.get('destino').trim();
            const embalagemGrandes = data.get('embalagem-grandes');
            const embalagemMiudezas = data.get('embalagem-miudezas');
            const personalOrganizer = data.get('personal-organizer');

            const mensagem = [
                'Olá! Gostaria de um orçamento de mudança. Seguem os detalhes:',
                '',
                `📍 Endereço de saída: ${origem}`,
                `📍 Endereço de destino: ${destino}`,
                `📦 Embalagem para itens grandes/frágeis: ${embalagemGrandes}`,
                `🧰 Embalagem de miudezas: ${embalagemMiudezas}`,
                `🧹 Personal organizer: ${personalOrganizer}`
            ].join('\n');

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');

            closeOrcamento();
            orcamentoForm.reset();
        });
    }
});
