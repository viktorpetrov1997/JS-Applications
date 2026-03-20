import { userService } from "./userService.js";
import { userUtils } from "./userUtils.js";
import { showHome } from "./homeView.js";

const section = document.querySelectorAll("section");
const loginSection = document.getElementById("form-login");

export function showLoginView()
{
   section.forEach(section => section.style.display = "none");
   loginSection.style.display = "block";
}

document.getElementById("form-login").addEventListener("submit", onSubmit);

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData);

    if(!email || !password)
    {
        return;
    }

    const userData = await userService.login({ email, password });

    userUtils.saveUserData(userData);

    showHome();
}