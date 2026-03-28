let editId = null;

let loadAllBooksButton = document.getElementById("loadBooks");
loadAllBooksButton.addEventListener("click", loadAllBooks);

let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", submitData);

let formTitle = document.querySelector("form h3");

async function loadAllBooks()
{
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let url = 'http://localhost:3030/jsonstore/collections/books';

    let response = await fetch(url);
    let data = await response.json();

    Object.values(data).forEach(element =>
    {
        let tr = document.createElement("tr");
        
        let tdTitle = document.createElement("td");
        tdTitle.textContent = element.title;

        let tdAuthor = document.createElement("td");
        tdAuthor.textContent = element.author;
        
        let tdButtons = document.createElement("td");

        let editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.dataset.id = element._id;
        editButton.addEventListener("click", editRow);

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.dataset.id = element._id;
        deleteButton.addEventListener("click", deleteRow);

        tdButtons.appendChild(editButton);
        tdButtons.appendChild(deleteButton);

        tr.appendChild(tdTitle);
        tr.appendChild(tdAuthor);
        tr.appendChild(tdButtons);
        
        tbody.appendChild(tr);
    });
}

async function submitData(e)
{
    e.preventDefault();

    let title = document.getElementById("title").value;
    let author = document.getElementById("author").value;

    if(title === "" || author === "")
    {
        return;
    }

    let url = 'http://localhost:3030/jsonstore/collections/books';

    let settings;

    if(editId !== null)
    {
        url = `http://localhost:3030/jsonstore/collections/books/${editId}`;

        settings =
        {
            method: 'put',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ title, author })
        };
    }
    else
    {
        settings =
        {
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ title, author })
        };
    }

    await fetch(url, settings);

    editId = null;

    document.getElementById("title").value = "";
    document.getElementById("author").value = "";

    formTitle.textContent = "FORM";
    submitButton.textContent = "Submit";

    await loadAllBooks();
}

async function editRow(e) 
{
    editId = e.target.dataset.id;

    let url = `http://localhost:3030/jsonstore/collections/books/${editId}`;

    let response = await fetch(url);
    let data = await response.json();

    document.getElementById("title").value = data.title;
    document.getElementById("author").value = data.author;

    formTitle.textContent = "Edit FORM";
    submitButton.textContent = "Save";
}

async function deleteRow(e)
{
    let rowId = e.target.dataset.id;

    let url = `http://localhost:3030/jsonstore/collections/books/${rowId}`;

    let settings =
    {
        method: 'delete'
    };

    await fetch(url, settings);

    await loadAllBooks();
}