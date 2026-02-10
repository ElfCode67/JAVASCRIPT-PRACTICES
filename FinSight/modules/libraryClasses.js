// Base Book class using ES6 class syntax
class Book {
    // Static property to track total books created
    static totalBooks = 0;
    static bookTypes = ['regular', 'ebook', 'audiobook'];
    
    // Constructor with validation
    constructor(title, author, isbn, year = new Date().getFullYear()) {
        if (!title || !author || !isbn) {
            throw new Error('Title, author, and ISBN are required');
        }
        
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.year = year;
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
        this.dueDate = null;
        this.id = `B${String(++Book.totalBooks).padStart(6, '0')}`;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.tags = [];
        this.genre = '';
        this.type = 'regular';
        this.coverUrl = '';
        
        // Validate ISBN
        this.validateISBN(isbn);
    }
    
    // ISBN validation
    validateISBN(isbn) {
        // Remove hyphens
        const cleanISBN = isbn.replace(/-/g, '');
        
        // Check length
        if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
            throw new Error('ISBN must be 10 or 13 digits');
        }
        
        // Check if all characters are digits (except last which can be X for ISBN-10)
        const isbnPattern = /^(?:\d{9}[\dX]|\d{13})$/;
        if (!isbnPattern.test(cleanISBN)) {
            throw new Error('Invalid ISBN format');
        }
        
        this._isbn = cleanISBN;
    }
    
    // Getter for ISBN (with formatting)
    get isbn() {
        const isbn = this._isbn;
        if (isbn.length === 10) {
            return `${isbn.substring(0, 1)}-${isbn.substring(1, 4)}-${isbn.substring(4, 9)}-${isbn.substring(9)}`;
        } else {
            return `${isbn.substring(0, 3)}-${isbn.substring(3, 4)}-${isbn.substring(4, 6)}-${isbn.substring(6, 12)}-${isbn.substring(12)}`;
        }
    }
    
    // Setter for ISBN
    set isbn(value) {
        this.validateISBN(value);
        this.updatedAt = new Date().toISOString();
    }
    
    // Getter for status
    get status() {
        if (!this.available) {
            if (this.dueDate && new Date(this.dueDate) < new Date()) {
                return 'overdue';
            }
            return 'borrowed';
        }
        return 'available';
    }
    
    // Method to borrow book
    borrow(memberId, durationDays = 14) {
        if (!this.available) {
            return { success: false, message: 'Book is already borrowed' };
        }
        
        this.available = false;
        this.borrowedBy = memberId;
        this.borrowDate = new Date().toISOString();
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + durationDays);
        this.dueDate = dueDate.toISOString();
        
        this.updatedAt = new Date().toISOString();
        
        return { 
            success: true, 
            message: 'Book borrowed successfully',
            dueDate: this.dueDate 
        };
    }
    
    // Method to return book
    returnBook() {
        if (this.available) {
            return { success: false, message: 'Book is already available' };
        }
        
        const wasOverdue = this.status === 'overdue';
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
        this.dueDate = null;
        this.updatedAt = new Date().toISOString();
        
        return { 
            success: true, 
            message: 'Book returned successfully',
            wasOverdue 
        };
    }
    
    // Static method to compare two books by year
    static compareByYear(book1, book2) {
        return book1.year - book2.year;
    }
    
    // Static method to validate book data
    static validateBookData(data) {
        const errors = [];
        
        if (!data.title?.trim()) errors.push('Title is required');
        if (!data.author?.trim()) errors.push('Author is required');
        if (!data.isbn?.trim()) errors.push('ISBN is required');
        
        if (data.year) {
            const year = parseInt(data.year);
            if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
                errors.push('Invalid publication year');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Method to get book info
    getInfo() {
        return `${this.title} by ${this.author} (${this.year}) - ${this.status}`;
    }
    
    // Method to get book data for storage
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            isbn: this._isbn,
            year: this.year,
            available: this.available,
            borrowedBy: this.borrowedBy,
            borrowDate: this.borrowDate,
            dueDate: this.dueDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            tags: this.tags,
            genre: this.genre,
            type: this.type,
            coverUrl: this.coverUrl
        };
    }
    
    // Factory method to create book from data
    static fromJSON(data) {
        const book = new Book(data.title, data.author, data.isbn, data.year);
        book.id = data.id || book.id;
        book.available = data.available !== undefined ? data.available : true;
        book.borrowedBy = data.borrowedBy || null;
        book.borrowDate = data.borrowDate || null;
        book.dueDate = data.dueDate || null;
        book.createdAt = data.createdAt || book.createdAt;
        book.updatedAt = data.updatedAt || book.updatedAt;
        book.tags = data.tags || [];
        book.genre = data.genre || '';
        book.type = data.type || 'regular';
        book.coverUrl = data.coverUrl || '';
        return book;
    }
}

