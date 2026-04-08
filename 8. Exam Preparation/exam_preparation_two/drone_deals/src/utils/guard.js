import { getUserData } from "./utils.js";

export function hasUser(ctx, next)
{
    const userData = getUserData();

    if(!userData)
    {
        ctx.page.redirect("/login");
        return;
    }

    next();
}