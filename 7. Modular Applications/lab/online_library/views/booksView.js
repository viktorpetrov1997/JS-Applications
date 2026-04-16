// Books list view using lit-html
import { html } from '../utils/litHtml.js';

export function booksListTemplate(books) {
    return html`
        <h1>📚 Our Books Collection</h1>
        <p style="margin-bottom: 20px;">Total books: ${books.length}</p>
        <ul class="book-list">
            ${books.map(book => html`
                <li>
                    <div>
                        <div class="book-title">📖 ${book.title}</div>
                        <span class="book-author">by ${book.author}</span>
                    </div>
                    <a class="book-link" href="/books/${book.id}">View Details</a>
                </li>
            `)}
        </ul>
    `;
}

