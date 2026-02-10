import { Library } from './library.js';
import { UIManager } from './ui.js';

// Main application
class LibraryApp {
    constructor() {
        this.library = new Library();
        this.ui = new UIManager(this.library);
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        console.log('Library Management System initialized');
        
        // Check online status
        this.updateConnectionStatus();
        window.addEventListener('online', () => this.updateConnectionStatus());
        window.addEventListener('offline', () => this.updateConnectionStatus());
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            const isOnline = navigator.onLine;
            statusElement.innerHTML = `
                <i class="fas fa-${isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                ${isOnline ? 'Online' : 'Offline'}
            `;
            statusElement.className = isOnline ? 'online' : 'offline';
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.library.saveToStorage();
                this.ui.showNotification('success', 'Saved', 'Library data saved');
            }
            
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                document.getElementById('api-modal').classList.add('hidden');
            }
        });
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LibraryApp();
});

// Export for debugging
export { LibraryApp };