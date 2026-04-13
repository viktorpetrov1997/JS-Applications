import { html, nothing, renderer } from "../utility/library.js";
import { dataService } from "../service/dataService.js";
import { userUtils } from "../utility/userUtil.js";

const teamDetailsTemplate = (teamData, members, requests, state, membershipRecordId) => html`
    <section id="team-home">
        <article class="layout">
            <img src=${teamData.logoUrl} class="team-logo left-col">
            <div class="tm-preview">
                <h2>${teamData.name}</h2>
                <p>${teamData.description}</p>
                <span class="details">${members.length} Members</span>
                ${teamActionTemplate(state, teamData._id, membershipRecordId)}
            </div>

            ${teamMembersTemplate(members, state.isOwner, teamData._ownerId)}
            
            ${memberRequestTemplate(requests, state.isOwner)}

        </article>
    </section>
`;

const teamActionTemplate = (state, teamId, membershipRecordId) => html`
    <div>
        ${state.isOwner ? html` <a href="/edit/${teamId}" class="action">Edit team</a>` : nothing}
        ${state.isNotMember && !state.isGuest ? html` <a href="/joinTeam/${teamId}" class="action">Join team</a>` : nothing}
        ${state.isMember && !state.isOwner ? html` <a href="/leave/${teamId}/${membershipRecordId}" class="action invert">Leave team</a>`: nothing}
        ${state.isPending ? html` Membership pending. <a href="/cancel/${teamId}/${membershipRecordId}">Cancel request</a>`: nothing}
    </div>
`; 

const teamMembersTemplate = (members, isOwner, teamOwnerId) => html`
    <div class="pad-large">
        <h3>Members</h3>
        <ul class="tm-members">
            ${members.map(m => html`
                <li>
                    ${m.user.username}
                    ${isOwner && m._ownerId !== teamOwnerId ? html`
                        <a href="/remove/${m.teamId}/${m._id}" class="tm-control action">Remove from team</a>
                    ` : nothing}
                </li>
            `)}
        </ul>
    </div>
`;

const memberRequestTemplate = (requests, isOwner) => 
{
    if(!isOwner || requests.length === 0) 
    {
        return nothing;
    }

    return html`
        <div class="pad-large">
            <h3>Membership Requests</h3>
            <ul class="tm-members">
                ${requests.map(r => html`
                    <li>
                        ${r.user.username}
                        <a href="/approve/${r.teamId}/${r._id}" class="tm-control action">Approve</a>
                        <a href="/decline/${r.teamId}/${r._id}" class="tm-control action">Decline</a>
                    </li>
                `)}
            </ul>
        </div>
    `;
};

export async function showTeamDetailsView(ctx) 
{
    const id = ctx.params.id;

    const teamData = await dataService.getTeamById(id);
    const teamMembers = await dataService.getTeamMembers(id);

    const members = teamMembers.filter(m => m.status === "member");
    const requests = teamMembers.filter(m => m.status === "pending");

    const userId = userUtils.getUserId();

    const userMembership = teamMembers.find(m => m._ownerId === userId);

    const state = 
    {
        isGuest: !userId,
        isOwner: userId === teamData._ownerId,
        isMember: userMembership?.status === "member",
        isPending: userMembership?.status === "pending",
        isNotMember: !userMembership
    };

    renderer(teamDetailsTemplate(teamData, members, requests, state, userMembership?._id));
}

export async function joinTeam(ctx)
{
    const teamId = ctx.params.id;

    await dataService.requestToBecomeAMember(
    {
        teamId,
        status: "pending"
    });

    ctx.goTo(`/details/${teamId}`);
}

export async function approveMembership(ctx)
{
    const { teamId, membershipRecordId } = ctx.params;

    await dataService.approveMembership(membershipRecordId);

    ctx.goTo(`/details/${teamId}`);
}

export async function removeFromOrLeaveTeam(ctx)
{
    const { teamId, membershipRecordId } = ctx.params;

    await dataService.removeFromOrLeaveTeam(membershipRecordId);

    ctx.goTo(`/details/${teamId}`);
}

