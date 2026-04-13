import { html, renderer } from "../utility/library.js";
import { userUtils } from "../utility/userUtil.js";
import { dataService } from "../service/dataService.js";

const myTeamsTemplate = (teams) => html`
    <section id="my-teams">

        <article class="pad-med">
            <h1>My Teams</h1>
        </article>

        ${teams.length === 0 ? html`
            <article class="layout narrow">
                <div class="pad-med">
                    <p>You are not a member of any team yet.</p>
                    <p>
                        <a href="/browseTeam">Browse all teams</a> to join one, 
                        or use the button below to create your own team.
                    </p>
                </div>
                <div>
                    <a href="/create" class="action cta">Create Team</a>
                </div>
            </article>
        `
        : teams.map(membership => html`
            <article class="layout">
                <img src="${membership.team.logoUrl}" class="team-logo left-col">
                <div class="tm-preview">
                    <h2>${membership.team.name}</h2>
                    <p>${membership.team.description}</p>
                    <span class="details">${membership.memberCount} Members</span>
                    <div>
                        <a href="/details/${membership.team._id}" class="action">See details</a>
                    </div>
                </div>
            </article>
        `)
    }

    </section>
`;

export async function showMyTeamsView(ctx)
{
    const userId = await userUtils.getUserId();

    const teamsWhereUserIsAMember = await dataService.getTeamsWhereUserIsAMember(userId);

    const allTeamMembers = await dataService.getAllMembers();

    teamsWhereUserIsAMember.forEach(membership =>
    {
        const memberCount = getMemberCountByTeam(allTeamMembers, membership.team._id);
        membership.memberCount = memberCount;
    });

    renderer(myTeamsTemplate(teamsWhereUserIsAMember));
}

function getMemberCountByTeam(memberList, teamId)
{
    return memberList.filter(member => member.teamId === teamId && member.status === "member").length;
}