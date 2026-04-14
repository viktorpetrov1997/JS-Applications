import { html, page } from "../utility/library.js";
import { dataService } from "../service/dataService.js";

const editTemplate = (solution) => html`
    <section id="edit">
        <div class="form">
            <img class="border" src="./images/border.png" alt="" />
            <h2>Edit Solution</h2>
            <form class="edit-form" @submit=${onSubmit} data-id=${solution._id}>
                <input type="text" name="type" .value=${solution.type} id="type" placeholder="Solution Type" />
                <input type="text" name="image-url" .value=${solution.imageUrl} id="image-url" placeholder="Image URL" />
                <textarea id="description" name="description" .value=${solution.description} placeholder="Description" rows="2" cols="10"></textarea>
                <textarea id="more-info" name="more-info" .value=${solution.learnMore} placeholder="more Info" rows="2" cols="10"></textarea>
                <button type="submit">Edit</button>
            </form>
        </div>
    </section>
`;

export async function showEditView(ctx)
{
    const id = ctx.params.id;

    const solution = await dataService.getSolutionById(id);

    ctx.render(editTemplate(solution));
}

async function onSubmit(e)
{
    e.preventDefault();

    const id = e.target.dataset.id;

    const formData = new FormData(e.target);

    const { type, ['image-url']: imageUrl, description, ['more-info']: learnMore } = Object.fromEntries(formData);


    if(!type || !imageUrl || !description || !learnMore) 
    {
        return alert("All fields are required!");
    }

    await dataService.updateSolution(id, { type, imageUrl, description, learnMore });

    page.redirect("/details/" + id);
}