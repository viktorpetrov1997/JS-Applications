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


// Route handler for Home page

function showHome() 
{
    renderToMain(homeTemplate());
}


// Route handler for books list

function showBooks() 
{
    const books = getAllBooks();
    renderToMain(booksListTemplate(books));
}


// Route handler for book details

function showBookDetails(ctx) 
{
    const id = Number(ctx.params.id);
    const book = getBookById(id);
    renderToMain(bookDetailsTemplate(book));
}


// Route handler for add book form

function showAddBookForm() 
{
    renderToMain(addBookFormTemplate());
    attachEventListener('addBookForm', 'submit', handleBookSubmit);
}


// Event handler for form submit (READY)
function handleBookSubmit(e) 
{
    e.preventDefault();
    const formData = getFormData(e.target);
    const newBook = addBook(formData);
    renderToMain(successMessageTemplate(newBook.title));
    setTimeout(() => page('/books'), 2000);
}

// Route for home page

page("/", showHome);

// Route for books list

page("/books", showBooks);

// Route for adding a book

page("/books/add", showAddBookForm);

// Route for book details (with parameter!)

page("/books/:id", showBookDetails);

// Start the Page.js router

page();