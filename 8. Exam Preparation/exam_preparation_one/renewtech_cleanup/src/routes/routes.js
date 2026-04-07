import { navigation } from "../navigation/navigation.js";
import page from "../../node_modules/page/page.mjs";
import { showHome } from "../views/homeView.js";
import { showLogin } from "../views/loginView.js";
import { showRegister } from "../views/registerView.js";
import { auth } from "../auth/authService.js";
import { api } from "../api/api.js";

async function handleLogout()
{
    try
    {
        await api.authenticatedGet("/users/logout");
        auth.clearUser();
        navigation().update();
        page.redirect("/");
    }
    catch(error)
    {
        window.alert(error.message);
    }
}

function setupNavigation()
{
    document.addEventListener("click", (e) =>
    {
        if(e.target.closest("#logo"))
        {
            e.preventDefault();

            page.redirect("/");
        }
        else if(e.target.closest("nav div a")?.textContent === "Solutions")
        {
            e.preventDefault();

            page.redirect("/solutions");
        }
        else if(e.target.closest(".user a")?.textContent === "Add Solution")
        {
            e.preventDefault();

            page.redirect("/create");
        }
        else if(e.target.closest(".user a")?.textContent === "Logout")
        {
            e.preventDefault();

            handleLogout();

        }
        else if(e.target.closest(".guest a")?.textContent === "Login")
        {
            e.preventDefault();

            page.redirect("/login");
        }
        else if(e.target.closest(".guest a")?.textContent === "Register")
        {
            e.preventDefault();

            page.redirect("/register");
        }
    })
}

export function initRoutes()
{
    page("/", showHome);
    page("/login", showLogin);
    page("/register", showRegister);
    
    setupNavigation();
    navigation().update();

    page.start();
}