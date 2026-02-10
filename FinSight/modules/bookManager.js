import { Book, EBook, AudioBook } from './libraryClasses.js';
import { showNotification } from './notifications.js';
import { showLoading, hideLoading } from './uiRenderer.js';
import { saveToStorage, loadFromStorage } from './storageService.js';

// Book Manager Module
class BookManager {
    constructor(library) {
        this.library = library;
        this.currentBooks = [];
        this.selectedBooks = new Set();
        this.sortField = 'title';
        this.sortDirection = 'asc';
        this.currentFilters = {};
        this.searchDebounceTimer = null;
    }
    
    // Add a new book
    async addBook(bookData, type = 'regular') {
        try {
            showLoading('Adding book...');
            
            // Validate book data
            const validation = Book.validateBookData(bookData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            
            let newBook;
            
            // Create appropriate book type
            switch (type) {
                case 'ebook':
                    newBook = new EBook(
                        bookData.title,
                        bookData.author,
                        bookData.isbn,
                        bookData.year,
                        bookData.format || 'PDF',
                        bookData.fileSize || 0
                    );
                    break;
                    
                case 'audiobook':
                    newBook = new AudioBook(
                        bookData.title,
                        bookData.author,
                        bookData.isbn,
                        bookData.year,
                        bookData.narrator || '',
                        bookData.duration || 0
                    );
                    break;
                    
                default:
                    newBook = new Book(
                        bookData.title,
                        bookData.author,
                        bookData.isbn,
                        bookData.year
                    );
            }
            
            // Add genre and tags if provided
            if (bookData.genre) {
                newBook.genre = bookData.genre;
            }
            
            if (bookData.tags) {
                newBook.tags = Array.isArray(bookData.tags) ? bookData.tags : [bookData.tags];
            }
            
            if (bookData.coverUrl) {
                newBook.coverUrl = bookData.coverUrl;
            }
            
            // Add to library
            const addedBook = this.library.addBook(newBook);
            
            // Update current books list
            this.currentBooks = this.library.books;
            
            // Save to storage
            await saveToStorage(this.library);
            
            showNotification('success', 'Book Added', `${addedBook.title} has been added successfully.`);
            
            return {
                success: true,
                book: addedBook,
                message: 'Book added successfully'
            };
            
        } catch (error) {
            showNotification('error', 'Add Book Failed', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            hideLoading();
        }
    }
    
    // Update an existing book
    async updateBook(isbn, updates) {
        try {
            showLoading('Updating book...');
            
            const book = this.library.findBookByIsbn(isbn);
            if (!book) {
                throw new Error('Book not found');
            }
            
            // Apply updates
            Object.keys(updates).forEach(key => {
                if (key in book && key !== 'id' && key !== 'isbn') {
                    book[key] = updates[key];
                }
            });
            
            book.updatedAt = new Date().toISOString();
            
            // Update current books list
            this.currentBooks = this.library.books;
            
            // Save to storage
            await saveToStorage(this.library);
            
            showNotification('success', 'Book Updated', `${book.title} has been updated successfully.`);
            
            return {
                success: true,
                book,
                message: 'Book updated successfully'
            };
            
        } catch (error) {
            showNotification('error', 'Update Failed', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            hideLoading();
        }
    }
    
    // Delete a book
    async deleteBook(isbn) {
        try {
            showLoading('Deleting book...');
            
            const bookIndex = this.library.books.findIndex(book => book.isbn === isbn);
            if (bookIndex === -1) {
                throw new Error('Book not found');
            }
            
            const book = this.library.books[bookIndex];
            
            // Check if book is borrowed
            if (!book.available) {
                throw new Error('Cannot delete a borrowed book');
            }
            
            // Remove from library
            this.library.books.splice(bookIndex, 1);
            
            // Update stats
            this.library.updateStats();
            
            // Update current books list
            this.currentBooks = this.library.books;
            
            // Save to storage
            await saveToStorage(this.library);
            
            showNotification('success', 'Book Deleted', `${book.title} has been deleted.`);
            
            return {
                success: true,
                message: 'Book deleted successfully'
            };
            
        } catch (error) {
            showNotification('error', 'Delete Failed', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            hideLoading();
        }
    }
    
    // Delete multiple books
    async deleteMultipleBooks(isbns) {
        try {
            showLoading('Deleting books...');
            
            const results = [];
            const errors = [];
            
            for (const isbn of isbns) {
                try {
                    const result = await this.deleteBook(isbn);
                    if (result.success) {
                        results.push(isbn);
                    } else {
                        errors.push({ isbn, error: result.error });
                    }
                } catch (error) {
                    errors.push({ isbn, error: error.message });
                }
            }
            
            if (errors.length > 0) {
                showNotification(
                    'warning',
                    'Partial Deletion',
                    `Deleted ${results.length} books. ${errors.length} failed.`
                );
            } else {
                showNotification('success', 'Books Deleted', `Successfully deleted ${results.length} books.`);
            }
            
            return {
                success: errors.length === 0,
                deleted: results,
                errors,
                message: `Deleted ${results.length} of ${isbns.length} books`
            };
            
        } finally {
            hideLoading();
        }
    }
    
    // Search books with debouncing
    searchBooks(query, filters = {}) {
        clearTimeout(this.searchDebounceTimer);
        
        return new Promise((resolve) => {
            this.searchDebounceTimer = setTimeout(() => {
                this.currentFilters = { ...this.currentFilters, ...filters };
                const results = this.library.searchBooks(query, this.currentFilters);
                this.currentBooks = results;
                resolve(results);
            }, 300);
        });
    }
    
    // Sort books
    sortBooks(field = 'title', direction = 'asc') {
        this.sortField = field;
        this.sortDirection = direction;
        
        return this.currentBooks.sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];
            
            // Handle nested properties
            if (field.includes('.')) {
                const parts = field.split('.');
                valueA = parts.reduce((obj, key) => obj?.[key], a);
                valueB = parts.reduce((obj, key) => obj?.[key], b);
            }
            
            // Handle different data types
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    // Toggle book selection
    toggleBookSelection(isbn) {
        if (this.selectedBooks.has(isbn)) {
            this.selectedBooks.delete(isbn);
        } else {
            this.selectedBooks.add(isbn);
        }
        return this.selectedBooks;
    }
    
    // Clear all selections
    clearSelections() {
        this.selectedBooks.clear();
    }
    
    // Get selected books
    getSelectedBooks() {
        return Array.from(this.selectedBooks).map(isbn => 
            this.library.findBookByIsbn(isbn)
        ).filter(book => book !== undefined);
    }
    
    // Import books from API
    async importFromAPI(query, limit = 10) {
        try {
            showLoading('Searching Open Library...');
            
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
            );
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            const books = data.docs.map(doc => ({
                title: doc.title,
                author: doc.author_name?.[0] || 'Unknown Author',
                isbn: doc.isbn?.[0] || '',
                year: doc.first_publish_year || new Date().getFullYear(),
                coverUrl: doc.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                    : '',
                publisher: doc.publisher?.[0] || '',
                language: doc.language?.[0] || 'en'
            })).filter(book => book.isbn); // Only include books with ISBN
            
            hideLoading();
            return {
                success: true,
                books,
                totalFound: data.numFound,
                message: `Found ${books.length} books with valid ISBN`
            };
            
        } catch (error) {
            hideLoading();
            showNotification('error', 'API Import Failed', error.message);
            return {
                success: false,
                error: error.message,
                books: []
            };
        }
    }
    
    // Bulk import books
    async bulkImport(books) {
        try {
            showLoading(`Importing ${books.length} books...`);
            
            const results = {
                success: 0,
                failed: 0,
                errors: []
            };
            
            for (const bookData of books) {
                try {
                    // Validate required fields
                    if (!bookData.title || !bookData.author || !bookData.isbn) {
                        throw new Error('Missing required fields');
                    }
                    
                    // Check if book already exists
                    const existingBook = this.library.findBookByIsbn(bookData.isbn);
                    if (existingBook) {
                        throw new Error('Book already exists');
                    }
                    
                    // Create and add book
                    const book = new Book(
                        bookData.title,
                        bookData.author,
                        bookData.isbn,
                        bookData.year
                    );
                    
                    if (bookData.genre) book.genre = bookData.genre;
                    if (bookData.coverUrl) book.coverUrl = bookData.coverUrl;
                    
                    this.library.addBook(book);
                    results.success++;
                    
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        book: bookData,
                        error: error.message
                    });
                }
            }
            
            // Update library
            this.library.updateStats();
            this.currentBooks = this.library.books;
            
            // Save to storage
            await saveToStorage(this.library);
            
            hideLoading();
            
            if (results.failed > 0) {
                showNotification(
                    'warning',
                    'Bulk Import Complete',
                    `Imported ${results.success} books, ${results.failed} failed.`
                );
            } else {
                showNotification(
                    'success',
                    'Bulk Import Complete',
                    `Successfully imported ${results.success} books.`
                );
            }
            
            return results;
            
        } catch (error) {
            hideLoading();
            showNotification('error', 'Bulk Import Failed', error.message);
            throw error;
        }
    }
    
    // Export books to CSV
    exportToCSV(books = null) {
        const booksToExport = books || this.currentBooks;
        
        if (booksToExport.length === 0) {
            return '';
        }
        
        const headers = ['Title', 'Author', 'ISBN', 'Year', 'Genre', 'Type', 'Status'];
        const csvRows = [
            headers.join(','),
            ...booksToExport.map(book => [
                `"${book.title.replace(/"/g, '""')}"`,
                `"${book.author.replace(/"/g, '""')}"`,
                `"${book.isbn}"`,
                book.year,
                `"${book.genre || ''}"`,
                book.type,
                book.status
            ].join(','))
        ];
        
        return csvRows.join('\n');
    }
    
    // Download CSV
    downloadCSV(filename = 'books_export.csv') {
        const csv = this.exportToCSV();
        if (!csv) {
            showNotification('warning', 'Export Failed', 'No books to export');
            return;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('success', 'Export Complete', 'Books exported to CSV');
    }
    
    // Get book statistics
    getBookStatistics() {
        const stats = {
            total: this.library.books.length,
            byType: {},
            byGenre: {},
            byStatus: {
                available: 0,
                borrowed: 0,
                overdue: 0
            },
            byYear: {}
        };
        
        this.library.books.forEach(book => {
            // Count by type
            stats.byType[book.type] = (stats.byType[book.type] || 0) + 1;
            
            // Count by genre
            const genre = book.genre || 'Unknown';
            stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1;
            
            // Count by status
            stats.byStatus[book.status] = (stats.byStatus[book.status] || 0) + 1;
            
            // Count by year (group by decade)
            const decade = Math.floor(book.year / 10) * 10;
            stats.byYear[decade] = (stats.byYear[decade] || 0) + 1;
        });
        
        // Find most popular genre
        stats.mostPopularGenre = Object.entries(stats.byGenre)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
        
        return stats;
    }
    
    // Get books due soon
    getBooksDueSoon(days = 2) {
        return this.library.getBooksDueSoon();
    }
    
    // Get overdue books
    getOverdueBooks() {
        return this.library.getOverdueBooks();
    }
    
    // Send overdue reminders
    async sendOverdueReminders() {
        try {
            showLoading('Sending reminders...');
            
            const result = this.library.sendReminders('overdue');
            
            showNotification(
                'success',
                'Reminders Sent',
                result.message
            );
            
            return result;
            
        } catch (error) {
            showNotification('error', 'Reminders Failed', error.message);
            return {
                success: false,
                message: error.message
            };
        } finally {
            hideLoading();
        }
    }
    
    // Validate book data
    validateBookData(bookData) {
        return Book.validateBookData(bookData);
    }
    
    // Get book by ISBN
    getBookByIsbn(isbn) {
        return this.library.findBookByIsbn(isbn);
    }
    
    // Get all books
    getAllBooks() {
        return this.library.books;
    }
    
    // Get current filtered books
    getCurrentBooks() {
        return this.currentBooks;
    }
    
    // Refresh books list
    refreshBooks() {
        this.currentBooks = this.library.books;
        return this.currentBooks;
    }
}

// Create and export singleton instance
let bookManagerInstance = null;

export function getBookManager(library) {
    if (!bookManagerInstance && library) {
        bookManagerInstance = new BookManager(library);
    }
    return bookManagerInstance;
}

export function resetBookManager() {
    bookManagerInstance = null;
}