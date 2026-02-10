export class UIManager {
    constructor(library) {
        this.library = library;
        this.selectedBooks = new Set();
        this.currentTab = 'books';
        this.initializeEventListeners();
        this.render();
    }
    
    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Add book
        document.getElementById('add-book-btn').addEventListener('click', () => {
            this.addBook();
        });
        
        // Add member
        document.getElementById('add-member-btn').addEventListener('click', () => {
            this.addMember();
        });
        
        // Search
        const searchInput = document.getElementById('search-input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchBooks(e.target.value);
            }, 300);
        });
        
        // Filters
        document.getElementById('filter-type').addEventListener('change', () => {
            this.searchBooks(searchInput.value);
        });
        
        document.getElementById('filter-status').addEventListener('change', () => {
            this.searchBooks(searchInput.value);
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Export
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportToCSV();
        });
        
        // Clear data
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data?')) {
                this.clearData();
            }
        });
        
        // API import
        document.getElementById('import-api-btn').addEventListener('click', () => {
            this.showApiModal();
        });
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
        
        // Render content for the tab
        this.renderTabContent();
    }
    
    renderTabContent() {
        switch (this.currentTab) {
            case 'books':
                this.renderBooks();
                break;
            case 'members':
                this.renderMembers();
                break;
            case 'borrowed':
                this.renderBorrowedBooks();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }
    
    renderBooks(books = null) {
        const booksToRender = books || this.library.books;
        const container = document.getElementById('books-container');
        
        if (booksToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open fa-3x"></i>
                    <h3>No Books Found</h3>
                    <p>Add some books to get started.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = booksToRender.map(book => this.createBookCard(book)).join('');
        
        // Add event listeners to book cards
        this.attachBookCardListeners();
    }
    
    createBookCard(book) {
        const isOverdue = !book.available && book.isOverdue();
        
        return `
            <div class="book-card" data-isbn="${book.isbn}">
                <div class="book-header">
                    <span class="book-type ${book.type}">
                        ${book.type.charAt(0).toUpperCase() + book.type.slice(1)}
                    </span>
                    <span class="book-status ${book.available ? 'available' : 'borrowed'}">
                        ${book.available ? 'Available' : 'Borrowed'}
                        ${isOverdue ? ' (Overdue!)' : ''}
                    </span>
                </div>
                
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                
                <div class="book-details">
                    <div class="detail">
                        <span class="detail-label">ISBN:</span>
                        <span>${book.isbn}</span>
                    </div>
                    <div class="detail">
                        <span class="detail-label">Year:</span>
                        <span>${book.year}</span>
                    </div>
                    ${!book.available ? `
                        <div class="detail">
                            <span class="detail-label">Due:</span>
                            <span class="${isOverdue ? 'text-danger' : ''}">
                                ${new Date(book.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="book-actions">
                    ${book.available ? `
                        <button class="btn btn-primary borrow-btn" data-isbn="${book.isbn}">
                            <i class="fas fa-sign-out-alt"></i> Borrow
                        </button>
                    ` : `
                        <button class="btn btn-warning return-btn" data-isbn="${book.isbn}">
                            <i class="fas fa-sign-in-alt"></i> Return
                        </button>
                    `}
                    <button class="btn btn-outline details-btn" data-isbn="${book.isbn}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
    }
    
    attachBookCardListeners() {
        // Borrow buttons
        document.querySelectorAll('.borrow-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isbn = e.target.closest('button').dataset.isbn;
                this.borrowBook(isbn);
            });
        });
        
        // Return buttons
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isbn = e.target.closest('button').dataset.isbn;
                this.returnBook(isbn);
            });
        });
    }
    
    addBook() {
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const isbn = document.getElementById('book-isbn').value.trim();
        const year = document.getElementById('book-year').value;
        const type = document.getElementById('book-type').value;
        
        if (!title || !author || !isbn) {
            this.showNotification('error', 'Validation Error', 'Please fill in all required fields');
            return;
        }
        
        const book = new Book(title, author, isbn, year || new Date().getFullYear());
        book.type = type;
        
        this.library.addBook(book);
        this.showNotification('success', 'Book Added', `${title} has been added to the library`);
        
        // Clear form
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('book-isbn').value = '';
        document.getElementById('book-year').value = '';
        
        // Update UI
        this.updateStats();
        this.renderBooks();
    }
    
    addMember() {
        const name = document.getElementById('member-name').value.trim();
        const email = document.getElementById('member-email').value.trim();
        
        if (!name || !email) {
            this.showNotification('error', 'Validation Error', 'Please fill in all fields');
            return;
        }
        
        const member = new Member(name, email);
        this.library.addMember(member);
        this.showNotification('success', 'Member Added', `${name} has been added`);
        
        // Clear form
        document.getElementById('member-name').value = '';
        document.getElementById('member-email').value = '';
        
        this.updateStats();
        if (this.currentTab === 'members') {
            this.renderMembers();
        }
    }
    
    borrowBook(isbn) {
        // For simplicity, use first member
        const member = this.library.members[0];
        if (!member) {
            this.showNotification('error', 'No Members', 'Please add a member first');
            return;
        }
        
        if (this.library.borrowBook(isbn, member.id)) {
            this.showNotification('success', 'Book Borrowed', 'Book has been borrowed successfully');
            this.updateStats();
            this.renderBooks();
        } else {
            this.showNotification('error', 'Borrow Failed', 'Could not borrow the book');
        }
    }
    
    returnBook(isbn) {
        if (this.library.returnBook(isbn)) {
            this.showNotification('success', 'Book Returned', 'Book has been returned');
            this.updateStats();
            this.renderBooks();
        }
    }
    
    searchBooks(query) {
        const type = document.getElementById('filter-type').value;
        const status = document.getElementById('filter-status').value;
        
        const results = this.library.searchBooks(query, { type, status });
        this.renderBooks(results);
    }
    
    updateStats() {
        const stats = this.library.getStats();
        
        document.getElementById('total-books').textContent = stats.totalBooks;
        document.getElementById('available-books').textContent = stats.availableBooks;
        document.getElementById('total-members').textContent = stats.totalMembers;
        document.getElementById('borrowed-books').textContent = stats.borrowedBooks;
        
        document.getElementById('popular-genre').textContent = stats.mostPopularGenre;
        document.getElementById('last-updated-time').textContent = 
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    exportToCSV() {
        const { booksCSV, membersCSV } = this.library.exportToCSV();
        
        // Create download links
        this.downloadFile(booksCSV, 'books_export.csv');
        this.downloadFile(membersCSV, 'members_export.csv');
        
        this.showNotification('success', 'Export Complete', 'Data exported as CSV files');
    }
    
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearData() {
        this.library.clearData();
        this.showNotification('success', 'Data Cleared', 'All data has been cleared');
        this.updateStats();
        this.renderBooks();
        this.renderMembers();
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('library-theme', newTheme);
        
        const icon = document.querySelector('#theme-toggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    async showApiModal() {
        const modal = document.getElementById('api-modal');
        modal.classList.remove('hidden');
        
        // Focus search input
        const searchInput = document.getElementById('api-search');
        searchInput.focus();
        
        // Search on enter
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.searchApiBooks(searchInput.value);
            }
        });
        
        // Close modal handlers
        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        document.getElementById('cancel-import').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    async searchApiBooks(query) {
        if (!query.trim()) return;
        
        const results = await ApiService.searchBooks(query);
        const container = document.getElementById('api-results');
        
        if (results.length === 0) {
            container.innerHTML = '<p class="text-center">No results found</p>';
            return;
        }
        
        container.innerHTML = results.map(book => `
            <div class="api-book" data-isbn="${book.isbn}">
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Year:</strong> ${book.year}</p>
            </div>
        `).join('');
        
        // Add selection handlers
        container.querySelectorAll('.api-book').forEach(book => {
            book.addEventListener('click', () => {
                book.classList.toggle('selected');
                this.updateImportButton();
            });
        });
    }
    
    updateImportButton() {
        const selected = document.querySelectorAll('.api-book.selected');
        const button = document.getElementById('confirm-import');
        
        button.disabled = selected.length === 0;
        button.innerHTML = `<i class="fas fa-download"></i> Import ${selected.length} Book(s)`;
    }
    
    showNotification(type, title, message) {
        const container = document.getElementById('notification-area');
        const id = Date.now();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" data-id="${id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    render() {
        this.updateStats();
        this.switchTab('books');
        this.initializeTheme();
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('library-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}