// EBook class extending Book (Inheritance)
class EBook extends Book {
    constructor(title, author, isbn, year, format = 'PDF', fileSize = 0) {
        super(title, author, isbn, year);
        this.format = format.toUpperCase();
        this.fileSize = fileSize; // in MB
        this.type = 'ebook';
        this.downloads = 0;
    }
    
    // Override getInfo method
    getInfo() {
        return `${super.getInfo()} - Format: ${this.format} (${this.fileSize}MB)`;
    }
    
    // Method specific to EBook
    getFileInfo() {
        return `${this.format} file, ${this.fileSize}MB`;
    }
    
    // Method to record download
    recordDownload() {
        this.downloads++;
        this.updatedAt = new Date().toISOString();
        return this.downloads;
    }
    
    // Override toJSON method
    toJSON() {
        const data = super.toJSON();
        return {
            ...data,
            format: this.format,
            fileSize: this.fileSize,
            downloads: this.downloads
        };
    }
    
    // Static factory method
    static fromJSON(data) {
        const ebook = new EBook(
            data.title,
            data.author,
            data.isbn,
            data.year,
            data.format,
            data.fileSize
        );
        ebook.id = data.id || ebook.id;
        ebook.available = data.available !== undefined ? data.available : true;
        ebook.downloads = data.downloads || 0;
        return ebook;
    }
}

// AudioBook class extending Book (Inheritance)
class AudioBook extends Book {
    constructor(title, author, isbn, year, narrator, duration) {
        super(title, author, isbn, year);
        this.narrator = narrator;
        this.duration = duration; // in minutes
        this.type = 'audiobook';
        this.listens = 0;
    }
    
    // Override getInfo method
    getInfo() {
        return `${super.getInfo()} - Narrated by ${this.narrator} (${this.getDurationInfo()})`;
    }
    
    // Method specific to AudioBook
    getDurationInfo() {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    
    // Method to record listen
    recordListen() {
        this.listens++;
        this.updatedAt = new Date().toISOString();
        return this.listens;
    }
    
    // Override toJSON method
    toJSON() {
        const data = super.toJSON();
        return {
            ...data,
            narrator: this.narrator,
            duration: this.duration,
            listens: this.listens
        };
    }
    
    // Static factory method
    static fromJSON(data) {
        const audiobook = new AudioBook(
            data.title,
            data.author,
            data.isbn,
            data.year,
            data.narrator,
            data.duration
        );
        audiobook.id = data.id || audiobook.id;
        audiobook.available = data.available !== undefined ? data.available : true;
        audiobook.listens = data.listens || 0;
        return audiobook;
    }
}

// Member class for library members
class Member {
    // Static counter for members
    static memberCount = 0;
    
    constructor(name, email) {
        if (!name || !email) {
            throw new Error('Name and email are required');
        }
        
        this.id = `M${String(++Member.memberCount).padStart(6, '0')}`;
        this.name = name;
        this.email = email;
        this.borrowedBooks = [];
        this.borrowingHistory = [];
        this.joinDate = new Date().toISOString().split('T')[0];
        this.phone = '';
        this.address = '';
        this.membershipStatus = 'active';
        this.maxBorrowLimit = 5;
        this.fines = 0;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        
        // Validate email
        this.validateEmail(email);
    }
    
    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        this._email = email;
    }
    
