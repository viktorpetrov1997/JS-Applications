import { page } from "./library.js";
import { updateNav } from "./navigationControl.js";

function goTo(path)
{
    page.redirect(path);
}

export function decorateContext(ctx, next)
{
    ctx.goTo = goTo;
    ctx.updateNav = updateNav;
    next();
}