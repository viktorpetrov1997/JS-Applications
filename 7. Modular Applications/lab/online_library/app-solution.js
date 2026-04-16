// Import utilities
import { renderToMain, attachEventListener } from './utils/renderHelper.js';
import { getFormData } from './utils/formHelper.js';

// Import data layer
import { getAllBooks, getBookById, addBook } from './books.js';

// Import view templates
import { homeTemplate } from './views/homeView.js';
import { booksListTemplate } from './views/booksView.js';
import { bookDetailsTemplate } from './views/bookDetailsView.js';
import { addBookFormTemplate, successMessageTemplate } from './views/addBookView.js';

// Route handlers - connect routing with views via lit-html render
function showHome() {
    renderToMain(homeTemplate());
}

function showBooks() {
    const books = getAllBooks();
    renderToMain(booksListTemplate(books));
}

function showBookDetails(ctx) {
    const id = Number(ctx.params.id);
    const book = getBookById(id);
    renderToMain(bookDetailsTemplate(book));
}

function showAddBookForm() {
    renderToMain(addBookFormTemplate());
    attachEventListener('addBookForm', 'submit', handleBookSubmit);
}

// Event handlers
function handleBookSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData(e.target);
    const newBook = addBook(formData);
    
    // Show success message
    renderToMain(successMessageTemplate(newBook.title));
    
    // Auto redirect after 2 seconds
    setTimeout(() => page('/books'), 2000);
}

// Router configuration
// IMPORTANT: Specific routes (like /books/add) must be BEFORE dynamic routes (like /books/:id)
page('/', showHome);
page('/books/add', showAddBookForm);
page('/books/:id', showBookDetails);
page('/books', showBooks);

// Initialize router
page();