    // Getter for email
    get email() {
        return this._email;
    }
    
    // Setter for email with validation
    set email(value) {
        this.validateEmail(value);
        this.updatedAt = new Date().toISOString();
    }
    
    // Getter for member info
    get info() {
        return `${this.name} (${this.email})`;
    }
    
    // Check if member can borrow more books
    canBorrowMore() {
        return this.borrowedBooks.length < this.maxBorrowLimit && 
               this.membershipStatus === 'active' &&
               this.fines === 0;
    }
    
    // Method to borrow a book
    borrowBook(book, durationDays = 14) {
        if (!this.canBorrowMore()) {
            return { 
                success: false, 
                message: 'Cannot borrow more books. Check your borrowing limit, status, or fines.' 
            };
        }
        
        const borrowResult = book.borrow(this.id, durationDays);
        if (borrowResult.success) {
            this.borrowedBooks.push({
                isbn: book.isbn,
                bookId: book.id,
                borrowDate: book.borrowDate,
                dueDate: book.dueDate,
                bookTitle: book.title
            });
            
            this.borrowingHistory.push({
                isbn: book.isbn,
                bookId: book.id,
                borrowDate: book.borrowDate,
                dueDate: book.dueDate,
                returned: false,
                bookTitle: book.title
            });
            
            this.updatedAt = new Date().toISOString();
        }
        
        return borrowResult;
    }
    
    // Method to return a book
    returnBook(book) {
        const borrowedBookIndex = this.borrowedBooks.findIndex(b => b.isbn === book.isbn);
        
        if (borrowedBookIndex === -1) {
            return { success: false, message: 'Book not found in borrowed list' };
        }
        
        const returnResult = book.returnBook();
        if (returnResult.success) {
            // Update borrowed books list
            this.borrowedBooks.splice(borrowedBookIndex, 1);
            
            // Update borrowing history
            const historyIndex = this.borrowingHistory.findIndex(
                h => h.isbn === book.isbn && !h.returned
            );
            
            if (historyIndex !== -1) {
                this.borrowingHistory[historyIndex].returned = true;
                this.borrowingHistory[historyIndex].returnDate = new Date().toISOString();
                
                // Calculate fine if overdue
                if (returnResult.wasOverdue) {
                    const daysOverdue = this.calculateOverdueDays(
                        this.borrowingHistory[historyIndex].dueDate
                    );
                    this.fines += daysOverdue * 0.50; // $0.50 per day
                }
            }
            
            this.updatedAt = new Date().toISOString();
        }
        
        return returnResult;
    }
    
    // Calculate overdue days
    calculateOverdueDays(dueDate) {
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = now - due;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    
    // Pay fines
    payFine(amount) {
        if (amount <= 0) {
            return { success: false, message: 'Amount must be positive' };
        }
        
        if (amount > this.fines) {
            amount = this.fines;
        }
        
        this.fines -= amount;
        this.updatedAt = new Date().toISOString();
        
        return { 
            success: true, 
            message: `Paid $${amount.toFixed(2)} in fines`,
            remainingFines: this.fines 
        };
    }
    
    // Method to get member details
    getDetails() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            borrowedBooks: this.borrowedBooks.length,
            maxBorrowLimit: this.maxBorrowLimit,
            membershipStatus: this.membershipStatus,
            fines: this.fines,
            joinDate: this.joinDate,
            phone: this.phone,
            address: this.address
        };
    }
    
    // Static method to validate member data
    static validateMemberData(data) {
        const errors = [];
        
        if (!data.name?.trim()) errors.push('Name is required');
        if (!data.email?.trim()) errors.push('Email is required');
        
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email.trim())) {
                errors.push('Invalid email format');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this._email,
            borrowedBooks: this.borrowedBooks,
            borrowingHistory: this.borrowingHistory,
            joinDate: this.joinDate,
            phone: this.phone,
            address: this.address,
            membershipStatus: this.membershipStatus,
            maxBorrowLimit: this.maxBorrowLimit,
            fines: this.fines,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    
    // Factory method to create member from data
    static fromJSON(data) {
        const member = new Member(data.name, data.email);
        member.id = data.id || member.id;
        member.borrowedBooks = data.borrowedBooks || [];
        member.borrowingHistory = data.borrowingHistory || [];
        member.joinDate = data.joinDate || member.joinDate;
        member.phone = data.phone || '';
        member.address = data.address || '';
        member.membershipStatus = data.membershipStatus || 'active';
        member.maxBorrowLimit = data.maxBorrowLimit || 5;
        member.fines = data.fines || 0;
        member.createdAt = data.createdAt || member.createdAt;
        member.updatedAt = data.updatedAt || member.updatedAt;
        return member;
    }
}

