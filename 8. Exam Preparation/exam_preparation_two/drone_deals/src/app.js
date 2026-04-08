import { page } from "./lib.js";
import { addRender } from "./utils/render.js";

import { homeView } from "./views/home.js";
import { showLoginView } from "./views/login.js";
import { showRegisterView } from "./views/register.js";
import { logout } from "./views/logout.js";
import { updateNav } from "./utils/navigation.js";
import { showDashboardView } from "./views/dashboard.js";
import { showDetailsView } from "./views/details.js";
import { showCreateView } from "./views/create.js";
import { deleteHandler } from "./views/delete.js";
import { showEditView } from "./views/edit.js";
import { showNotification } from "./utils/notification.js";

page(addRender);

page("/", homeView);
page("/login", showLoginView);
page("/register", showRegisterView);
page("/logout", logout);
page("/dashboard", showDashboardView);
page("/details/:id", showDetailsView);
page("/create", showCreateView);
page("/delete/:id", deleteHandler);
page("/edit/:id", showEditView);

page.start();
updateNav();