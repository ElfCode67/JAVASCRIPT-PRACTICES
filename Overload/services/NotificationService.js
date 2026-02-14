// services/NotificationService.js
export class NotificationService {
    #container;
    #timeout = 3000;

    constructor() {
        this.#container = document.querySelector('.toast-container');
        if (!this.#container) {
            this.#container = document.createElement('div');
            this.#container.className = 'toast-container';
            document.body.appendChild(this.#container);
        }
    }

    show(message, type = 'info') {
        const toast = this.#createToast(message, type);
        this.#container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, this.#timeout);
    }

    #createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${this.#getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        // Add click to dismiss
        toast.addEventListener('click', () => toast.remove());
        
        return toast;
    }

    #getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] ?? icons.info;
    }
}