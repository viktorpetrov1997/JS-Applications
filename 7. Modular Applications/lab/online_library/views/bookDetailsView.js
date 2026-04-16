// Book details view using lit-html
import { html } from '../utils/litHtml.js';

export function bookDetailsTemplate(book) {
    if (!book) {
        return html`
            <h1>❌ Book not found</h1>
            <p>Sorry, we couldn't find the book you're looking for.</p>
            <br>
            <a href="/books" class="back-link">← Back to Books</a>
        `;
    }
    
    return html`
        <h1>📖 ${book.title}</h1>
        <div class="book-details">
            <p><strong>✍️ Author:</strong> ${book.author}</p>
            <p><strong>📅 Year:</strong> ${book.year}</p>
            <p><strong>📝 Description:</strong> ${book.description}</p>
        </div>
        <a href="/books" class="back-link">← Back to Books</a>
    `;
}

