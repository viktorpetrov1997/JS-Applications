import { page } from "../utility/library.js";
import { userService } from "../service/userService.js";
import { updateNav } from "../utility/navigation.js";

export async function logout(ctx)
{
    await userService.logout();
    updateNav();
    page.redirect("/");
}