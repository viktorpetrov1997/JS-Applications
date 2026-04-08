import { html, nothing } from "../lib.js";
import { dataService } from "../data/data.js";
import { getUserData } from "../utils/utils.js";

const detailsTemplate = (drone, hasOwner) => html`
    <section id="details">
        <div id="details-wrapper">
            <div>
                <img id="details-img" src=${drone.imageUrl} alt="example1" />
                <p id="details-model">${drone.model}</p>
            </div>
            <div id="info-wrapper">
                <div id="details-description">
                    <p class="details-price">Price: €${drone.price}</p>
                    <p class="details-condition">Condition: ${drone.condition}</p>
                    <p class="details-weight">Weight: ${drone.weight}g</p>
                    <p class="drone-description">
                        ${drone.description}
                    </p>
                    <p class="phone-number">Phone: ${drone.phone}</p>
                </div>

                ${hasOwner ? html`
                    <div class="buttons">
                        <a href="/edit/${drone._id}" id="edit-btn">Edit</a>
                        <a href="/delete/${drone._id}" id="delete-btn">Delete</a>
                    </div>
                `: nothing}
            </div>
        </div>
    </section>
`;

export async function showDetailsView(ctx)
{
    const id = ctx.params.id; 
    const drone = await dataService.getById(id);

    const userData = await getUserData();
    const hasOwner = userData?.id === drone._ownerId;

    ctx.render(detailsTemplate(drone, hasOwner));
}