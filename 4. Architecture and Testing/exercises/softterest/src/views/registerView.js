import { userService } from "../api/userService.js";

const registerSection = document.querySelector("div[data-section='register']");
const main = document.querySelector("main");

let context = null;

export function showRegisterView(ctx)
{
    context = ctx;

    main.replaceChildren(registerSection);

    document.querySelector("form").addEventListener("submit", onSubmit);
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password, repeatPassword } = Object.fromEntries(formData);

    if(email.length < 3 || password.length < 3 || password !== repeatPassword)
    {
        return;
    }

    await userService.register({ email, password });

    context.updateNav();
    context.goTo("/");
}

