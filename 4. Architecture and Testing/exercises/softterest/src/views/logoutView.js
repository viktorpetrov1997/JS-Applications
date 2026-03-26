import { userService } from "../api/userService.js";

export async function logout(ctx)
{
    await userService.logout();
    ctx.updateNav();
    ctx.goTo("/");
}