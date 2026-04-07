import { html, render } from "../../node_modules/lit-html/lit-html.js";
import { navigation } from "../navigation/navigation.js";
import { auth } from "../auth/authService.js";
import { api } from "../api/api.js";
import page from "../../node_modules/page/page.mjs";

export const loginTemplate = (onSubmit) =>
{
    return html`
        <section id="login">
            <div class="form">
                <img class="border" src="./images/border.png" alt="" />
                <h2>Login</h2>
                <form class="login-form" @submit=${onSubmit}>
                    <input type="text" name="email" id="email" placeholder="email" />
                    <input type="password" name="password" id="password" placeholder="password" />
                    <button type="submit">login</button>
                    <p class="message">
                        Not registered? <a href="#">Create an account</a>
                    </p>
                </form>
            </div>
        </section>
    `;
}

async function handleSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const email = formData.get("email");
    const password = formData.get("password");

    if(!email || !password)
    {
        window.alert("All fields are required!");
        return;
    }

    try 
    {
        const result = await api.post("/users/login", { email, password });
        auth.setUser(result);
        navigation().update();
        page("/");
    } 
    catch(error) 
    {
        window.alert(error.message);
    }
}

export const showLogin = () =>
{
    const main = document.querySelector("main");
    render(loginTemplate(handleSubmit), main);
    navigation().update();
}