// Library class to manage books and members
class Library {
    constructor(name = "Digital Library") {
        this.name = name;
        this.books = [];
        this.members = [];
        this.settings = {
            maxBorrowDays: 14,
            finePerDay: 0.50,
            maxBorrowLimit: 5,
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            theme: 'light',
            language: 'en'
        };
        this.stats = {
            totalBooks: 0,
            totalMembers: 0,
            booksBorrowed: 0,
            booksOverdue: 0,
            totalFines: 0,
            mostPopularGenre: '',
            busiestDay: ''
        };
        this.autoSaveTimer = null;
        
        // Initialize with saved data
        this.loadFromStorage();
        this.updateStats();
        
        // Start auto-save if enabled
        if (this.settings.autoSave) {
            this.startAutoSave();
        }
    }
    
    // Update library statistics
    updateStats() {
        const totalBooks = this.books.length;
        const availableBooks = this.books.filter(book => book.available).length;
        const borrowedBooks = totalBooks - availableBooks;
        const overdueBooks = this.books.filter(book => 
            !book.available && book.dueDate && new Date(book.dueDate) < new Date()
        ).length;
        
        // Calculate total fines
        const totalFines = this.members.reduce((sum, member) => sum + member.fines, 0);
        
        // Find most popular genre
        const genreCount = this.books.reduce((acc, book) => {
            const genre = book.genre || 'Unknown';
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});
        
        const mostPopularGenre = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
        
        this.stats = {
            totalBooks,
            availableBooks,
            borrowedBooks,
            overdueBooks,
            totalFines,
            mostPopularGenre,
            totalMembers: this.members.length,
            busiestDay: this.getBusiestDay()
        };
        
        return this.stats;
    }
    
    // Get busiest day of the week
    getBusiestDay() {
        const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=Sunday
        
        this.books.forEach(book => {
            if (book.borrowDate) {
                const day = new Date(book.borrowDate).getDay();
                dayCount[day]++;
            }
        });
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const busiestDayIndex = Object.entries(dayCount)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || '0';
        
        return days[parseInt(busiestDayIndex)];
    }
    
    // Method to add a book
    addBook(book) {
        // Check if ISBN already exists
        if (this.findBookByIsbn(book.isbn)) {
            throw new Error(`A book with ISBN ${book.isbn} already exists`);
        }
        
        this.books.push(book);
        this.updateStats();
        
        if (this.settings.autoSave) {
            this.saveToStorage();
        }
        
        return book;
    }
    
    // Method to add a member
    addMember(member) {
        // Check if email already exists
        if (this.members.some(m => m.email === member.email)) {
            throw new Error(`A member with email ${member.email} already exists`);
        }
        
        this.members.push(member);
        this.updateStats();
        
        if (this.settings.autoSave) {
            this.saveToStorage();
        }
        
        return member;
    }
    
    // Method to find a book by ISBN
    findBookByIsbn(isbn) {
        const cleanISBN = isbn.replace(/-/g, '');
        return this.books.find(book => book._isbn === cleanISBN);
    }
    
    // Method to find a book by ID
    findBookById(id) {
        return this.books.find(book => book.id === id);
    }
    
    // Method to find a member by ID
    findMemberById(id) {
        return this.members.find(member => member.id === id);
    }
    
