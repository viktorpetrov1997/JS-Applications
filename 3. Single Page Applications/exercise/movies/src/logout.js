import { updateNav } from "./app.js";
import { showLoginView } from "./loginView.js";
import { userService } from "./userService.js";
import { userUtils } from "./userUtils.js";

export async function logout()
{
    await userService.logout();
    userUtils.clearUserData();
    showLoginView();
    updateNav();
}