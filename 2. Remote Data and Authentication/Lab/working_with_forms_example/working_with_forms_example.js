document.querySelector("form").addEventListener("submit", addItem);

const list = document.getElementById("items");

loadItems();

async function loadItems()
{
    const res = await fetch("http://localhost:3030/jsonstore/list");

    if(!res.ok)
    {
        const err = await res.json();
        alert(err.message);

        return;
    }

    const data = await res.json();
    const items = Object.values(data);

    list.replaceChildren(...items.map(createItem));
}

function createItem(item)
{
    const element = document.createElement("li");
    element.textContent = item.title;

    return element;
}

async function addItem(event)
{
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const title = formData.get("text");

    if(!title)
    {
        return;
    }

    const item = { title };

    const res = await fetch("http://localhost:3030/jsonstore/list",
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    });

    if(!res.ok)
    {
        const err = await res.json();
        alert(err.message);

        return;
    }

    form.reset();

    loadItems();
}