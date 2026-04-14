// ===== BOOKS DATA =====
var books = [
    {
        id: 101,
        name: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Novel",
        description: "A classic romance novel",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    },
    {
        id: 102,
        name: "The Hobbit",
        author: "J.R.R Tolkien",
        category: "Fantasy",
        description: "A fantasy adventure",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    },
    {
        id: 103,
        name: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Novel",
        description: "American classic",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    },
    {
        id: 104,
        name: "Harry Potter",
        author: "J.K. Rowling",
        category: "Fantasy",
        description: "Wizard adventure",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    },
    {
        id: 105,
        name: "Atomic Habits",
        author: "James Clear",
        category: "Self Development",
        description: "Build good habits",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    }
];

// ===== USERS DATA =====

var users = [
    {
        id: 1,
        username: "admin",
        password: "12345",
        email: "admin@onlinelibrary.com",  // ← This must match what you type in login
        phone: "+20 12 12880130",
        isAdmin: true,                     // ← Must be true
        address: "Egypt",
        borrowedBooks: []
    },
    {
        id: 2,
        username: "demyana",
        password: "12345",
        email: "bdemyana@gmail.com",
        phone: "+20 12 12880130",
        isAdmin: false,
        address: "Egypt",
        borrowedBooks: []
    },
    {
        id: 3,
        username: "john",
        password: "12345",
        email: "john@example.com",
        phone: "+20 10 12345678",
        isAdmin: false,
        address: "Cairo, Egypt",
        borrowedBooks: [101, 102]
    }
];

// ===== CURRENT LOGGED IN USER (Session) =====
var currentUser = null;

// Get book by ID
function getBookById(bookId) {
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
            return books[i];
        }
    }
    return null;
}

// Get user by username
function getUserByUsername(username) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return users[i];
        }
    }
    return null;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("users", JSON.stringify(users));
}

// Load data from localStorage
function loadData() {
    var savedBooks = localStorage.getItem("books");
    var savedUsers = localStorage.getItem("users");
    
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    }
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// Call this when page loads
loadData();

function getBookById(bookId) {
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
            return books[i];
        }
    }
    return null;
}