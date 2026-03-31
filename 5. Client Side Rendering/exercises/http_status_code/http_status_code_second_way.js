import { html, render } from "../node_modules/lit-html/lit-html.js";
import { cats } from "./catSeeder.js";

const visibleDetails = {};

function toggleDetails(id)
{
    visibleDetails[id] = !visibleDetails[id];

    renderContacts();
}

function renderContacts()
{
    const container = document.getElementById("allCats");

    render(catsTemplate(), container);
}

const catsTemplate = () => html`
    <ul>
        ${cats.map(cat => createTemplate(cat))}
    </ul>
`;

const createTemplate = (cat) => html`
    <li>
        <img src="./images/${cat.imageLocation}.jpg" width="250" height="250" alt="Card image cap">
        <div class="info">
            <button class="showBtn" @click=${() => toggleDetails(cat.id)}>Show status code</button>
            <div class="status" style="display: ${visibleDetails[cat.id] ? 'block' : 'none'}" id="100">
                <h4>Status Code: ${cat.statusCode}</h4>
                <p>${cat.statusMessage}</p>
            </div>
        </div>
    </li>
`;

renderContacts();