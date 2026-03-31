import { html, render } from "../node_modules/lit-html/lit-html.js";

const dropdownMenu = document.getElementById("menu");

async function init() 
{
    const template = await loadItems();
    render(template, dropdownMenu);
}

init();

async function loadItems()
{
    const response = await fetch("http://localhost:3030/jsonstore/advanced/dropdown");

    const data = await response.json();

    const dropdownItems = Object.values(data);

    return html`
        ${dropdownItems.map(item => createTemplate(item))}
    `;
}

function createTemplate(item)
{
    return html`
        <option value=${item._id}>${item.text}</option>
    `;
}

const form = document.querySelector("form").addEventListener("submit", onSubmit);

async function onSubmit(e)
{
    e.preventDefault();

    const item = document.getElementById("itemText").value;

    const settings =
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: item })
    }

    await fetch("http://localhost:3030/jsonstore/advanced/dropdown", settings);

    e.target.reset();

    init();
}



