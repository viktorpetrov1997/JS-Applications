import { html, render } from "../../node_modules/lit-html/lit-html.js";
import page from "../../node_modules/page/page.mjs";

const root = document.querySelector("main");

function renderer(template)
{
    render(template, root);
}

export
{
    html,
    renderer,
    page
}