    // Method to find a member by email
    findMemberByEmail(email) {
        return this.members.find(member => member.email === email);
    }
    
    // Method to borrow a book
    borrowBook(isbn, memberId) {
        const book = this.findBookByIsbn(isbn);
        const member = this.findMemberById(memberId);
        
        if (!book) {
            return { success: false, message: 'Book not found' };
        }
        
        if (!member) {
            return { success: false, message: 'Member not found' };
        }
        
        const result = member.borrowBook(book, this.settings.maxBorrowDays);
        
        if (result.success) {
            this.updateStats();
            
            if (this.settings.autoSave) {
                this.saveToStorage();
            }
        }
        
        return result;
    }
    
    // Method to return a book
    returnBook(isbn) {
        const book = this.findBookByIsbn(isbn);
        
        if (!book) {
            return { success: false, message: 'Book not found' };
        }
        
        if (book.available) {
            return { success: false, message: 'Book is already available' };
        }
        
        const member = this.findMemberById(book.borrowedBy);
        if (!member) {
            // If member not found, just return the book
            const result = book.returnBook();
            if (result.success) {
                this.updateStats();
                if (this.settings.autoSave) {
                    this.saveToStorage();
                }
            }
            return result;
        }
        
        const result = member.returnBook(book);
        
        if (result.success) {
            this.updateStats();
            
            if (this.settings.autoSave) {
                this.saveToStorage();
            }
        }
        
        return result;
    }
    
    // Method to search books with filtering
    searchBooks(query = '', filters = {}) {
        return this.books.filter(book => {
            // Check if book matches search query
            const matchesSearch = !query || 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book._isbn.includes(query) ||
                book.genre?.toLowerCase().includes(query.toLowerCase()) ||
                book.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
            
            // Apply filters
            let matchesFilters = true;
            
            if (filters.type && filters.type !== 'all') {
                matchesFilters = book.type === filters.type;
            }
            
            if (filters.status && filters.status !== 'all') {
                matchesFilters = matchesFilters && book.status === filters.status;
            }
            
            if (filters.genre && filters.genre !== 'all') {
                matchesFilters = matchesFilters && book.genre === filters.genre;
            }
            
            if (filters.yearFrom) {
                matchesFilters = matchesFilters && book.year >= filters.yearFrom;
            }
            
            if (filters.yearTo) {
                matchesFilters = matchesFilters && book.year <= filters.yearTo;
            }
            
            return matchesSearch && matchesFilters;
        });
    }
    
    // Method to search members
    searchMembers(query = '') {
        return this.members.filter(member => {
            return !query ||
                member.name.toLowerCase().includes(query.toLowerCase()) ||
                member.email.toLowerCase().includes(query.toLowerCase()) ||
                member.id.toLowerCase().includes(query.toLowerCase()) ||
                member.phone?.includes(query);
        });
    }
    
    // Method to get borrowed books
    getBorrowedBooks() {
        return this.books.filter(book => !book.available);
    }
    
    // Method to get overdue books
    getOverdueBooks() {
        return this.books.filter(book => 
            !book.available && book.dueDate && new Date(book.dueDate) < new Date()
        );
    }
    
    // Method to get books due soon (within 2 days)
    getBooksDueSoon() {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        
        return this.books.filter(book => 
            !book.available && 
            book.dueDate && 
            new Date(book.dueDate) <= twoDaysFromNow &&
            new Date(book.dueDate) > new Date()
        );
    }
    
    // Method to get member borrowing history
    getMemberBorrowingHistory(memberId) {
        const member = this.findMemberById(memberId);
        return member ? member.borrowingHistory : [];
    }
    
    // Method to get book borrowing history
    getBookBorrowingHistory(isbn) {
        const history = [];
        
        this.members.forEach(member => {
            member.borrowingHistory.forEach(record => {
                if (record.isbn === isbn) {
                    history.push({
                        memberId: member.id,
                        memberName: member.name,
                        ...record
                    });
                }
            });
        });
        
        return history.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
    }
    
