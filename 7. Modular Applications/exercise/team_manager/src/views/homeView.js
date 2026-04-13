import { html, nothing, renderer } from "../utility/library.js";
import { userUtils } from "../utility/userUtil.js";

const homeTemplate = (hasUser) => html`
    <section id="home">
        <article class="hero layout">
            <img src="./assets/team.png" class="left-col pad-med">
            <div class="pad-med tm-hero-col">
                <h2>Welcome to Team Manager!</h2>
                <p>Want to organize your peers? Create and manage a team for free.</p>
                <p>Looking for a team to join? Browse our communities and find like-minded people!</p>
                ${!hasUser ? html` 
                    <a href="/register" class="action cta">Sign Up Now</a>` : nothing}
                    <a href="/browseTeam" class="action cta">Browse Teams</a>
            </div>
        </article>
    </section>
`;

export async function showHomeView(ctx)
{
    const hasUser = userUtils.getUserId();
    renderer(homeTemplate(hasUser));
}

