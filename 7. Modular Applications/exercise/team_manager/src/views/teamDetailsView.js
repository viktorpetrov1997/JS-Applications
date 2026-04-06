import { html, nothing, renderer } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { userUtils } from "../utility/userUtil.js";

const teamDetailsTemplate = (teamData, countMember, hasOwner) => html`
    <section id="team-home">
    <article class="layout">
        <img src=${teamData.logoUrl} class="team-logo left-col">
        <div class="tm-preview">
            <h2>${teamData.name}</h2>
            <p>${teamData.description}</p>
            <span class="details">${countMember} Members</span>
            ${teamActionTemplate()}
        </div>
        ${teamMembersTemplate()}
        <div class="pad-large">
            <h3>Membership Requests</h3>
            ${memberRequestTemplate()}
        </div>
    </article>
</section>
`;

const teamActionTemplate = (hasOwner) => html`
    <div>
        ${hasOwner ? html` <a href="#" class="action">Edit team</a>` : nothing}
        <a href="#" class="action">Join team</a>
        <a href="#" class="action invert">Leave team</a>
        Membership pending. <a href="#">Cancel request</a>
    </div>
`; 

const teamMembersTemplate = () => html`
    <div class="pad-large">
        <h3>Members</h3>
        <ul class="tm-members">
            <li>My Username</li>
            <li>James<a href="#" class="tm-control action">Remove from team</a></li>
            <li>Meowth<a href="#" class="tm-control action">Remove from team</a></li>
        </ul>
    </div>
`;

const memberRequestTemplate = () => html`
    <ul class="tm-members">
        <li>John<a href="#" class="tm-control action">Approve</a><a href="#"
                class="tm-control action">Decline</a></li>
        <li>Preya<a href="#" class="tm-control action">Approve</a><a href="#"
                class="tm-control action">Decline</a></li>
    </ul>
`; 

export async function showTeamDetailsView(ctx)
{
    const id = ctx.params.id;

    const teamData = await dataService.getTeamById(id);

    const teamMembers = await dataService.getTeamMembers(id);

    const countMember = teamMembers.filter(member => member.status == "member").length;

    const hasOwner = userUtils.getUserId() === teamData._ownerId;

    renderer(teamDetailsTemplate(teamData, countMember, hasOwner));
}
