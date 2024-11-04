function modernizeCheckboxes() {
    const originalCheckboxes = document.querySelectorAll('input[type="checkbox"]:not(.modernized)');

    originalCheckboxes.forEach(checkbox => {
        checkbox.classList.add('modernized');
        let labelText = '';
        let originalLabel = checkbox.nextElementSibling;
        
        if (originalLabel && originalLabel.tagName === 'LABEL') {
            labelText = originalLabel.textContent;
            originalLabel.remove();
        } else if (checkbox.id) {
            const associatedLabel = document.querySelector(`label[for="${checkbox.id}"]`);
            if (associatedLabel) {
                labelText = associatedLabel.textContent;
                associatedLabel.remove();
            }
        }
        const wrapper = document.createElement('label');
        wrapper.className = 'modern-checkbox-wrapper';

        checkbox.parentNode.insertBefore(wrapper, checkbox);
        wrapper.appendChild(checkbox);

        if (labelText) {
            wrapper.appendChild(document.createTextNode(labelText));
        }

        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        wrapper.appendChild(checkmark);

        if (checkbox.disabled) {
            wrapper.classList.add('disabled');
        }

        checkbox.addEventListener('change', (e) => {
            const event = new CustomEvent('modern-checkbox-change', {
                detail: {
                    checked: e.target.checked,
                    originalEvent: e
                },
                bubbles: true
            });
            checkbox.dispatchEvent(event);
        });

        checkbox.addEventListener('focus', () => {
            wrapper.classList.add('focused');
        });

        checkbox.addEventListener('blur', () => {
            wrapper.classList.remove('focused');
        });
    });
}
document.addEventListener('DOMContentLoaded', modernizeCheckboxes);
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            modernizeCheckboxes();
        }
    });
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});
document.addEventListener('modern-checkbox-change', (e) => {
    console.log('Checkbox changed:', {
        checked: e.detail.checked,
        element: e.target
    });
});