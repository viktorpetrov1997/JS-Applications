import { html, nothing, renderer } from "../utility/library.js";
import { userUtils } from "../utility/userUtil.js";
import { dataService } from "../service/dataService.js";

const browseTeamTemplate = (hasUser, data) => html`
    <section id="browse">

        <article class="pad-med">
            <h1>Team Browser</h1>
        </article>

        ${hasUser ? html`
            <article class="layout narrow">
                <div class="pad-small"><a href="/create" class="action cta">Create Team</a></div>
            </article>` : nothing   
        }

        ${data.map(team => teamTemplate(team))}

    </section>
`;

const teamTemplate = (team) => html`
    <article class="layout">
        <img src="${team.logoUrl}" class="team-logo left-col">
        <div class="tm-preview">
            <h2>${team.name}</h2>
            <p>${team.description}</p>
            <span class="details">${team.memberCount} Members</span>
            <div><a href="/details/${team._id}" class="action">See details</a></div>
        </div>
    </article>
`;

export async function showBrowseTeamView(ctx)
{
    const hasUser = !!userUtils.getUserId();
    const data = await dataService.getAllTeams();

    const allMembers = await dataService.getAllMembers();

    data.forEach(team =>
    {
        const memberCount = getMemberCountByTeam(allMembers, team._id);
        team.memberCount = memberCount;
    }) 
    
    renderer(browseTeamTemplate(hasUser, data));
}

function getMemberCountByTeam(memberList, teamId)
{
    return memberList.filter(member => member.teamId === teamId && member.status === "member").length;
}