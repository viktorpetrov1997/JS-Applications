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

    container.innerHTML = contacts.map(contact => `
        <div class="contact card">
            <div>
                <i class="far fa-user-circle gravatar"></i>
            </div>
            <div class="info">
                <h2>Name: ${contact.name}</h2>
                <button class="detailsBtn" data-id="${contact.id}">Details</button>
                <div class="details" style="display: ${visibleDetails[contact.id] ? 'block' : 'none'};">
                    <p>Phone number: ${contact.phoneNumber}</p>
                    <p>Email: ${contact.email}</p>
                </div>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".detailsBtn").forEach(btn => 
    {
        btn.addEventListener("click", (e) => 
        {
            const id = e.target.dataset.id;
            toggleDetails(id);
        });
    });
}

renderContacts();