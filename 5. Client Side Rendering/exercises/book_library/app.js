import { html, render } from "../node_modules/lit-html/lit-html.js";

const tableRoot = document.getElementById("tableRoot");
const formRoot = document.getElementById("formRoot");

const tableTemplate = (books) => html`
    <button id="loadBooks" @click=${onLoadAllBooks}>LOAD ALL BOOKS</button>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${books?.map(book => bookTemplate(book))}
        </tbody>
    </table>
`;

const createFormTemplate = () => html`
    <form id="add-form" @submit=${onCreateHandler}>
        <h3>Add book</h3>
        <label>TITLE</label>
        <input type="text" name="title" placeholder="Title...">
        <label>AUTHOR</label>
        <input type="text" name="author" placeholder="Author...">
        <input type="submit" value="Submit">
    </form>
`;

const editFormTemplate = (data, id) => html`
    <form id="edit-form" @submit=${onEditHandler}>
        <input type="hidden" name="id" .value=${id}>
        <h3>Edit book</h3>
        <label>TITLE</label>
        <input type="text" name="title" placeholder="Title..." .value=${data.title}>
        <label>AUTHOR</label>
        <input type="text" name="author" placeholder="Author..." .value=${data.author}>
        <input type="submit" value="Save">
    </form>
`;

const bookTemplate = (book) => html`
    <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>
            <button data-id=${book.id} @click=${onEdit}>Edit</button>
            <button data-id=${book.id} @click=${onDelete}>Delete</button>
        </td>
    </tr>
`;

render(tableTemplate(), tableRoot);
render(createFormTemplate(), formRoot);

async function onLoadAllBooks(e)
{
    const response = await fetch("http://localhost:3030/jsonstore/collections/books");
    const data = await response.json();

    Object.entries(data).forEach(([id, obj]) => obj.id = id);

    const books = Object.values(data);

    render(tableTemplate(books), tableRoot);
}

function onCreateHandler(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const author = formData.get("author");
    const title = formData.get("title");

    if(!author || !title)
    {
        return;
    }

    e.target.reset();

    saveBook({ author, title });
}

async function saveBook(data)
{
    const option = 
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }

    await fetch("http://localhost:3030/jsonstore/collections/books", option);

    onLoadAllBooks();
}

async function onEdit(e)
{
    const id = e.target.dataset.id;

    const response = await fetch(`http://localhost:3030/jsonstore/collections/books/${id}`);

    const data = await response.json();

    render(editFormTemplate(data, id), formRoot);
}

function onEditHandler(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const id = formData.get("id");

    const author = formData.get("author");
    const title = formData.get("title");

    if(!author || !title)
    {
        return;
    }

    e.target.reset();

    onStoreEditBook({ author, title }, id);
}

async function onStoreEditBook(data, id)
{
    const option = 
    {
        method: "PUT",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }

    await fetch(`http://localhost:3030/jsonstore/collections/books/${id}`, option);

    onLoadAllBooks();

    render(createFormTemplate(), formRoot);
}

async function onDelete(e)
{
    const id = e.target.dataset.id;

    await fetch(`http://localhost:3030/jsonstore/collections/books/${id}`, { method: "DELETE" });

    onLoadAllBooks();
}
