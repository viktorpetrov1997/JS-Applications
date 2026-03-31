import { html, render } from "../node_modules/lit-html/lit-html.js";

const container = document.querySelector(".container tbody");

async function init() 
{
   const template = await loadTableRows();
   render(template, container);
}

init();

async function loadTableRows() 
{
   const response = await fetch("http://localhost:3030/jsonstore/advanced/table");

   const data = await response.json();

   const rows = Object.values(data);

   return html`
           ${rows.map(row => createTemplate(row))}
       `;
}

function createTemplate(row)
{
    return html`
        <tr>
            <td>${row.firstName} ${row.lastName}</td>
            <td>${row.email}</td>
            <td>${row.course}</td>
         </tr>
    `;
}

document.getElementById("searchBtn").addEventListener("click", onSearch);

function onSearch()
{
   const input = document.getElementById("searchField").value.toLowerCase();

   if (input === "") return;

   const rows = document.querySelectorAll("tbody tr");

   rows.forEach(row => 
   {
      row.classList.remove("select");

      const rowText = row.textContent.toLowerCase();

      if(rowText.includes(input))
      {
         row.classList.add("select");
      }
   });

   document.getElementById("searchField").value = "";
}