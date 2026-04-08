import { html, page } from "../utility/library.js";
import { dataService } from "../service/dataService.js";

const createTemplate = () => html`
    <section id="create">
        <div class="form">
            <img class="border" src="./images/border.png" alt="" />
            <h2>Add Solution</h2>
            <form class="create-form" @submit=${onSubmit}>
                <input type="text" name="type" id="type" placeholder="Solution Type" />
                <input type="text" name="image-url" id="image-url" placeholder="Image URL" />
                <textarea id="description" name="description" placeholder="Description" rows="2" cols="10"></textarea>
                <textarea id="more-info" name="more-info" placeholder="more Info" rows="2" cols="10"></textarea>
                <button type="submit">Add Solution</button>
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

    const { type, ['image-url']: imageUrl, description, ['more-info']: learnMore } = Object.fromEntries(formData);


    if(!type || !imageUrl || !description || !learnMore)
    {
        return alert("All fields are required!");
    }

    await dataService.createSolution({ type, imageUrl, description, learnMore });

    page.redirect("/dashboard");
}