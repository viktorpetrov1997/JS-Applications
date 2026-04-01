// Add book form view using lit-html
import { html } from '../utils/litHtml.js';

export function addBookFormTemplate() 
{
    return html`
        <h1>➕ Add New Book</h1>
        <form id="addBookForm" class="book-form">
            <div class="form-group">
                <label for="title">📖 Book Title</label>
                <input type="text" id="title" name="title" required placeholder="Enter book title">
            </div>
            
            <div class="form-group">
                <label for="author">✍️ Author</label>
                <input type="text" id="author" name="author" required placeholder="Enter author name">
            </div>
            
            <div class="form-group">
                <label for="year">📅 Publication Year</label>
                <input type="number" id="year" name="year" required min="1900" max="2025" placeholder="e.g. 2020">
            </div>
            
            <div class="form-group">
                <label for="description">📝 Description</label>
                <textarea id="description" name="description" rows="4" placeholder="Enter book description (optional)"></textarea>
            </div>
            
            <div class="form-buttons">
                <button type="submit" class="btn btn-primary">✅ Add Book</button>
                <a href="/books" class="btn btn-secondary">❌ Cancel</a>
            </div>
        </form>
    `;
}

export function successMessageTemplate(bookTitle) 
{
    return html`
        <div class="success-message">
            <h1>✅ Success!</h1>
            <p>Book "${bookTitle}" has been added successfully!</p>
            <br>
            <a href="/books" class="btn">View All Books</a>
        </div>
    `;
}

