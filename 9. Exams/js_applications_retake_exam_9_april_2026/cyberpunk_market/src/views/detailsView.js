import { html, nothing } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { userUtils } from "../utility/userUtils.js";

const detailsTemplate = (item, hasOwner) => html`
    <section id="details">
        <div id="details-wrapper">
            <div>
                <img id="details-img" src=${item.imageUrl} alt="example1" />
                <p id="details-title">${item.item}</p>
            </div>
            <div id="info-wrapper">
                <div id="details-description">
                    <p class="details-price">Price: €${item.price}</p>
                    <p class="details-availability">
                        ${item.availability}
                    </p>
                    <p class="type">Type: ${item.type}</p>
                    <p id="item-description">
                        ${item.description}
                    </p>
                </div>
                
                ${hasOwner ? html`
                    <div id="action-buttons">
                        <a href="/edit/${item._id}" id="edit-btn">Edit</a>
                        <a href="/delete/${item._id}" id="delete-btn">Delete</a>
                    </div>
                `: nothing}
            </div>
        </div>
    </section>
`;

export async function showDetailsView(ctx)
{
    const id = ctx.params.id; 
    const item = await dataService.getItemById(id);

    const userId = await userUtils.getUserId();
    const hasOwner = userId === item._ownerId;

    ctx.render(detailsTemplate(item, hasOwner));
}