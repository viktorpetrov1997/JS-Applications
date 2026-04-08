import { html } from "../lib.js";
import { dataService } from "../data/data.js";

const dashboardTemplate = (data) => html`
    <h3 class="heading">Marketplace</h3>
    <section id="dashboard">
        ${data.length > 0 ? html`
                ${data.map(drone => droneTemplate(drone))}
                `
            :
            html` <h3 class="no-drones">No Drones Available</h3>`
        }
    </section>
`;

const droneTemplate = (drone) => html`
    <div class="drone">
        <img src=${drone.imageUrl} alt="example1" />
        <h3 class="model">${drone.model}</h3>
        <div class="drone-info">
            <p class="price">Price: €${drone.price}</p>
            <p class="condition">Condition: ${drone.condition}</p>
            <p class="weight">Weight: ${drone.weight}g</p>
        </div>
        <a class="details-btn" href="/details/${drone._id}">Details</a>
    </div>
`;

export async function showDashboardView(ctx)
{
    const data = await dataService.getAll();

    ctx.render(dashboardTemplate(data));
}