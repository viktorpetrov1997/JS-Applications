import { html, page } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { showNotification } from "../utility/notifications.js";

const editTemplate = (item) => html`
    <section id="edit">
        <div class="form form-item">
            <h2>Edit Your Item</h2>
            <form class="edit-form" @submit=${onSubmit} data-id=${item._id}>
                <input type="text" name="item" .value=${item.item} id="item" placeholder="Item" />
                <input type="text" name="imageUrl" .value=${item.imageUrl} id="item-image" placeholder="Your item Image URL" />
                <input type="text" name="price" .value=${item.price} id="price" placeholder="Price in Euro" />
                <input type="text" name="availability" .value=${item.availability} id="availability" placeholder="Availability Information" />
                <input type="text" name="type" .value=${item.type} id="type" placeholder="Item Type" />
                <textarea id="description" name="description" .value=${item.description} placeholder="More About The Item" rows="10"
                    cols="50"></textarea>
                <button type="submit">Edit</button>
            </form>
        </div>
    </section>
`;

export async function showEditView(ctx)
{
    const id = ctx.params.id;

    const item = await dataService.getItemById(id);

    ctx.render(editTemplate(item));
}

async function onSubmit(e)
{
    e.preventDefault();

    const id = e.target.dataset.id;

    const formData = new FormData(e.target);

    const { item, imageUrl, price, availability, type, description } = Object.fromEntries(formData);


    if(!item || !imageUrl || !price || !availability || !type || !description) 
    {
        return showNotification("All fields are required");
    }

    await dataService.updateItem(id, { item, imageUrl, price, availability, type, description });

    page.redirect("/details/" + id);
}