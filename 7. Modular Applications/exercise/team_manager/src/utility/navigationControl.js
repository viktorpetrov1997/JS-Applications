import { userUtils } from "./userUtil.js";
import { html, render } from "./library.js";

const root = document.querySelector("nav");

const navigationBarTemplate = (hasUser) => html`
      ${hasUser ? 
        html`
            <a href="/browseTeam" class="action">Browse Teams</a>
            <a href="/myTeams" class="action">My Teams</a>
            <a href="/logout" class="action">Logout</a>
        `: 
        html`
            <a href="/browseTeam" class="action">Browse Teams</a>
            <a href="/login" class="action">Login</a>
            <a href="/register" class="action">Register</a>
        `}
`;

export function updateNav()
{
    const user = userUtils.getUserId();

    render(navigationBarTemplate(!!user), root);
}