    // Method to generate report
    generateReport(type = 'monthly') {
        const now = new Date();
        let startDate, endDate;
        
        switch (type) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'weekly':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            default:
                startDate = new Date(0);
                endDate = new Date();
        }
        
        const borrowedBooks = [];
        const returnedBooks = [];
        const newMembers = [];
        
        // Collect data
        this.members.forEach(member => {
            // New members
            if (new Date(member.createdAt) >= startDate && new Date(member.createdAt) < endDate) {
                newMembers.push(member);
            }
            
            // Borrowing history
            member.borrowingHistory.forEach(record => {
                const borrowDate = new Date(record.borrowDate);
                if (borrowDate >= startDate && borrowDate < endDate) {
                    borrowedBooks.push({
                        ...record,
                        memberName: member.name,
                        memberId: member.id
                    });
                }
                
                if (record.returnDate) {
                    const returnDate = new Date(record.returnDate);
                    if (returnDate >= startDate && returnDate < endDate) {
                        returnedBooks.push({
                            ...record,
                            memberName: member.name,
                            memberId: member.id
                        });
                    }
                }
            });
        });
        
        // Calculate statistics
        const totalBorrowed = borrowedBooks.length;
        const totalReturned = returnedBooks.length;
        const totalNewMembers = newMembers.length;
        const totalFinesCollected = returnedBooks
            .filter(record => record.wasOverdue)
            .reduce((sum, record) => {
                const daysOverdue = Math.ceil(
                    (new Date(record.returnDate) - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)
                );
                return sum + (daysOverdue * this.settings.finePerDay);
            }, 0);
        
