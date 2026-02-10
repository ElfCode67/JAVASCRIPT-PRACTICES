// Base Book Class
export class Book {
    constructor(title, author, isbn, year) {
        this.id = Book.generateId();
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.year = year;
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
        this.dueDate = null;
        this.type = 'regular';
        this.createdAt = new Date().toISOString();
    }
    
    static generateId() {
        return 'book_' + Math.random().toString(36).substr(2, 9);
    }
    
    borrow(memberId) {
        if (!this.available) return false;
        this.available = false;
        this.borrowedBy = memberId;
        this.borrowDate = new Date().toISOString();
        
        // Set due date to 14 days from now
        const due = new Date();
        due.setDate(due.getDate() + 14);
        this.dueDate = due.toISOString();
        
        return true;
    }
    
    returnBook() {
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
        this.dueDate = null;
    }
    
    isOverdue() {
        if (this.available) return false;
        return new Date() > new Date(this.dueDate);
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            isbn: this.isbn,
            year: this.year,
            available: this.available,
            borrowedBy: this.borrowedBy,
            borrowDate: this.borrowDate,
            dueDate: this.dueDate,
            type: this.type,
            createdAt: this.createdAt
        };
    }
    
    static fromJSON(data) {
        const book = new Book(data.title, data.author, data.isbn, data.year);
        Object.assign(book, data);
        return book;
    }
}

// Member Class
export class Member {
    constructor(name, email) {
        this.id = Member.generateId();
        this.name = name;
        this.email = email;
        this.borrowedBooks = [];
        this.joinDate = new Date().toISOString().split('T')[0];
        this.fines = 0;
    }
    
    static generateId() {
        return 'mem_' + Math.random().toString(36).substr(2, 9);
    }
    
    canBorrow() {
        return this.borrowedBooks.length < 5 && this.fines === 0;
    }
    
    borrowBook(bookId) {
        if (!this.canBorrow()) return false;
        this.borrowedBooks.push(bookId);
        return true;
    }
    
    returnBook(bookId) {
        const index = this.borrowedBooks.indexOf(bookId);
        if (index > -1) {
            this.borrowedBooks.splice(index, 1);
            return true;
        }
        return false;
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            borrowedBooks: this.borrowedBooks,
            joinDate: this.joinDate,
            fines: this.fines
        };
    }
    
    static fromJSON(data) {
        const member = new Member(data.name, data.email);
        Object.assign(member, data);
        return member;
    }
}

// Library Class
export class Library {
    constructor() {
        this.books = [];
        this.members = [];
        this.loadFromStorage();
    }
    
    // Book Methods
    addBook(book) {
        this.books.push(book);
        this.saveToStorage();
        return book;
    }
    
    removeBook(bookId) {
        const index = this.books.findIndex(b => b.id === bookId);
        if (index > -1) {
            this.books.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    findBookByIsbn(isbn) {
        return this.books.find(book => book.isbn === isbn);
    }
    
    // Member Methods
    addMember(member) {
        this.members.push(member);
        this.saveToStorage();
        return member;
    }
    
    findMemberById(id) {
        return this.members.find(m => m.id === id);
    }
    
    // Borrowing Methods
    borrowBook(isbn, memberId) {
        const book = this.findBookByIsbn(isbn);
        const member = this.findMemberById(memberId);
        
        if (!book || !member) return false;
        if (!book.available) return false;
        if (!member.canBorrow()) return false;
        
        if (book.borrow(memberId) && member.borrowBook(book.id)) {
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    returnBook(isbn) {
        const book = this.findBookByIsbn(isbn);
        if (!book || book.available) return false;
        
        const member = this.findMemberById(book.borrowedBy);
        if (member) {
            member.returnBook(book.id);
        }
        
        book.returnBook();
        this.saveToStorage();
        return true;
    }
    
    // Statistics
    getStats() {
        const totalBooks = this.books.length;
        const availableBooks = this.books.filter(b => b.available).length;
        const borrowedBooks = totalBooks - availableBooks;
        const overdueBooks = this.books.filter(b => !b.available && b.isOverdue()).length;
        
        // Genre distribution
        const genres = {};
        this.books.forEach(book => {
            const genre = book.genre || 'Unknown';
            genres[genre] = (genres[genre] || 0) + 1;
        });
        
        const mostPopularGenre = Object.entries(genres)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
        
        return {
            totalBooks,
            availableBooks,
            borrowedBooks,
            overdueBooks,
            totalMembers: this.members.length,
            mostPopularGenre
        };
    }
    
    // Search
    searchBooks(query, filters = {}) {
        return this.books.filter(book => {
            const matchesSearch = !query || 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.isbn.includes(query);
            
            const matchesType = !filters.type || filters.type === 'all' || book.type === filters.type;
            const matchesStatus = !filters.status || filters.status === 'all' || 
                (filters.status === 'available' ? book.available : !book.available);
            
            return matchesSearch && matchesType && matchesStatus;
        });
    }
    
    // Storage
    saveToStorage() {
        const data = {
            books: this.books.map(b => b.toJSON()),
            members: this.members.map(m => m.toJSON()),
            version: '1.0.0',
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('libraryData', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const data = localStorage.getItem('libraryData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.books = parsed.books.map(b => Book.fromJSON(b));
                this.members = parsed.members.map(m => Member.fromJSON(m));
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }
    }
    
    clearData() {
        this.books = [];
        this.members = [];
        localStorage.removeItem('libraryData');
    }
    
    // Export/Import
    exportData() {
        return {
            books: this.books,
            members: this.members,
            stats: this.getStats(),
            exportDate: new Date().toISOString()
        };
    }
    
    exportToCSV() {
        const booksCSV = this.convertToCSV(this.books, ['title', 'author', 'isbn', 'year', 'type', 'available']);
        const membersCSV = this.convertToCSV(this.members, ['name', 'email', 'joinDate', 'fines']);
        return { booksCSV, membersCSV };
    }
    
    convertToCSV(items, fields) {
        const headers = fields.join(',');
        const rows = items.map(item => 
            fields.map(field => `"${item[field] || ''}"`).join(',')
        );
        return [headers, ...rows].join('\n');
    }
}