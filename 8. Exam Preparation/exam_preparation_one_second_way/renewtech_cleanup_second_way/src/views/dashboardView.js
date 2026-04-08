import { html } from "../utility/library.js";
import { dataService } from "../service/dataService.js";

const dashboardTemplate = (data) => html`
    <h2>Solutions</h2>
    <section id="solutions">
        ${data.length > 0 ? html`
                ${data.map(solution => solutionTemplate(solution))}
                `
            :
            html` <h2 id="no-solution">No Solutions Added.</h2>`
        }
    </section>
`;

const solutionTemplate = (solution) => html`
    <div class="solution">
        <img src=${solution.imageUrl} alt="example1" />
        <div class="solution-info">
            <h3 class="type">${solution.type}</h3>
            <p class="description">
                ${solution.description}
            </p>
            <a class="details-btn" href="/details/${solution._id}">Learn More</a>
        </div>
    </div>
`;

export async function showDashboardView(ctx)
{
    const data = await dataService.getAllSolutions();

    ctx.render(dashboardTemplate(data));
}