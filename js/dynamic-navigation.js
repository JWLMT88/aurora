document.addEventListener('DOMContentLoaded', () => {
    const backdrop = document.createElement('div');
    backdrop.id = 'dynamic-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0);
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        z-index: 999;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
    `;
    document.body.appendChild(backdrop);

    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'dynamic-iframe-container';
    iframeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        display: none;
    `;
    document.body.appendChild(iframeContainer);

    const style = document.createElement('style');
    style.textContent = `
        .iframe-overlay {
            position: absolute;
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
            overflow: hidden;
            opacity: 0.7;
            filter: blur(0px);
        }
        .iframe-overlay.active {
            opacity: 1;
            filter: blur(0px);
        }
        .iframe-overlay iframe {
            width: 100%;
            height: 100%;
            border: none;
            opacity: 0;
            transform: scale(0.98);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .iframe-overlay.active iframe {
            opacity: 1;
            transform: scale(1);
        }
        .iframe-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1001;
            opacity: 0;
            transform: scale(0.9) rotate(-90deg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .iframe-overlay.active .iframe-close {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
        .iframe-close:hover {
            background: rgba(255,255,255,1);
            transform: scale(1.1) !important;
        }
        .iframe-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .link-highlight {
            position: relative;
            overflow: hidden;
        }
        .link-highlight::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(99, 102, 241, 0.1);
            border-radius: inherit;
            transform: scale(0);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .link-highlight:hover::after {
            transform: scale(1);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    function getAbsolutePosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }

    function animateBackdrop(show) {
        backdrop.style.opacity = show ? '1' : '0';
        backdrop.style.backdropFilter = show ? 'blur(20px)' : 'blur(0px)';
        backdrop.style.webkitBackdropFilter = show ? 'blur(20px)' : 'blur(0px)';
        backdrop.style.pointerEvents = show ? 'auto' : 'none';
    }

    async function handleNavigation(e, link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) return;

        const pos = getAbsolutePosition(link);

        const overlay = document.createElement('div');
        overlay.className = 'iframe-overlay';
        overlay.style.cssText = `
            top: ${pos.top}px;
            left: ${pos.left}px;
            width: ${pos.width}px;
            height: ${pos.height}px;
            transform: scale(1);
        `;

        const loader = document.createElement('div');
        loader.className = 'iframe-loader';

        const iframe = document.createElement('iframe');
        iframe.src = href;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'iframe-close';
        closeBtn.innerHTML = '<i class="ri-close-line text-xl"></i>';
        
        const closeOverlay = () => {
            overlay.style.transform = 'scale(1)';
            overlay.style.width = `${pos.width}px`;
            overlay.style.height = `${pos.height}px`;
            overlay.style.top = `${pos.top}px`;
            overlay.style.left = `${pos.left}px`;
            overlay.classList.remove('active');
            animateBackdrop(false);
            
            setTimeout(() => {
                iframeContainer.style.display = 'none';
                overlay.remove();
            }, 500);
        };

        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeOverlay();
        };

        overlay.appendChild(loader);
        overlay.appendChild(iframe);
        overlay.appendChild(closeBtn);
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(overlay);
        iframeContainer.style.display = 'block';

        animateBackdrop(true);

        iframe.onload = () => {
            loader.remove();
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        };

        requestAnimationFrame(() => {
            const finalWidth = window.innerWidth * 0.95;
            const finalHeight = window.innerHeight * 0.9;
            const finalTop = window.innerHeight * 0.05;
            const finalLeft = window.innerWidth * 0.025;

            overlay.style.width = `${finalWidth}px`;
            overlay.style.height = `${finalHeight}px`;
            overlay.style.top = `${finalTop}px`;
            overlay.style.left = `${finalLeft}px`;
            iframeContainer.style.pointerEvents = 'auto';
        });

        backdrop.onclick = closeOverlay;
    }

    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith('.html') && !href.startsWith('http')) {
            link.classList.add('link-highlight');
            link.addEventListener('click', (e) => handleNavigation(e, link));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const closeBtn = document.querySelector('.iframe-close');
            if (closeBtn) closeBtn.click();
        }
    });

    window.addEventListener('popstate', () => {
        const overlay = document.querySelector('.iframe-overlay');
        if (overlay) {
            const closeBtn = overlay.querySelector('.iframe-close');
            if (closeBtn) closeBtn.click();
        }
    });
});