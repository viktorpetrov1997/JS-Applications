import { html, render } from 'https://unpkg.com/lit-html?module';
import { contacts } from "./contacts.js";

const visibleDetails = {};

function toggleDetails(id)
{
    visibleDetails[id] = !visibleDetails[id];

    renderContacts();
}

function renderContacts()
{
    const container = document.getElementById("contacts");

    render(contactsTemplate(), container);

}

const contactTemplate = (contact) => html`
    <div class="contact card">
        <div>
            <i class="far fa-user-circle gravatar"></i>
        </div>
        <div class="info">
            <h2>Name: ${contact.name}</h2>
            <button class="detailsBtn" @click=${() => toggleDetails(contact.id)}>Details</button>
            <div class="details" id="${contact.id}" style="display: ${visibleDetails[contact.id] ? 'block' : 'none'};">
                <p>Phone number:  ${contact.phoneNumber}</p>
                <p>Email:  ${contact.email}</p>
            </div>
         </div>
    </div>
`;

const contactsTemplate = () => html`
    ${contacts.map(contact => contactTemplate(contact))}
`;

renderContacts();