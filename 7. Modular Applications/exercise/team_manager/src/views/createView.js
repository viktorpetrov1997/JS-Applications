import { html, renderer } from "../utility/library.js";
import { dataService } from "../service/dataService.js";

const createTemplate = (error) => html`
    <section id="create">
        <article class="narrow">
            <header class="pad-med">
                <h1>New Team</h1>
            </header>
            <form id="create-form" class="main-form pad-large" @submit=${onSubmit}>
                ${error ? html`<div class="error">${error}</div>` : null}
                <label>Team name: <input type="text" name="name"></label>
                <label>Logo URL: <input type="text" name="logoUrl"></label>
                <label>Description: <textarea name="description"></textarea></label>
                <input class="action cta" type="submit" value="Create Team">
            </form>
        </article>
    </section>
`;

let context = null;

export function showCreateView(ctx)
{
    context = ctx;
    renderer(createTemplate());
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    try
    {
        const { name, logoUrl, description } = Object.fromEntries(formData);

        if(!name || !logoUrl || !description) 
        {
            throw new Error("All fields are required!");
        }

        const team = await dataService.createTeam({ name, logoUrl, description });

        const membership = await dataService.requestToBecomeAMember(
        {
            teamId: team._id,
            status: "pending"
        });

        await dataService.approveMembership(membership._id);

        context.goTo(`/details/${team._id}`);
    }
    catch(error)
    {
        renderer(createTemplate(error.message));
    }
}