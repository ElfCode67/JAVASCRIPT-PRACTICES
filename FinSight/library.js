// Base Book class using ES6 class syntax
class Book {
    // Static property to track total books created
    static totalBooks = 0;
    
    // Constructor with parameters
    constructor(title, author, isbn, year) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.year = year;
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
        
        // Increment static counter
        Book.totalBooks++;
    }
    
    // Getter for book status
    get status() {
        return this.available ? 'Available' : 'Borrowed';
    }
    
    // Setter for ISBN with validation
    set isbn(value) {
        if (value.length < 10) {
            console.error('ISBN must be at least 10 characters long');
            return;
        }
        this._isbn = value;
    }
    
    // Getter for ISBN
    get isbn() {
        return this._isbn;
    }
    
    // Method to borrow book
    borrow(memberId) {
        if (!this.available) {
            return false;
        }
        this.available = false;
        this.borrowedBy = memberId;
        this.borrowDate = new Date().toISOString().split('T')[0];
        return true;
    }
    
    // Method to return book
    returnBook() {
        this.available = true;
        this.borrowedBy = null;
        this.borrowDate = null;
    }
    
    // Static method to compare two books by year
    static compareByYear(book1, book2) {
        return book1.year - book2.year;
    }
    
    // Method to get book info
    getInfo() {
        return `${this.title} by ${this.author} (${this.year}) - ${this.status}`;
    }
}

// EBook class extending Book (Inheritance)
class EBook extends Book {
    constructor(title, author, isbn, year, format, fileSize) {
        // Call parent constructor using super()
        super(title, author, isbn, year);
        this.format = format;
        this.fileSize = fileSize; // in MB
        this.type = 'ebook';
    }
    
    // Override getInfo method
    getInfo() {
        return `${super.getInfo()} - Format: ${this.format} (${this.fileSize}MB)`;
    }
    
    // Method specific to EBook
    getFileInfo() {
        return `${this.format} file, ${this.fileSize}MB`;
    }
}

// AudioBook class extending Book (Inheritance)
class AudioBook extends Book {
    constructor(title, author, isbn, year, narrator, duration) {
        // Call parent constructor using super()
        super(title, author, isbn, year);
        this.narrator = narrator;
        this.duration = duration; // in minutes
        this.type = 'audiobook';
    }
    
    // Override getInfo method
    getInfo() {
        return `${super.getInfo()} - Narrated by ${this.narrator} (${this.duration} min)`;
    }
    
    // Method specific to AudioBook
    getDurationInfo() {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        return `${hours}h ${minutes}m`;
    }
}

// Member class for library members
class Member {
    // Static counter for members
    static memberCount = 0;
    
    constructor(name, email) {
        this.id = `M${String(++Member.memberCount).padStart(3, '0')}`;
        this.name = name;
        this.email = email;
        this.borrowedBooks = [];
        this.joinDate = new Date().toISOString().split('T')[0];
    }
    
    // Getter for member info
    get info() {
        return `${this.name} (${this.email})`;
    }
    
    // Setter for email with validation
    set email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            console.error('Invalid email format');
            return;
        }
        this._email = value;
    }
    
    // Getter for email
    get email() {
        return this._email;
    }
    
    // Method to borrow a book
    borrowBook(book) {
        if (book.borrow(this.id)) {
            this.borrowedBooks.push(book.isbn);
            return true;
        }
        return false;
    }
    
    // Method to return a book
    returnBook(book) {
        const index = this.borrowedBooks.indexOf(book.isbn);
        if (index > -1) {
            this.borrowedBooks.splice(index, 1);
            book.returnBook();
            return true;
        }
        return false;
    }
    
    // Method to get member details
    getDetails() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            borrowedBooks: this.borrowedBooks.length,
            joinDate: this.joinDate
        };
    }
}

