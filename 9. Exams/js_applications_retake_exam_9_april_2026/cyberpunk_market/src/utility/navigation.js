import { html, render } from "./library.js";
import { userUtils } from "./userUtils.js";

const root = document.querySelector("nav");

const navigationTemplate = (hasUser) => html`
    <div>
        <a href="/dashboard">Market</a>
    </div>

    ${hasUser ? html` 
    <div class="user">
        <a href="/create">Sell</a>
        <a href="/logout">Logout</a>
    </div> `
    :
    html`
    <div class="guest">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    </div>`}
`;

export function updateNav()
{   
    const userData = userUtils.getUserData();

    render(navigationTemplate(!!userData), root);
}