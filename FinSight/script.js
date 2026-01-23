// Initialize the library
const library = new Library("My Digital Library");

// DOM Elements
const totalBooksEl = document.getElementById('total-books');
const availableBooksEl = document.getElementById('available-books');
const totalMembersEl = document.getElementById('total-members');
const borrowedBooksEl = document.getElementById('borrowed-books');

const bookTypeSelect = document.getElementById('book-type');
const bookTitleInput = document.getElementById('book-title');
const bookAuthorInput = document.getElementById('book-author');
const bookIsbnInput = document.getElementById('book-isbn');
const bookYearInput = document.getElementById('book-year');
const ebookFields = document.getElementById('ebook-fields');
const ebookFormatInput = document.getElementById('ebook-format');
const ebookSizeInput = document.getElementById('ebook-size');
const audiobookFields = document.getElementById('audiobook-fields');
const audiobookNarratorInput = document.getElementById('audiobook-narrator');
const audiobookDurationInput = document.getElementById('audiobook-duration');
const addBookBtn = document.getElementById('add-book-btn');

const memberNameInput = document.getElementById('member-name');
const memberEmailInput = document.getElementById('member-email');
const addMemberBtn = document.getElementById('add-member-btn');

const searchInput = document.getElementById('search-input');
const filterTypeSelect = document.getElementById('filter-type');

const borrowBookSelect = document.getElementById('borrow-book-select');
const borrowMemberSelect = document.getElementById('borrow-member-select');
const borrowBtn = document.getElementById('borrow-btn');
const returnBtn = document.getElementById('return-btn');

const saveDataBtn = document.getElementById('save-data-btn');
const loadDataBtn = document.getElementById('load-data-btn');
const clearDataBtn = document.getElementById('clear-data-btn');

const booksContainer = document.getElementById('books-container');
const membersContainer = document.getElementById('members-container');
const borrowedContainer = document.getElementById('borrowed-container');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the application
function init() {
    updateStats();
    renderBooks();
    renderMembers();
    renderBorrowedBooks();
    updateBookSelect();
    updateMemberSelect();
    
    // Add some sample data if library is empty
    if (library.books.length === 0) {
        addSampleData();
    }
}

// Add sample data for demonstration
function addSampleData() {
    // Add sample books
    const book1 = new Book("The Great Gatsby", "F. Scott Fitzgerald", "9780743273565", 1925);
    const book2 = new EBook("Clean Code", "Robert C. Martin", "9780132350884", 2008, "PDF", 5);
    const book3 = new AudioBook("The Hobbit", "J.R.R. Tolkien", "9780547928227", 1937, "Rob Inglis", 682);
    const book4 = new Book("1984", "George Orwell", "9780451524935", 1949);
    const book5 = new EBook("JavaScript: The Good Parts", "Douglas Crockford", "9780596517748", 2008, "EPUB", 3);
    
    library.addBook(book1);
    library.addBook(book2);
    library.addBook(book3);
    library.addBook(book4);
    library.addBook(book5);
    
    // Add sample members
    const member1 = new Member("John Doe", "john@example.com");
    const member2 = new Member("Jane Smith", "jane@example.com");
    
    library.addMember(member1);
    library.addMember(member2);
    
    // Borrow a book for demonstration
    library.borrowBook("9780743273565", "M001");
    
    updateStats();
    renderBooks();
    renderMembers();
    renderBorrowedBooks();
    updateBookSelect();
    updateMemberSelect();
}

// Update statistics display
function updateStats() {
    const stats = Library.getStatistics(library.books, library.members);
    
    totalBooksEl.textContent = stats.totalBooks;
    availableBooksEl.textContent = stats.availableBooks;
    totalMembersEl.textContent = stats.totalMembers;
    borrowedBooksEl.textContent = stats.borrowedBooks;
}

// Render books to the DOM
function renderBooks(filteredBooks = null) {
    const booksToDisplay = filteredBooks || library.books;
    
    if (booksToDisplay.length === 0) {
        booksContainer.innerHTML = '<div class="no-data">No books found. Add some books to get started.</div>';
        return;
    }
    
    booksContainer.innerHTML = '';
    
    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'card';
        
        const typeClass = book.type || 'regular';
        const statusClass = book.available ? 'available' : 'borrowed';
        
        // Using destructuring to extract book properties
        const { title, author, isbn, year } = book;
        
        bookCard.innerHTML = `
            <div class="card-header">
                <span class="book-type ${typeClass}">${typeClass.toUpperCase()}</span>
                <span class="status ${statusClass}">${book.status}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${title}</h3>
                <div class="card-detail">
                    <span class="detail-label">Author:</span>
                    <span class="detail-value">${author}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">ISBN:</span>
                    <span class="detail-value">${isbn}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Year:</span>
                    <span class="detail-value">${year}</span>
                </div>
                ${book.type === 'ebook' ? 
                    `<div class="card-detail">
                        <span class="detail-label">Format:</span>
                        <span class="detail-value">${book.format} (${book.fileSize}MB)</span>
                    </div>` : ''}
                ${book.type === 'audiobook' ? 
                    `<div class="card-detail">
                        <span class="detail-label">Narrator:</span>
                        <span class="detail-value">${book.narrator}</span>
                    </div>
                    <div class="card-detail">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${book.getDurationInfo()}</span>
                    </div>` : ''}
                ${!book.available ? 
                    `<div class="card-detail">
                        <span class="detail-label">Borrowed by:</span>
                        <span class="detail-value">${book.borrowedBy}</span>
                    </div>
                    <div class="card-detail">
                        <span class="detail-label">Borrowed on:</span>
                        <span class="detail-value">${book.borrowDate}</span>
                    </div>` : ''}
            </div>
            <div class="card-footer">
                <button class="btn btn-action borrow" onclick="borrowBook('${isbn}')" ${!book.available ? 'disabled' : ''}>
                    <i class="fas fa-sign-out-alt"></i> Borrow
                </button>
                <button class="btn btn-action return" onclick="returnBook('${isbn}')" ${book.available ? 'disabled' : ''}>
                    <i class="fas fa-sign-in-alt"></i> Return
                </button>
            </div>
        `;
        
        booksContainer.appendChild(bookCard);
    });
}