        return {
            period: type,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalBorrowed,
            totalReturned,
            totalNewMembers,
            totalFinesCollected,
            borrowedBooks,
            returnedBooks,
            newMembers,
            currentStats: this.stats
        };
    }
    
    // Method to export data
    exportData(format = 'json') {
        const data = {
            library: {
                name: this.name,
                settings: this.settings,
                stats: this.stats,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            },
            books: this.books.map(book => book.toJSON()),
            members: this.members.map(member => member.toJSON())
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            // Convert to CSV format
            const booksCSV = this.convertToCSV(data.books, 'books');
            const membersCSV = this.convertToCSV(data.members, 'members');
            return { booksCSV, membersCSV };
        }
        
        return data;
    }
    
    // Helper method to convert data to CSV
    convertToCSV(data, type) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'object') {
                        return JSON.stringify(value).replace(/"/g, '""');
                    }
                    return `"${String(value || '').replace(/"/g, '""')}"`;
                }).join(',')
            )
        ];
        
        return csvRows.join('\n');
    }
    
    // Method to import data
    importData(data) {
        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Validate data structure
            if (!parsedData.books || !parsedData.members) {
                throw new Error('Invalid data format. Expected books and members arrays.');
            }
            
            // Clear current data
            this.books = [];
            this.members = [];
            Book.totalBooks = 0;
            Member.memberCount = 0;
            
            // Import books
            parsedData.books.forEach(bookData => {
                let book;
                
                switch (bookData.type) {
                    case 'ebook':
                        book = EBook.fromJSON(bookData);
                        break;
                    case 'audiobook':
                        book = AudioBook.fromJSON(bookData);
                        break;
                    default:
                        book = Book.fromJSON(bookData);
                }
                
                this.books.push(book);
            });
            
            // Import members
            parsedData.members.forEach(memberData => {
                const member = Member.fromJSON(memberData);
                this.members.push(member);
            });
            
            // Import settings if available
            if (parsedData.library?.settings) {
                this.settings = { ...this.settings, ...parsedData.library.settings };
            }
            
            this.updateStats();
            this.saveToStorage();
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: `Import failed: ${error.message}` };
        }
    }
    
    // Method to save data to storage
    saveToStorage() {
        try {
            const libraryData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                books: this.books.map(book => book.toJSON()),
                members: this.members.map(member => member.toJSON()),
                settings: this.settings,
                stats: this.stats,
                counters: {
                    bookCount: Book.totalBooks,
                    memberCount: Member.memberCount
                }
            };
            
            localStorage.setItem('libraryData', JSON.stringify(libraryData));
            localStorage.setItem('libraryLastSaved', new Date().toISOString());
            
            return { success: true, message: 'Data saved successfully' };
        } catch (error) {
            console.error('Failed to save data:', error);
            return { success: false, message: 'Failed to save data' };
        }
    }
    
    // Method to load data from storage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('libraryData');
            if (!data) {
                console.log('No saved data found. Starting with empty library.');
                return { success: true, message: 'No saved data found' };
            }
            
            const libraryData = JSON.parse(data);
            
            // Validate version
            if (!libraryData.version) {
                console.warn('No version found in saved data. Attempting to load anyway.');
            }
            
            // Load counters
            if (libraryData.counters) {
                Book.totalBooks = libraryData.counters.bookCount || 0;
                Member.memberCount = libraryData.counters.memberCount || 0;
            }
            
            // Load books
            this.books = libraryData.books.map(bookData => {
                switch (bookData.type) {
                    case 'ebook':
                        return EBook.fromJSON(bookData);
                    case 'audiobook':
                        return AudioBook.fromJSON(bookData);
                    default:
                        return Book.fromJSON(bookData);
                }
            });
            
            // Load members
            this.members = libraryData.members.map(memberData => 
                Member.fromJSON(memberData)
            );
            
            // Load settings
            if (libraryData.settings) {
                this.settings = { ...this.settings, ...libraryData.settings };
            }
            
            // Load stats
            if (libraryData.stats) {
                this.stats = { ...this.stats, ...libraryData.stats };
            }
            
            console.log('Data loaded successfully:', {
                books: this.books.length,
                members: this.members.length
            });
            
            return { success: true, message: 'Data loaded successfully' };
        } catch (error) {
            console.error('Failed to load data:', error);
            return { 
                success: false, 
                message: `Failed to load data: ${error.message}` 
            };
        }
    }
    
    // Method to clear all data
    clearData() {
        this.books = [];
        this.members = [];
        Book.totalBooks = 0;
        Member.memberCount = 0;
        this.stats = {
            totalBooks: 0,
            totalMembers: 0,
            booksBorrowed: 0,
            booksOverdue: 0,
            totalFines: 0,
            mostPopularGenre: '',
            busiestDay: ''
        };
        
        localStorage.removeItem('libraryData');
        localStorage.removeItem('libraryLastSaved');
        
        return { success: true, message: 'All data cleared' };
    }
    
    // Start auto-save timer
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.settings.autoSave) {
                this.saveToStorage();
                console.log('Auto-saved at', new Date().toLocaleTimeString());
            }
        }, this.settings.autoSaveInterval);
    }
    
    // Stop auto-save timer
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (this.settings.autoSave) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        
        this.saveToStorage();
        return { success: true, message: 'Settings updated' };
    }
    
    // Get overdue notifications
    getOverdueNotifications() {
        const overdueBooks = this.getOverdueBooks();
        const dueSoonBooks = this.getBooksDueSoon();
        
        const notifications = [];
        
        // Overdue books
        overdueBooks.forEach(book => {
            const member = this.findMemberById(book.borrowedBy);
            if (member) {
                const daysOverdue = Math.ceil(
                    (new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24)
                );
                
                notifications.push({
                    type: 'overdue',
                    severity: 'high',
                    title: 'Book Overdue',
                    message: `${book.title} is ${daysOverdue} day(s) overdue. Borrowed by ${member.name}.`,
                    book,
                    member,
                    daysOverdue
                });
            }
        });
        
        // Books due soon
        dueSoonBooks.forEach(book => {
            const member = this.findMemberById(book.borrowedBy);
            if (member) {
                const daysUntilDue = Math.ceil(
                    (new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                
                notifications.push({
                    type: 'due-soon',
                    severity: 'medium',
                    title: 'Book Due Soon',
                    message: `${book.title} is due in ${daysUntilDue} day(s). Borrowed by ${member.name}.`,
                    book,
                    member,
                    daysUntilDue
                });
            }
        });
        
        return notifications;
    }
    
    // Send reminder emails (simulated)
    sendReminders(type = 'overdue') {
        const notifications = this.getOverdueNotifications();
        const relevantNotifications = notifications.filter(n => n.type === type);
        
        if (relevantNotifications.length === 0) {
            return { 
                success: false, 
                message: `No ${type} books found` 
            };
        }
        
        // In a real application, this would send actual emails
        // For now, we'll just log them
        relevantNotifications.forEach(notification => {
            console.log(`Reminder sent to ${notification.member.email}: ${notification.message}`);
        });
        
        return { 
            success: true, 
            message: `${relevantNotifications.length} reminder(s) sent`,
            count: relevantNotifications.length 
        };
    }
    
    // Backup data to IndexedDB (fallback storage)
    async backupToIndexedDB() {
        if (!window.indexedDB) {
            return { success: false, message: 'IndexedDB not supported' };
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LibraryBackup', 1);
            
            request.onerror = () => {
                reject({ success: false, message: 'Failed to open IndexedDB' });
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('backups')) {
                    db.createObjectStore('backups', { keyPath: 'timestamp' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                
                const backupData = {
                    timestamp: new Date().toISOString(),
                    data: this.exportData('json'),
                    stats: this.stats
                };
                
                const addRequest = store.add(backupData);
                
                addRequest.onsuccess = () => {
                    resolve({ 
                        success: true, 
                        message: 'Backup created successfully',
                        timestamp: backupData.timestamp 
                    });
                };
                
                addRequest.onerror = () => {
                    reject({ success: false, message: 'Failed to save backup' });
                };
            };
        });
    }
    
    // Restore from IndexedDB backup
    async restoreFromIndexedDB(timestamp) {
        if (!window.indexedDB) {
            return { success: false, message: 'IndexedDB not supported' };
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LibraryBackup', 1);
            
            request.onerror = () => {
                reject({ success: false, message: 'Failed to open IndexedDB' });
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['backups'], 'readonly');
                const store = transaction.objectStore('backups');
                
                const getRequest = timestamp 
                    ? store.get(timestamp)
                    : store.openCursor(null, 'prev');
                
                getRequest.onsuccess = () => {
                    let backup;
                    
                    if (timestamp) {
                        backup = getRequest.result;
                    } else {
                        const cursor = getRequest.result;
                        backup = cursor ? cursor.value : null;
                    }
                    
                    if (!backup) {
                        reject({ success: false, message: 'No backup found' });
                        return;
                    }
                    
                    try {
                        const result = this.importData(backup.data);
                        if (result.success) {
                            resolve({ 
                                success: true, 
                                message: 'Backup restored successfully',
                                timestamp: backup.timestamp 
                            });
                        } else {
                            reject(result);
                        }
                    } catch (error) {
                        reject({ 
                            success: false, 
                            message: `Restore failed: ${error.message}` 
                        });
                    }
                };
                
                getRequest.onerror = () => {
                    reject({ success: false, message: 'Failed to retrieve backup' });
                };
            };
        });
    }
    
    // Get list of available backups
    async getBackupList() {
        if (!window.indexedDB) {
            return { success: false, message: 'IndexedDB not supported', backups: [] };
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LibraryBackup', 1);
            
            request.onerror = () => {
                reject({ success: false, message: 'Failed to open IndexedDB' });
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('backups')) {
                    resolve({ success: true, message: 'No backups found', backups: [] });
                    return;
                }
                
                const transaction = db.transaction(['backups'], 'readonly');
                const store = transaction.objectStore('backups');
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = () => {
                    const backups = getAllRequest.result
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    
                    resolve({ 
                        success: true, 
                        message: `${backups.length} backup(s) found`,
                        backups 
                    });
                };
                
                getAllRequest.onerror = () => {
                    reject({ success: false, message: 'Failed to retrieve backups' });
                };
            };
        });
    }
}

// Export classes
export { Book, EBook, AudioBook, Member, Library };