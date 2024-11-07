// DevTools Protection Script
(function() {
    const protector = {
        init() {
            this.attachDebuggerDetection();
            this.preventKeyboardShortcuts();
            this.detectDevToolsOpen();
            this.obfuscateContent();
            this.preventInspect();
            this.originalContent = document.documentElement.innerHTML;
            this.isObfuscated = false;
            this.wrapper = null;
        },

        attachDebuggerDetection() {
            const timestamp = new Date().getTime();
            let counter = 0;
            
            setInterval(() => {
                const current = new Date().getTime();
                if (current - timestamp > 100) {
                    this.handleDevToolsOpen();
                    
                }
                counter++;
                
                if (counter > 100) {
                    counter = 0;
                }
            }, 100);

            (() => {
                function detect() {
                    const d = new Date();
                    const t1 = d.getTime();
                    debugger;
                    const t2 = new Date().getTime();
                    
                    
                    this.toggleObfuscation("sub");
                    return (t2 - t1) > 100;
                    
                }
                
                if (detect()) {
                    this.handleDevToolsOpen();
                    
                    this.toggleObfuscation("sub");
                }
            })();
        },

        preventKeyboardShortcuts() {
            window.addEventListener('keydown', (e) => {
                if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                    (e.ctrlKey && e.key === 'U')
                ) {
                    e.preventDefault();
                    this.handleDevToolsOpen();
                }
            }, true);

            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        },

        detectDevToolsOpen() {
            const threshold = 160;
            const el = document.createElement('div');
            
            Object.defineProperty(el, 'id', {
                get: () => {
                    this.handleDevToolsOpen();
                    return '';
                }
            });

            setInterval(() => {
                const widthThreshold = window.outerWidth - window.innerWidth > threshold;
                const heightThreshold = window.outerHeight - window.innerHeight > threshold;
                
                if (widthThreshold || heightThreshold) {
                    this.handleDevToolsOpen();
                }
            }, 1000);

            let times = [];
            const loop = () => {
                times.push(new Date());
                if (times.length > 3) times.shift();
                
                const diff = times[1] - times[0];
                if (diff > 100) {
                    this.handleDevToolsOpen();
                }
                
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        },

        obfuscateContent() {
           
            
        },

        toggleObfuscation(show) {
            console.log("triggered obfuscation")
            if (show == "sub" && !this.isObfuscated) {
                console.log("triggered obfuscation")
                const wrapper = this.wrapper ? this.wrapper : document.createElement('div');
                wrapper.style.height = '100vh';
                wrapper.style.width = '100vw';
                wrapper.style.position = 'fixed';
                wrapper.style.top = '0';
                wrapper.style.left = '0';
                wrapper.style.background = '#fff';
                wrapper.style.zIndex = '999999';
                wrapper.style.display = 'none';
                
                document.body.appendChild(wrapper);
                wrapper.style.display = 'block';
                wrapper.innerHTML = this.generateFakeContent();
                this.isObfuscated = true;
            } else if (!show && this.isObfuscated) {
                wrapper.style.display = 'none';
                this.isObfuscated = false;
            }
        },

        generateFakeContent() {
            return `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1>Debug Mode Activated</h1>
                    <p>System is running in secure mode. All sensitive content has been hidden.</p>
                    <div style="color: #666; margin-top: 20px;">
                        ${Array(50).fill('<!-- Debug information removed -->').join('\n')}
                    </div>
                </div>
            `;
        },

        preventInspect() {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.addEventListener('click', (e) => {
                    if (e.detail === 3) { 
                        e.preventDefault();
                        return false;
                    }
                });
            });

            const noop = () => undefined;
            window.console = {
                log: noop,
                info: noop,
                warn: noop,
                debug: noop,
                error: noop,
                dir: noop,
                trace: noop
            };
        },

        handleDevToolsOpen() {
            console.log("triggered obfuscation")

            const scripts = document.getElementsByTagName('script');
            Array.from(scripts).forEach(script => {
                if (!script.src.includes('devtools-protection')) {
                    script.remove();
                }
            });
            
        }
    };

    protector.init();

    (() => {
        const _constructor = window.Function.prototype.constructor;
        window.Function.prototype.constructor = function() {
            if (arguments[0]?.includes('debugger')) {
                return () => {};
            }
            return _constructor.apply(this, arguments);
        };
    })();

    setInterval(() => {
        const start = performance.now();
        const end = performance.now();
        
        if (end - start > 100) {
            protector.handleDevToolsOpen();
        }
    }, Math.random() * 1000 + 500);
})();