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

async function addItem()
{
    const input = document.getElementById("newItemText");
    const title = input.value;

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

    input.value = ""; 

    loadItems();
}