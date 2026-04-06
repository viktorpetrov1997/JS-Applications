import { userService } from "../service/userService.js";

export async function logout(ctx)
{
    await userService.logout();
    ctx.updateNav();
    ctx.goTo("/");
}