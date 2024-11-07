class AccessController {
    constructor() {
        this.requiredParams = {
            lock: 'false',
            key: 'auroraPass'
        };
        this.init();
    }

    init() {
        if (!this.validateAccess()) {
            this.handleUnauthorizedAccess();
        }
    }

    validateAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        return Object.entries(this.requiredParams).every(([param, value]) => 
            urlParams.get(param) === value
        );
    }

    handleUnauthorizedAccess() {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #f8f9fa;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                font-family: Arial, sans-serif;
            ">
                <h1 style="color: #dc3545;">Access Denied</h1>
                <p style="color: #6c757d;">You don't have permission to access this page.</p>
                <p style="color: #6c757d;">Please contact the administrator for access.</p>
            </div>
        `;

        const scripts = document.getElementsByTagName('script');
        Array.from(scripts).forEach(script => {
            if (!script.src.includes('access-control')) {
                script.remove();
            }
        });

        const styles = document.getElementsByTagName('link');
        Array.from(styles).forEach(style => style.remove());

        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
            }
        });

        const forms = document.getElementsByTagName('form');
        Array.from(forms).forEach(form => {
            form.onsubmit = e => e.preventDefault();
        });

        console.warn('Unauthorized access attempt blocked');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AccessController();
});

(function() {
    if (window.history && window.history.pushState) {
        window.history.pushState('', '', window.location.href);
        window.onpopstate = function() {
            window.history.pushState('', '', window.location.href);
        };
    }
})();