// Render members to the DOM
function renderMembers() {
    if (library.members.length === 0) {
        membersContainer.innerHTML = '<div class="no-data">No members found. Add some members to get started.</div>';
        return;
    }
    
    membersContainer.innerHTML = '';
    
    library.members.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        
        // Using destructuring to extract member properties
        const { id, name, email, borrowedBooks, joinDate } = member;
        
        memberCard.innerHTML = `
            <h3 class="member-name">${name}</h3>
            <div class="member-id">ID: ${id}</div>
            <div class="card-detail">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${email}</span>
            </div>
            <div class="card-detail">
                <span class="detail-label">Join Date:</span>
                <span class="detail-value">${joinDate}</span>
            </div>
            <div class="borrowed-books">
                <div class="card-detail">
                    <span class="detail-label">Books Borrowed:</span>
                    <span class="detail-value">${borrowedBooks.length}</span>
                </div>
                ${borrowedBooks.length > 0 ? 
                    `<div class="card-detail">
                        <span class="detail-label">Currently Borrowing:</span>
                        <span class="detail-value">${borrowedBooks.join(', ')}</span>
                    </div>` : ''}
            </div>
        `;
        
        membersContainer.appendChild(memberCard);
    });
}

// Render borrowed books
function renderBorrowedBooks() {
    const borrowedBooks = library.getBorrowedBooks();
    
    if (borrowedBooks.length === 0) {
        borrowedContainer.innerHTML = '<div class="no-data">No books are currently borrowed.</div>';
        return;
    }
    
    borrowedContainer.innerHTML = '';
    
    borrowedBooks.forEach(book => {
        const borrowedCard = document.createElement('div');
        borrowedCard.className = 'card';
        
        const member = library.findMemberById(book.borrowedBy);
        const memberName = member ? member.name : 'Unknown Member';
        
        borrowedCard.innerHTML = `
            <div class="card-header">
                <span class="book-type ${book.type || 'regular'}">${(book.type || 'regular').toUpperCase()}</span>
                <span class="status borrowed">Borrowed</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${book.title}</h3>
                <div class="card-detail">
                    <span class="detail-label">Author:</span>
                    <span class="detail-value">${book.author}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Borrowed by:</span>
                    <span class="detail-value">${memberName} (${book.borrowedBy})</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">Borrowed on:</span>
                    <span class="detail-value">${book.borrowDate}</span>
                </div>
                <div class="card-detail">
                    <span class="detail-label">ISBN:</span>
                    <span class="detail-value">${book.isbn}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-action return" onclick="returnBook('${book.isbn}')">
                    <i class="fas fa-sign-in-alt"></i> Return Book
                </button>
            </div>
        `;
        
        borrowedContainer.appendChild(borrowedCard);
    });
}

// Update book select dropdown
function updateBookSelect() {
    borrowBookSelect.innerHTML = '<option value="">Select Book</option>';
    
    library.books.forEach(book => {
        if (book.available) {
            const option = document.createElement('option');
            option.value = book.isbn;
            option.textContent = `${book.title} (${book.isbn})`;
            borrowBookSelect.appendChild(option);
        }
    });
}

