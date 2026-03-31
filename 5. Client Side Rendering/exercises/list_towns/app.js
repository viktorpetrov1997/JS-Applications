import { html, render } from "../node_modules/lit-html/lit-html.js";

const form = document.querySelector("form").addEventListener("submit", onSubmit);

const container = document.getElementById("root");

function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = formData.get("towns");

    const towns = data.split(", ");

    const template = createTemplate(towns);
    
    render(template, container);

    e.target.reset();
}

function createTemplate(data)
{
    return html`
        <ul>
            ${data.map(town => html`<li>${town}</li>`)}
        </ul>
    `;
}