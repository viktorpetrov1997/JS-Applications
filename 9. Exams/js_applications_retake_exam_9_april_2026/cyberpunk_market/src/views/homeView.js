import { html } from "../utility/library.js";

const homeTemplate = () => html`
    <section id="hero">
        <img src="./images/home.png" alt="home" />
        <p>We know who you are, we will contact you</p>
    </section>
`;

export function showHomeView(ctx)
{
    ctx.render(homeTemplate());
}