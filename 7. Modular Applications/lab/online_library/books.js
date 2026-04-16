// Books data - central storage location
let books = [
    { id: 1, title: "JavaScript: The Good Parts", author: "Douglas Crockford", year: 2008, description: "A deep dive into the elegant parts of JavaScript" },
    { id: 2, title: "Eloquent JavaScript", author: "Marijn Haverbeke", year: 2018, description: "A modern introduction to programming" },
    { id: 3, title: "You Don't Know JS", author: "Kyle Simpson", year: 2015, description: "A book series on the core mechanisms of JavaScript" }
];

// Function to get all books
export function getAllBooks() {
    return books;
}

// Function to get a book by ID
export function getBookById(id) {
    return books.find(b => b.id === id);
}

// Function to add a new book
export function addBook(bookData) {
    const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title: bookData.title,
        author: bookData.author,
        year: parseInt(bookData.year),
        description: bookData.description || "No description available"
    };
    books.push(newBook);
    return newBook;
}

// Function to delete a book
export function deleteBook(id) {
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
        books.splice(index, 1);
        return true;
    }
    return false;
}

