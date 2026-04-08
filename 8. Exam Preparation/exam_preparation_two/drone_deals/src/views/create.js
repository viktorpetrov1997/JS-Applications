import { html, page } from "../lib.js";
import { dataService } from "../data/data.js";
import { showNotification } from "../utils/notification.js";

const createTemplate = () => html`
    <section id="create">
        <div class="form form-item">
            <h2>Add Drone Offer</h2>
            <form class="create-form" @submit=${onSubmit}>
                <input type="text" name="model" id="model" placeholder="Drone Model" />
                <input type="text" name="imageUrl" id="imageUrl" placeholder="Image URL" />
                <input type="number" name="price" id="price" placeholder="Price" />
                <input type="number" name="weight" id="weight" placeholder="Weight" />
                <input type="number" name="phone" id="phone" placeholder="Phone Number for Contact" />
                <input type="text" name="condition" id="condition" placeholder="Condition" />
                <textarea name="description" id="description" placeholder="Description"></textarea>
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

    const { model, imageUrl, price, weight, phone, condition, description } = Object.fromEntries(formData);

    if(!model || !imageUrl || !price || !weight || !phone || !condition || !description)
    {
        return showNotification("All fields are required");
    }

    await dataService.create({ model, imageUrl, price, weight, phone, condition, description });

    page.redirect("/dashboard");
}