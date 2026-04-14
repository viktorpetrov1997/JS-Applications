import { html, nothing } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { userUtils } from "../utility/userUtils.js";

const detailsTemplate = (solution, hasOwner, hasUser, numberOfLikesForSolution, userLikes) => html`
    <section id="details">
        <div id="details-wrapper">
            <img id="details-img" src=${solution.imageUrl} alt="example1" />
            <div>
                <p id="details-type">${solution.type}</p>
                <div id="info-wrapper">
                    <div id="details-description">
                        <p id="description">
                            ${solution.description} 
                        </p>
                        <p id="more-info">
                            ${solution.learnMore} 
                        </p>
                    </div>
                </div>
                <h3>Like Solution:<span id="like">${numberOfLikesForSolution}</span></h3>

                <div id="action-buttons">
                    ${hasOwner ? html`
                        <a href="/edit/${solution._id}" id="edit-btn">Edit</a>
                        <a href="/delete/${solution._id}" id="delete-btn">Delete</a>
                    ` : nothing}

                    ${hasUser && !hasOwner && userLikes == 0 ? html`
                        <a href="/like/${solution._id}" id="like-btn">Like</a>
                    ` : nothing}
                </div>
            </div>
        </div>
    </section>
`;

export async function showDetailsView(ctx)
{
    const id = ctx.params.id; 
    const solution = await dataService.getSolutionById(id);

    const userId = await userUtils.getUserId();
    const hasOwner = userId === solution._ownerId;

    const hasUser = Boolean(userUtils.getUserData());

    const numberOfLikesForSolution = await dataService.getLikesForSolution(id);

    const userLikes = hasUser ? await dataService.getLikesForUser(id, userId) : 0;

    ctx.render(detailsTemplate(solution, hasOwner, hasUser, numberOfLikesForSolution, userLikes));
}