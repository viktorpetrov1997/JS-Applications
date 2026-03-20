import { showCreateView } from "./createMovieView.js";
import { showHome } from "./homeView.js";
import { showLoginView } from "./loginView.js";
import { logout } from "./logout.js";
import { showRegisterView } from "./registerView.js";

document.querySelectorAll("section").forEach(section => section.style.display = "none");
document.querySelector("nav").addEventListener("click", onNavigate);

showHome();

const routes =
{
    "/": showHome,
    "/home": showHome,
    "/login": showLoginView,
    "/register": showRegisterView,
    "/logout": logout,
    "/create": showCreateView
}

function onNavigate(e)
{
    const el = e.target;

    if(el.tagName !== "A" || el.href === "") // Here we are checking if we are clicking on an <a> element
    {
        return;
    }

    e.preventDefault();

    const path = new URL(el.href).pathname;
    routes[path]();
}