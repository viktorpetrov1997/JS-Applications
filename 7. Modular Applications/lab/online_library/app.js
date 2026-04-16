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


// TODO 1: Write route handler for Home page

function showHome() {
    // WRITE YOUR CODE HERE
}


// TODO 2: Write route handler for books list

function showBooks() {
    // WRITE YOUR CODE HERE
}


// TODO 3: Write route handler for book details

function showBookDetails(ctx) {
    // WRITE YOUR CODE HERE
}


// TODO 4: Write route handler for add book form

function showAddBookForm() {
    // WRITE YOUR CODE HERE
}


// Event handler for form submit (READY)
function handleBookSubmit(e) {
    e.preventDefault();
    const formData = getFormData(e.target);
    const newBook = addBook(formData);
    renderToMain(successMessageTemplate(newBook.title));
    setTimeout(() => page('/books'), 2000);
}

// TODO 5: Define route for home page


// TODO 6: Define route for books list


// TODO 7: Define route for adding a book


// TODO 8: Define route for book details (with parameter!)


// TODO 9: Start the Page.js router