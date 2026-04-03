import { html, renderer } from "../utility/library.js";

const browseTeamTemplate = () => html`
    <section id="browse">

    <article class="pad-med">
        <h1>Team Browser</h1>
    </article>

    <article class="layout narrow">
        <div class="pad-small"><a href="/create" class="action cta">Create Team</a></div>
    </article>

    <article class="layout">
        <img src="./assets/atat.png" class="team-logo left-col">
        <div class="tm-preview">
            <h2>Storm Troopers</h2>
            <p>These ARE the droids we're looking for</p>
            <span class="details">5000 Members</span>
            <div><a href="#" class="action">See details</a></div>
        </div>
    </article>

    <article class="layout">
        <img src="./assets/rocket.png" class="team-logo left-col">
        <div class="tm-preview">
            <h2>Team Rocket</h2>
            <p>Gotta catch 'em all!</p>
            <span class="details">3 Members</span>
            <div><a href="#" class="action">See details</a></div>
        </div>
    </article>

    <article class="layout">
        <img src="./assets/hydrant.png" class="team-logo left-col">
        <div class="tm-preview">
            <h2>Minions</h2>
            <p>Friendly neighbourhood jelly beans, helping evil-doers succeed.</p>
            <span class="details">150 Members</span>
            <div><a href="/details/id" class="action">See details</a></div>
        </div>
    </article>

</section>
`;

export function showBrowseTeamView(ctx)
{
    renderer(browseTeamTemplate());
}