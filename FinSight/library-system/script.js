// --- CLASSES ---

class Book {
    constructor(title, author) {
        this._title = title; // Using underscore for private-like convention
        this._author = author;
        this.id = Date.now();
    }

    // Getter
    get details() {
        return `${this._title} by ${this._author}`;
    }

    // Static Method: Belongs to Class, not instance
    static formatStats(count) {
        return `Total Books in Catalog: ${count}`;
    }
}

// Inheritance: EBook inherits from Book
class EBook extends Book {
    constructor(title, author, fileSize) {
        super(title, author); // Calls parent constructor
        this.fileSize = fileSize;
    }
}

class AudioBook extends Book {
    constructor(title, author, duration) {
        super(title, author);
        this.duration = duration;
    }
}

// Library Management Class
class Library {
    constructor() {
        // Persistence: Get from localStorage or start empty
        const savedBooks = JSON.parse(localStorage.getItem('libraryBooks')) || [];
        this.books = savedBooks;
    }

    addBook(book) {
        this.books.push(book);
        this.save();
    }

    save() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.books));
    }

    // Array Filtering
    search(query) {
        return this.books.filter(book => 
            book._title.toLowerCase().includes(query.toLowerCase()) || 
            book._author.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// --- APP LOGIC ---

const myLibrary = new Library();
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const statsDisplay = document.getElementById('totalBooks');

function displayBooks(booksToRender = myLibrary.books) {
    bookList.innerHTML = '';
    
    // Destructuring in a loop
    booksToRender.forEach(({ _title, _author, fileSize, duration, id }) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        let extraInfo = fileSize ? `Size: ${fileSize}MB` : (duration ? `Length: ${duration}min` : 'Hardcover');
        
        card.innerHTML = `
            <h4>${_title}</h4>
            <p>Author: ${_author}</p>
            <small>${extraInfo}</small>
        `;
        bookList.appendChild(card);
    });

    // Use Static Method
    statsDisplay.innerText = Book.formatStats(myLibrary.books.length);
}

// Handle Form Submission
bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const type = document.getElementById('type').value;
    const extraValue = document.getElementById('extraValue').value;

    let newBook;
    if (type === 'EBook') newBook = new EBook(title, author, extraValue);
    else if (type === 'AudioBook') newBook = new AudioBook(title, author, extraValue);
    else newBook = new Book(title, author);

    myLibrary.addBook(newBook);
    displayBooks();
    bookForm.reset();
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const filtered = myLibrary.search(e.target.value);
    displayBooks(filtered);
});

// Initial Load
displayBooks();