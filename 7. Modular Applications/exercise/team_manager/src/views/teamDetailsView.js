import { html, renderer } from "../utility/library.js";

const teamDetailsTemplate = () => html`
    <section id="team-home">
    <article class="layout">
        <img src="./assets/rocket.png" class="team-logo left-col">
        <div class="tm-preview">
            <h2>Team Rocket</h2>
            <p>Gotta catch 'em all!</p>
            <span class="details">3 Members</span>
            <div>
                <a href="#" class="action">Edit team</a>
                <a href="#" class="action">Join team</a>
                <a href="#" class="action invert">Leave team</a>
                Membership pending. <a href="#">Cancel request</a>
            </div>
        </div>
        <div class="pad-large">
            <h3>Members</h3>
            <ul class="tm-members">
                <li>My Username</li>
                <li>James<a href="#" class="tm-control action">Remove from team</a></li>
                <li>Meowth<a href="#" class="tm-control action">Remove from team</a></li>
            </ul>
        </div>
        <div class="pad-large">
            <h3>Membership Requests</h3>
            <ul class="tm-members">
                <li>John<a href="#" class="tm-control action">Approve</a><a href="#"
                        class="tm-control action">Decline</a></li>
                <li>Preya<a href="#" class="tm-control action">Approve</a><a href="#"
                        class="tm-control action">Decline</a></li>
            </ul>
        </div>
    </article>
</section>
`;

export function showTeamDetailsView(ctx)
{
    renderer(teamDetailsTemplate());
}