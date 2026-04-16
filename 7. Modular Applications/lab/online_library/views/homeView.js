// Home page view using lit-html
import { html } from '../utils/litHtml.js';

export function homeTemplate() {
    return html`
        <div class="welcome-section">
            <h1>📚 Welcome to the Online Library</h1>
            <p>Browse our collection of programming books.</p>
            <br>
            <a href="/books" class="btn">Explore Books</a>
        </div>
    `;
}