// Update member select dropdown
function updateMemberSelect() {
    borrowMemberSelect.innerHTML = '<option value="">Select Member</option>';
    
    library.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.id})`;
        borrowMemberSelect.appendChild(option);
    });
}

// Event Listeners
bookTypeSelect.addEventListener('change', function() {
    ebookFields.classList.add('hidden');
    audiobookFields.classList.add('hidden');
    
    if (this.value === 'ebook') {
        ebookFields.classList.remove('hidden');
    } else if (this.value === 'audiobook') {
        audiobookFields.classList.remove('hidden');
    }
});

addBookBtn.addEventListener('click', function() {
    const title = bookTitleInput.value.trim();
    const author = bookAuthorInput.value.trim();
    const isbn = bookIsbnInput.value.trim();
    const year = parseInt(bookYearInput.value);
    const type = bookTypeSelect.value;
    
    if (!title || !author || !isbn || !year) {
        alert('Please fill in all required fields');
        return;
    }
    
    let newBook;
    
    if (type === 'ebook') {
        const format = ebookFormatInput.value.trim();
        const fileSize = parseInt(ebookSizeInput.value);
        
        if (!format || !fileSize) {
            alert('Please fill in all ebook fields');
            return;
        }
        
        newBook = new EBook(title, author, isbn, year, format, fileSize);
    } else if (type === 'audiobook') {
        const narrator = audiobookNarratorInput.value.trim();
        const duration = parseInt(audiobookDurationInput.value);
        
        if (!narrator || !duration) {
            alert('Please fill in all audiobook fields');
            return;
        }
        
        newBook = new AudioBook(title, author, isbn, year, narrator, duration);
    } else {
        newBook = new Book(title, author, isbn, year);
    }
    
    library.addBook(newBook);
    
    // Clear form
    bookTitleInput.value = '';
    bookAuthorInput.value = '';
    bookIsbnInput.value = '';
    bookYearInput.value = '';
    ebookFormatInput.value = '';
    ebookSizeInput.value = '';
    audiobookNarratorInput.value = '';
    audiobookDurationInput.value = '';
    
    updateStats();
    renderBooks();
    updateBookSelect();
    
    alert(`Book "${title}" added successfully!`);
});

addMemberBtn.addEventListener('click', function() {
    const name = memberNameInput.value.trim();
    const email = memberEmailInput.value.trim();
    
    if (!name || !email) {
        alert('Please fill in all fields');
        return;
    }
    
    const newMember = new Member(name, email);
    library.addMember(newMember);
    
    // Clear form
    memberNameInput.value = '';
    memberEmailInput.value = '';
    
    updateStats();
    renderMembers();
    updateMemberSelect();
    
    alert(`Member "${name}" added successfully with ID: ${newMember.id}`);
});

searchInput.addEventListener('input', function() {
    const query = this.value;
    const filterType = filterTypeSelect.value;
    
    const results = library.searchBooks(query, filterType);
    renderBooks(results);
});

filterTypeSelect.addEventListener('change', function() {
    const query = searchInput.value;
    const filterType = this.value;
    
    const results = library.searchBooks(query, filterType);
    renderBooks(results);
});

borrowBtn.addEventListener('click', function() {
    const bookIsbn = borrowBookSelect.value;
    const memberId = borrowMemberSelect.value;
    
    if (!bookIsbn || !memberId) {
        alert('Please select both a book and a member');
        return;
    }
    
    const result = library.borrowBook(bookIsbn, memberId);
    
    if (result.success) {
        updateStats();
        renderBooks();
        renderBorrowedBooks();
        updateBookSelect();
        renderMembers();
        
        borrowBookSelect.value = '';
        borrowMemberSelect.value = '';
        
        alert('Book borrowed successfully!');
    } else {
        alert(result.message);
    }
});

returnBtn.addEventListener('click', function() {
    const bookIsbn = borrowBookSelect.value;
    
    if (!bookIsbn) {
        alert('Please select a book to return');
        return;
    }
    
    const result = library.returnBook(bookIsbn);
    
    if (result.success) {
        updateStats();
        renderBooks();
        renderBorrowedBooks();
        updateBookSelect();
        renderMembers();
        
        borrowBookSelect.value = '';
        
        alert('Book returned successfully!');
    } else {
        alert(result.message);
    }
});

// Global functions for buttons in book cards
window.borrowBook = function(isbn) {
    // In a real application, you'd prompt for member selection
    // For simplicity, we'll use the first member
    if (library.members.length === 0) {
        alert('No members available. Please add a member first.');
        return;
    }
    
    const memberId = library.members[0].id;
    const result = library.borrowBook(isbn, memberId);
    
    if (result.success) {
        updateStats();
        renderBooks();
        renderBorrowedBooks();
        updateBookSelect();
        renderMembers();
        alert('Book borrowed successfully!');
    } else {
        alert(result.message);
    }
};

window.returnBook = function(isbn) {
    const result = library.returnBook(isbn);
    
    if (result.success) {
        updateStats();
        renderBooks();
        renderBorrowedBooks();
        updateBookSelect();
        renderMembers();
        alert('Book returned successfully!');
    } else {
        alert(result.message);
    }
};

saveDataBtn.addEventListener('click', function() {
    library.saveToStorage();
    alert('Library data saved to browser storage!');
});

loadDataBtn.addEventListener('click', function() {
    library.loadFromStorage();
    updateStats();
    renderBooks();
    renderMembers();
    renderBorrowedBooks();
    updateBookSelect();
    updateMemberSelect();
    alert('Library data loaded from browser storage!');
});

clearDataBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all library data? This cannot be undone.')) {
        library.clearData();
        updateStats();
        renderBooks();
        renderMembers();
        renderBorrowedBooks();
        updateBookSelect();
        updateMemberSelect();
        alert('All library data has been cleared.');
    }
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Show active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);