// Library class to manage books and members
class Library {
    // Static method to get library statistics
    static getStatistics(books, members) {
        const totalBooks = books.length;
        const availableBooks = books.filter(book => book.available).length;
        const borrowedBooks = totalBooks - availableBooks;
        const totalMembers = members.length;
        
        // Count books by type using destructuring
        const bookTypes = books.reduce((acc, book) => {
            const type = book.type || 'regular';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        
        return {
            totalBooks,
            availableBooks,
            borrowedBooks,
            totalMembers,
            bookTypes
        };
    }
    
    constructor(name) {
        this.name = name;
        this.books = [];
        this.members = [];
        this.loadFromStorage();
        
        // Update static counters based on loaded data
        if (this.books.length > 0) {
            Book.totalBooks = this.books.length;
        }
        if (this.members.length > 0) {
            Member.memberCount = this.members.length;
        }
    }
    
    // Method to add a book
    addBook(book) {
        this.books.push(book);
        this.saveToStorage();
        return book;
    }
    
    // Method to add a member
    addMember(member) {
        this.members.push(member);
        this.saveToStorage();
        return member;
    }
    
    // Method to find a book by ISBN
    findBookByIsbn(isbn) {
        return this.books.find(book => book.isbn === isbn);
    }
    
    // Method to find a member by ID
    findMemberById(id) {
        return this.members.find(member => member.id === id);
    }
    
    // Method to borrow a book using destructuring
    borrowBook(isbn, memberId) {
        const book = this.findBookByIsbn(isbn);
        const member = this.findMemberById(memberId);
        
        if (!book || !member) {
            return { success: false, message: 'Book or member not found' };
        }
        
        if (member.borrowBook(book)) {
            this.saveToStorage();
            return { success: true, message: 'Book borrowed successfully' };
        }
        
        return { success: false, message: 'Book is already borrowed' };
    }
    
    // Method to return a book
    returnBook(isbn) {
        const book = this.findBookByIsbn(isbn);
        
        if (!book || book.available) {
            return { success: false, message: 'Book not found or already available' };
        }
        
        const member = this.findMemberById(book.borrowedBy);
        if (member) {
            member.returnBook(book);
        } else {
            book.returnBook();
        }
        
        this.saveToStorage();
        return { success: true, message: 'Book returned successfully' };
    }
    
    // Method to search books with filtering
    searchBooks(query, filterType = 'all') {
        return this.books.filter(book => {
            // Check if book matches search query
            const matchesSearch = !query || 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.isbn.toLowerCase().includes(query.toLowerCase());
            
            // Check if book matches filter type
            let matchesFilter = true;
            if (filterType === 'regular') {
                matchesFilter = !book.type || book.type === 'regular';
            } else if (filterType === 'ebook') {
                matchesFilter = book.type === 'ebook';
            } else if (filterType === 'audiobook') {
                matchesFilter = book.type === 'audiobook';
            } else if (filterType === 'available') {
                matchesFilter = book.available;
            } else if (filterType === 'borrowed') {
                matchesFilter = !book.available;
            }
            
            return matchesSearch && matchesFilter;
        });
    }
    
    // Method to get borrowed books
    getBorrowedBooks() {
        return this.books.filter(book => !book.available);
    }
    
    // Method to save data to localStorage
    saveToStorage() {
        const libraryData = {
            books: this.books.map(book => {
                // Create a simplified version of each book for storage
                const bookData = {
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    year: book.year,
                    available: book.available,
                    borrowedBy: book.borrowedBy,
                    borrowDate: book.borrowDate,
                    type: book.type || 'regular'
                };
                
                // Add type-specific properties
                if (book.type === 'ebook') {
                    bookData.format = book.format;
                    bookData.fileSize = book.fileSize;
                } else if (book.type === 'audiobook') {
                    bookData.narrator = book.narrator;
                    bookData.duration = book.duration;
                }
                
                return bookData;
            }),
            members: this.members.map(member => ({
                id: member.id,
                name: member.name,
                email: member.email,
                borrowedBooks: member.borrowedBooks,
                joinDate: member.joinDate
            }))
        };
        
        localStorage.setItem('libraryData', JSON.stringify(libraryData));
    }
    
    // Method to load data from localStorage
    loadFromStorage() {
        const data = localStorage.getItem('libraryData');
        if (!data) {
            this.books = [];
            this.members = [];
            return;
        }
        
        const libraryData = JSON.parse(data);
        
        // Recreate books from stored data
        this.books = libraryData.books.map(bookData => {
            let book;
            
            // Use destructuring to extract common properties
            const { title, author, isbn, year, available, borrowedBy, borrowDate, type } = bookData;
            
            // Create the appropriate book type
            if (type === 'ebook') {
                const { format, fileSize } = bookData;
                book = new EBook(title, author, isbn, year, format, fileSize);
            } else if (type === 'audiobook') {
                const { narrator, duration } = bookData;
                book = new AudioBook(title, author, isbn, year, narrator, duration);
            } else {
                book = new Book(title, author, isbn, year);
            }
            
            // Set additional properties
            book.available = available;
            book.borrowedBy = borrowedBy;
            book.borrowDate = borrowDate;
            
            return book;
        });
        
        // Recreate members from stored data
        this.members = libraryData.members.map(memberData => {
            // Using destructuring to extract properties
            const { name, email, id, borrowedBooks, joinDate } = memberData;
            
            const member = new Member(name, email);
            member.id = id;
            member.borrowedBooks = borrowedBooks;
            member.joinDate = joinDate;
            
            return member;
        });
    }
    
    // Method to clear all data
    clearData() {
        this.books = [];
        this.members = [];
        Book.totalBooks = 0;
        Member.memberCount = 0;
        localStorage.removeItem('libraryData');
    }
}