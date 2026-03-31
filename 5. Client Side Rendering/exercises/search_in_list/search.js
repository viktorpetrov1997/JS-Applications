import { html, render } from "../node_modules/lit-html/lit-html.js";
import { towns } from "./towns.js";

const container = document.getElementById("towns");

render(createTemplate(), container);

function createTemplate()
{
    return html`
        <ul>
            ${towns.map(town => createListTemplate(town))}
        </ul>
    `;
}

function createListTemplate(item)
{
    return html`
        <li>${item}</li>
    `;
}

document.querySelector("button").addEventListener("click", onSearch);

function onSearch()
{
    const input = document.getElementById("searchText").value;

    if(input === "") return;

    const listItems = document.querySelectorAll("#towns ul li");

    let matchesFound = 0;

    listItems.forEach(item =>
    {
        item.classList.remove("active");

        const itemText = item.textContent;

        if(itemText.includes(input))
        {
            item.classList.add("active");
            ++matchesFound;
        }
    });

    document.getElementById("result").textContent = `${matchesFound} matches found`;

    document.getElementById("searchText").value = "";
}