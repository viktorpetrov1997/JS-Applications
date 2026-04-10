import { page } from "./utility/library.js";
import { addRender } from "./utility/render.js";
import { updateNav } from "./utility/navigation.js";
import { showHomeView } from "./views/homeView.js";
import { showLoginView } from "./views/loginView.js";
import { showRegisterView } from "./views/registerView.js";
import { logout } from "./views/logout.js";
import { showDashboardView } from "./views/dashboardView.js";
import { showCreateView } from "./views/createView.js";
import { showDetailsView } from "./views/detailsView.js";
import { showEditView } from "./views/editView.js";
import { deleteHandler } from "./views/delete.js";

page(addRender);
page("/", showHomeView);
page("/login", showLoginView);
page("/register", showRegisterView);
page("/logout", logout);
page("/dashboard", showDashboardView);
page("/create", showCreateView);
page("/details/:id", showDetailsView);
page("/edit/:id", showEditView);
page("/delete/:id", deleteHandler);

page.start();
updateNav();

