import { userService } from "./userService.js";
import { userUtils } from "./userUtils.js";
import { showHome } from "./homeView.js";

const section = document.querySelectorAll("section");
const registerSection = document.getElementById("form-sign-up");

document.getElementById("register-form").addEventListener("submit", onSubmit);

export function showRegisterView()
{
    section.forEach(section => section.style.display = "none");
    registerSection.style.display = "block";
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password, repeatPassword } = Object.fromEntries(formData);

    if(!email || password.length < 6 || password !== repeatPassword)
    {
        return;
    }

    const userData = await userService.register({ email, password });

    userUtils.saveUserData(userData);

    showHome();
}