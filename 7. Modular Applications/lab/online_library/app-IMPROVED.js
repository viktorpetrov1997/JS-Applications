// IMPROVED VERSION - Demonstrates Best Practices
// Shows: Action feedback, input validation, error handling

// Import utilities
import { renderToMain, attachEventListener } from './utils/renderHelper.js';
import { getFormData, validateBookData } from './utils/formHelper-IMPROVED.js';

// Import data layer
import { getAllBooks, getBookById, addBook } from './books.js';

// Import view templates
import { homeTemplate } from './views/homeView.js';
import { booksListTemplate } from './views/booksView.js';
import { bookDetailsTemplate } from './views/bookDetailsView.js';
import { addBookFormTemplate, successMessageTemplate } from './views/addBookView.js';

// Route handlers
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

// ✅ IMPROVED: Event handler with action feedback and validation
async function handleBookSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // ✅ BEST PRACTICE: Disable button during submission
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';  // ✅ Action feedback
    
    try {
        // ✅ BEST PRACTICE: Sanitize input
        const formData = getFormData(form);
        
        // ✅ BEST PRACTICE: Validate input
        const validation = validateBookData(formData);
        
        if (!validation.valid) {
            // ✅ BEST PRACTICE: Show validation errors
            showValidationErrors(validation.errors);
            
            // Re-enable button on error
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        // ✅ BEST PRACTICE: Clear previous errors
        clearValidationErrors();
        
        // Simulate network delay (for demo purposes)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add book
        const newBook = addBook(formData);
        
        // ✅ BEST PRACTICE: Show success feedback
        renderToMain(successMessageTemplate(newBook.title));
        
        // Auto redirect after 2 seconds
        setTimeout(() => page('/books'), 2000);
        
    } catch (error) {
        // ✅ BEST PRACTICE: Handle errors
        console.error('Error adding book:', error);
        
        // Show error message
        showErrorMessage('Failed to add book. Please try again.');
        
        // Re-enable button on error
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ✅ BEST PRACTICE: Show validation errors
function showValidationErrors(errors) {
    const errorContainer = document.getElementById('form-errors');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <strong>Please fix the following errors:</strong>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

// ✅ BEST PRACTICE: Clear validation errors
function clearValidationErrors() {
    const errorContainer = document.getElementById('form-errors');
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.innerHTML = '';
    }
}

// ✅ BEST PRACTICE: Show error message
function showErrorMessage(message) {
    const mainElement = document.querySelector('main');
    const errorHtml = `
        <div class="error-message">
            <h2>❌ Error</h2>
            <p>${message}</p>
            <a href="/books/add" class="btn">Try Again</a>
        </div>
    `;
    // Note: This would need to be converted to lit-html template in real implementation
    mainElement.insertAdjacentHTML('afterbegin', errorHtml);
}

// Router configuration
// IMPORTANT: Specific routes (like /books/add) must be BEFORE dynamic routes (like /books/:id)
page('/', showHome);
page('/books/add', showAddBookForm);
page('/books/:id', showBookDetails);
page('/books', showBooks);

// Initialize router
page();

