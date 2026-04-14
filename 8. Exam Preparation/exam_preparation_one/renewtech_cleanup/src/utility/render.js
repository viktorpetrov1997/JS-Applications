import { render } from "./library.js";

const root = document.querySelector("main");

export function addRender(ctx, next)
{
    ctx.render = (templateResult) => render(templateResult, root);

    next();
}