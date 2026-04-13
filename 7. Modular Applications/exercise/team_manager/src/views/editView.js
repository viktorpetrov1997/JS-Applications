import { html, renderer } from "../utility/library.js";
import { dataService } from "../service/dataService.js";

const editTemplate = (team, error) => html`
    <section id="edit">
        <article class="narrow">
            <header class="pad-med">
                <h1>Edit Team</h1>
            </header>
            <form id="edit-form" class="main-form pad-large" @submit=${onSubmit} data-id=${team._id}>
                ${error ? html`<div class="error">${error}</div>` : null}
                <label>Team name: <input type="text" name="name" .value=${team.name}></label>
                <label>Logo URL: <input type="text" name="logoUrl" .value=${team.logoUrl}></label>
                <label>Description: <textarea name="description" .value=${team.description}></textarea></label>
                <input class="action cta" type="submit" value="Save Changes">
            </form>
        </article>
    </section>
`;

let context = null;
let currentTeam = null;

export async function showEditView(ctx)
{
    context = ctx;

    const teamId = ctx.params.id;

    currentTeam = await dataService.getTeamById(teamId);

    renderer(editTemplate(currentTeam));
}

async function onSubmit(e)
{
    e.preventDefault();

    const id = e.target.dataset.id;

    const formData = new FormData(e.target);

    try
    {
        const { name, logoUrl, description } = Object.fromEntries(formData);

        if(!name || !logoUrl || !description) 
        {
            throw new Error("All fields are required!");
        }

        await dataService.updateTeam(id, { name, logoUrl, description });

        context.goTo(`/details/${id}`);
    }
    catch(error)
    {
        renderer(editTemplate(currentTeam, error.message));
    }
}