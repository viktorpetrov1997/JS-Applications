import { html, page } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { showNotification } from "../utility/notifications.js";

const createTemplate = () => html`
    <section id="create">
        <div class="form form-item">
            <h2>Share Your item</h2>
            <form class="create-form" @submit=${onSubmit}>
                <input type="text" name="item" id="item" placeholder="Item" />
                <input type="text" name="imageUrl" id="item-image" placeholder="Your item Image URL" />
                <input type="text" name="price" id="price" placeholder="Price in Euro" />
                <input type="text" name="availability" id="availability" placeholder="Availability Information" />
                <input type="text" name="type" id="type" placeholder="Item Type" />
                <textarea id="description" name="description" placeholder="More About The Item" rows="10"
                    cols="50"></textarea>
                <button type="submit">Add</button>
            </form>
        </div>
    </section>
`;

export async function showCreateView(ctx)
{
    ctx.render(createTemplate());
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { item, imageUrl, price, availability, type, description } = Object.fromEntries(formData);


    if(!item || !imageUrl || !price || !availability || !type || !description)
    {
        return showNotification("All fields are required");
    }

    await dataService.createItem({ item, imageUrl, price, availability, type, description });

    page.redirect("/dashboard");
}