import { showCreateView } from "./createMovieView.js";
import { showHome } from "./homeView.js";
import { showLoginView } from "./loginView.js";
import { logout } from "./logout.js";
import { showRegisterView } from "./registerView.js";
import { userUtils } from "./userUtils.js";

document.querySelectorAll("section").forEach(section => section.style.display = "none");
document.querySelector("nav").addEventListener("click", onNavigate);

showHome();
updateNav();

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

export function updateNav() 
{
    const userData = userUtils.getUserData();

    const userElements = document.querySelectorAll(".nav-item.user");
    const guestElements = document.querySelectorAll(".nav-item.guest");

    if(userData) 
    {
        userElements.forEach(e => e.style.display = "block");
        guestElements.forEach(e => e.style.display = "none");

        document.getElementById("welcome-msg").textContent =
            `Welcome, ${userData.email}`;
    } 
    else 
    {
        userElements.forEach(e => e.style.display = "none");
        guestElements.forEach(e => e.style.display = "block");
    }
}