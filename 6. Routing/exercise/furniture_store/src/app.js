import page from "../node_modules/page/page.mjs";
import { userService } from "./service/userService.js";
import { showCreateView } from "./views/createView.js";
import { showDashboardView } from "./views/dashboardView.js";
import { showLoginView } from "./views/loginView.js";
import { showMyFurnitureView } from "./views/myFurnitureView.js";
import { showRegisterView } from "./views/registerView.js";
import { updateNav } from "./utility/navigationRender.js";
import { showDetailsView } from "./views/detailsView.js";
import { deleteItem } from "./views/deleteView.js";
import { showEditView } from "./views/editView.js";

page(decorateContext);
page("/", showDashboardView);
page("/dashboard", showDashboardView);
page("/create", showCreateView);
page("/my-furniture", showMyFurnitureView);
page("/login", showLoginView);
page("/register", showRegisterView);
page("/logout", onLogout);
page("/details/:id", showDetailsView);
page("/delete/:id", deleteItem);
page("/edit/:id", showEditView);

page.start();
updateNav();

function decorateContext(ctx, next)
{
    ctx.goTo = goTo;
    ctx.updateNav = updateNav;
    next();
}

function goTo(path)
{
    page.redirect(path);
}

async function onLogout(ctx)
{
    await userService.logout();

    ctx.updateNav();
    ctx.goTo("/dashboard");
}