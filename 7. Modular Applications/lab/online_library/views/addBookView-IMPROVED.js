// Add book form view using lit-html - IMPROVED VERSION
// Demonstrates: Error display, better UX

import { html } from '../utils/litHtml.js';

export function addBookFormTemplate() {
    return html`
        <h1>➕ Add New Book</h1>
        
        <!-- ✅ BEST PRACTICE: Error container for validation errors -->
        <div id="form-errors" class="error-container" style="display: none;"></div>
        
        <form id="addBookForm" class="book-form">
            <div class="form-group">
                <label for="title">📖 Book Title</label>
                <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    required 
                    placeholder="Enter book title"
                    maxlength="200"
                    minlength="3">
                <span id="title-error" class="field-error"></span>
            </div>
            
            <div class="form-group">
                <label for="author">✍️ Author</label>
                <input 
                    type="text" 
                    id="author" 
                    name="author" 
                    required 
                    placeholder="Enter author name"
                    maxlength="100"
                    minlength="2">
                <span id="author-error" class="field-error"></span>
            </div>
            
            <div class="form-group">
                <label for="year">📅 Publication Year</label>
                <input 
                    type="number" 
                    id="year" 
                    name="year" 
                    required 
                    min="1900" 
                    max="2025" 
                    placeholder="e.g. 2020">
                <span id="year-error" class="field-error"></span>
            </div>
            
            <div class="form-group">
                <label for="description">📝 Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows="4" 
                    placeholder="Enter book description (optional)"
                    maxlength="1000"></textarea>
                <span id="description-error" class="field-error"></span>
            </div>
            
            <div class="form-buttons">
                <button type="submit" class="btn btn-primary">✅ Add Book</button>
                <a href="/books" class="btn btn-secondary">❌ Cancel</a>
            </div>
        </form>
    `;
}

export function successMessageTemplate(bookTitle) {
    return html`
        <div class="success-message">
            <h1>✅ Success!</h1>
            <p>Book "${bookTitle}" has been added successfully!</p>
            <br>
            <a href="/books" class="btn">View All Books</a>
        </div>
    `;
}

