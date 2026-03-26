import { dataService } from "../api/dataService.js";
import { userUtils } from "../utils/userUtils.js";

const detailsSection = document.querySelector("div[data-section='details']");
const main = document.querySelector("main");

export async function showDetailsView(ctx, params)
{
    const id = params[0];
    main.replaceChildren(detailsSection);
    const idea = await dataService.getIdeaById(id);

    const hasOwner = userUtils.hasOwner(idea._ownerId);
    detailsSection.innerHTML = createTemplate(idea, hasOwner);
}

function createTemplate(idea, hasOwner)
{
    return `
        <img class="det-img" src="${idea.img}" />
        <div class="desc">
            <h2 class="display-5">${idea.title}</h2>
            <p class="infoType">Description:</p>
            <p class="idea-description">${idea.description}</p>
        </div>
        <div class="text-center">
            ${hasOwner ? `<a class="btn detb" data-id=${idea._id} href="">Delete</a>` : ""}
        </div>
    `
}