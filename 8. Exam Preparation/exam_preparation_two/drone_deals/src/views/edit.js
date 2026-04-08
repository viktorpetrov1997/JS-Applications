import { html, page } from "../lib.js";
import { dataService } from "../data/data.js";
import { showNotification } from "../utils/notification.js";

const editTemplate = (drone) => html`
    <section id="edit">
        <div class="form form-item">
            <h2>Edit Offer</h2>
            <form class="edit-form" @submit=${onSubmit} data-id=${drone._id}>
                <input type="text" name="model" .value=${drone.model} id="model" placeholder="Drone Model" />
                <input type="text" name="imageUrl" .value=${drone.imageUrl} id="imageUrl" placeholder="Image URL" />
                <input type="number" name="price" .value=${drone.price} id="price" placeholder="Price" />
                <input type="number" name="weight" .value=${drone.weight} id="weight" placeholder="Weight" />
                <input type="number" name="phone" .value=${drone.phone} id="phone" placeholder="Phone Number for Contact" />
                <input type="text" name="condition" .value=${drone.condition} id="condition" placeholder="Condition" />
                <textarea name="description" .value=${drone.description} id="description" placeholder="Description"></textarea>
                <button type="submit">Edit</button>
            </form>
        </div>
    </section>
`;

export async function showEditView(ctx)
{
    const id = ctx.params.id;

    const drone = await dataService.getById(id);

    ctx.render(editTemplate(drone));
}

async function onSubmit(e)
{
    e.preventDefault();

    const id = e.target.dataset.id;

    const formData = new FormData(e.target);

    const { model, imageUrl, price, weight, phone, condition, description } = Object.fromEntries(formData);

    if(!model || !imageUrl || !price || !weight || !phone || !condition || !description)
    {
        return showNotification("All fields are required");
    }

    await dataService.update(id, { model, imageUrl, price, weight, phone, condition, description });

    page.redirect("/details/" + id);
}