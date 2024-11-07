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
        .split-screen-btn {
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 50%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            opacity: 0;
            transform: scale(0.9) rotate(-90deg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .acOpen {
            padding: 10px !important;
            border: 1px solid #cdcdcd !important;
            border-radius: 12px !important;
        }
            
        .iframe-overlay.active .split-screen-btn {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
        .split-screen-btn:hover {
            background: rgba(255,255,255,1);
            transform: scale(1.1) !important;
        }
        .links-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            z-index: 1002;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        .links-modal.active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            pointer-events: auto;
        }
        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
        }
        .link-card {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .link-card:hover {
            background: #e9ecef;
            transform: translateY(-2px);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e9ecef;
        }
        .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
        }
        .modal-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
        }
        .split-container {
            display: flex;
            gap: 16px;
            height: 100%;
        }
        .split-iframe {
            flex: 1;
            height: 100%;
            border-radius: 8px;
            overflow: hidden;
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
        .iframe-controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1001;
        }
        .iframe-close,
        .iframe-pin {
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
            opacity: 0;
            transform: scale(0.9) rotate(-90deg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .iframe-overlay.active .iframe-close,
        .iframe-overlay.active .iframe-pin {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
        .iframe-close:hover,
        .iframe-pin:hover {
            background: rgba(255,255,255,1);
            transform: scale(1.1) !important;
        }
        .iframe-pin.pinned {
            background: rgba(99, 102, 241, 0.1);
            color: rgb(99, 102, 241);
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
        .floating-window {
            position: relative !important;
            margin: 1rem;
            width: calc(100% - 2rem) !important;
            height: 400px !important;
            transition: none !important;
        }
    `;
    document.head.appendChild(style);

    const linksModal = document.createElement('div');
    linksModal.className = 'links-modal';
    document.body.appendChild(linksModal);

    function showLinksModal(currentIframe) {
        const linksMore = Array.from(document.querySelectorAll('a[href]'))
          .filter(link => {
            const href = link.getAttribute('href');
            return href && !href.startsWith('http') && href !== '#';
          });
      
        const staticLinks = [
          { href: 'tasks.html', text: 'Tasks', icon: 'ri-task-line' },
          { href: 'notes.html', text: 'Notes', icon: 'ri-file-text-line' },
          { href: 'schedule.html', text: 'Schedule', icon: 'ri-calendar-line' },
          { href: 'grades.html', text: 'Grades', icon: 'ri-graduation-cap-line' },
          { href: 'reminders.html', text: 'Reminders', icon: 'ri-notification-line' }
        ];
      
        linksModal.innerHTML = `
          <div class="modal-header">
            <div class="modal-title">Open These Apps</div>
            <button class="modal-close">
              <i class="ri-close-line text-xl"></i>
            </button>
          </div>
          <div class="links-grid">
            ${staticLinks.map(link => `
              <div class="link-card" data-href="${link.href}">
                <i class="${link.icon}"></i>
                <span>${link.text}</span>
              </div>
            `).join('')}
          </div>
          <div class="more-links hidden">
            <h3>More Links</h3>
            <div class="links-grid">
                ${linksMore.map(link => `
                <div class="link-card" data-href="${link.getAttribute('href')}">
                    ${link.textContent || link.getAttribute('href')}
                </div>
                `).join('')}
            </div>
            </div>
        `;

        const moreLinksButton = linksModal.querySelector('.more-links');
            moreLinksButton.onclick = () => {
                moreLinksButton.classList.remove('hidden');
            };
      
        linksModal.classList.add('active');
        backdrop.style.zIndex = '1001';
      
        linksModal.querySelector('.modal-close').onclick = () => {
          linksModal.classList.remove('active');
          backdrop.style.zIndex = '999';
        };

        linksModal.querySelectorAll('.link-card').forEach(card => {
            card.onclick = () => {
                const href = card.dataset.href;
                const overlay = document.querySelector('.iframe-overlay');

                let splitContainer = overlay.querySelector('.split-container');
                if (!splitContainer) {
                    splitContainer = document.createElement('div');
                    splitContainer.className = 'split-container';

                    const existingIframe = overlay.querySelector('iframe');
                    const firstHalf = document.createElement('div');
                    firstHalf.className = 'split-iframe';
                    firstHalf.appendChild(existingIframe);
                    splitContainer.appendChild(firstHalf);

                    const secondHalf = document.createElement('div');
                    secondHalf.className = 'split-iframe';
                    const newIframe = document.createElement('iframe');
                    newIframe.src = href + "?lock=false&key=auroraPass";
                    secondHalf.appendChild(newIframe);
                    splitContainer.appendChild(secondHalf);
                    document.querySelector(".split-screen-btn").setAttribute("style","")
                    document.querySelector(".split-screen-btn").classList.add("acOpen")
                    document.getElementById("xd-split-text").innerText = card.innerText;
                    document.getElementById("xd-split-text").classList.remove("hidden");

                    overlay.insertBefore(splitContainer, overlay.querySelector('.iframe-controls'));
                }

                linksModal.classList.remove('active');
                backdrop.style.zIndex = '999';
            };
        });
    }

    function createSplitScreenButton() {
        const splitScreenBtn = document.createElement('button');
        splitScreenBtn.className = 'split-screen-btn';
        splitScreenBtn.style.width = "40px";
        splitScreenBtn.innerHTML = '<span class="mr-2 hidden" id="xd-split-text">Notes</span><i class="ri-layout-right-2-line text-xl"></i>';
        splitScreenBtn.onclick = (e) => {
            e.stopPropagation();
            showLinksModal();
        };
        return splitScreenBtn;
    }

    const originalHandleNavigation = handleNavigation;
    handleNavigation = async function (e, link) {
        await originalHandleNavigation(e, link);

        const overlay = document.querySelector('.iframe-overlay');
        if (overlay) {
            const controls = overlay.querySelector('.iframe-controls');
            const existingSplitBtn = controls.querySelector('.split-screen-btn');

            if (!existingSplitBtn) {
                const splitScreenBtn = createSplitScreenButton();
                controls.insertBefore(splitScreenBtn, controls.firstChild);
            }
        }
    };

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

        let overlayT = document.querySelector('.iframe-overlay:not(.floating-window)');
        if (overlayT) {
            overlayT.querySelector('iframe').src = href + "?lock=false&key=auroraPass";
            return;
        }

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
        iframe.src = href + "?lock=false&key=auroraPass";

        const controls = document.createElement('div');
        controls.className = 'iframe-controls';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'iframe-close';
        closeBtn.innerHTML = '<i class="ri-close-line text-xl"></i>';

        const pinBtn = document.createElement('button');
        pinBtn.className = 'iframe-pin';
        pinBtn.innerHTML = '<i class="ri-pushpin-line text-xl"></i>';

        const closeOverlay = () => {
            if (overlay.classList.contains('floating-window')) {
                overlay.remove();
                return;
            }

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

        const pinWindow = () => {
            const floatingWrapper = document.getElementById('floating-window-wrapper');
            const mainWindow = document.getElementById('main-window-wrapper');
            if (!floatingWrapper) {
                console.error('floating-window-wrapper not found');
                return;
            }

            mainWindow.classList.add("hidden");

            overlay.classList.remove('active');
            overlay.classList.add
            floatingWrapper.appendChild(overlay);
            overlay.setAttribute("style", "")
            overlay.setAttribute("style", ` 
            height: 95vh;
            border-radius: 12px;
            border: 1px solid #e2e2e2;
            width: calc(100%) !important;
            position: relative;
            box-shadow: none;`)
            pinBtn.classList.add('pinned');
            pinBtn.innerHTML = '<i class="ri-pushpin-fill text-xl"></i>';

            animateBackdrop(false);
            iframeContainer.style.display = 'none';

            floatingWrapper.style.padding = "1rem"
            floatingWrapper.classList.remove("hidden");

        };

        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeOverlay();

            const floatingWrapper = document.getElementById('floating-window-wrapper');
            const mainWindow = document.getElementById('main-window-wrapper');

            mainWindow.classList.remove("hidden");
            floatingWrapper.classList.add("hidden")
        };

        pinBtn.onclick = (e) => {
            e.stopPropagation();
            if (pinBtn.classList.contains('pinned')) {
                closeOverlay();

                const floatingWrapper = document.getElementById('floating-window-wrapper');
                const mainWindow = document.getElementById('main-window-wrapper');

                mainWindow.classList.remove("hidden");
                floatingWrapper.classList.add("hidden")
                return;
            }
            pinWindow();
        };

        controls.appendChild(pinBtn);
        controls.appendChild(closeBtn);
        overlay.appendChild(loader);
        overlay.appendChild(iframe);
        overlay.appendChild(controls);
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

    const linksDiv = document.querySelectorAll('a[href]');
    linksDiv.forEach(link => {
        const href = link.getAttribute('href');
        if (href /*&& href.endsWith('.html')*/ && !href.startsWith('http')) {
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
        const overlay = document.querySelector('.iframe-overlay:not(.floating-window)');
        if (overlay) {
            const closeBtn = overlay.querySelector('.iframe-close');
            if (closeBtn) closeBtn.click();
        }
    });
});