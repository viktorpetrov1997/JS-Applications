import { showHome } from "./topicView.js";

document.querySelector("nav").addEventListener("click", onNavigate);

showHome();

const routes =
{
    "/": showHome
}

function onNavigate(e)
{
    const el = e.target;

    if(el.tagName !== "A") // Here we are checking if we are clicking on an <a> element
    {
        return;
    }
    
    e.preventDefault();

    const path = new URL(el.href).pathname;
    routes[path]();
}

