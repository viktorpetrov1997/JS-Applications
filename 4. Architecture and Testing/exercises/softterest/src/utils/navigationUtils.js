import { userUtils } from "./userUtils.js";

export function updateNav()
{
    const hasUser = userUtils.hasUser();

    const userNav = document.querySelectorAll("a[data-nav='user']");
    const guestNav = document.querySelectorAll("a[data-nav='guest']");

    if(hasUser)
    {
        userNav.forEach(a => a.style.display = "block");
        guestNav.forEach(a => a.style.display = "none");
    }
    else
    {
        userNav.forEach(a => a.style.display = "none");
        guestNav.forEach(a => a.style.display = "block");
    }
}