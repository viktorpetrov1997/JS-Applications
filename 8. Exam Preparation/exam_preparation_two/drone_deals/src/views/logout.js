import { userService } from "../data/user.js";
import { page } from "../lib.js";
import { updateNav } from "../utils/navigation.js";

export async function logout(ctx)
{
    await userService.logout();
    updateNav();
    page.redirect("/");
}