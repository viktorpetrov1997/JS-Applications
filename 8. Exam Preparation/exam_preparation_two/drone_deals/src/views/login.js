import { html, page } from "../lib.js";
import { userService } from "../data/user.js";
import { updateNav } from "../utils/navigation.js";

const loginTemplate = () => html`
    <section id="login">
        <div class="form">
            <h2>Login</h2>
            <form class="login-form" @submit=${onSubmit}>
                <input type="text" name="email" id="email" placeholder="email" />
                <input type="password" name="password" id="password" placeholder="password" />
                <button type="submit">login</button>
                <p class="message">
                    Not registered? <a href="/register">Create an account</a>
                </p>
            </form>
        </div>
    </section>
`;

export function showLoginView(ctx)
{
    ctx.render(loginTemplate());
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData);

    if(!email || !password)
    {
        return alert("error");
    }

    await userService.login(email, password);
    updateNav();
    page.redirect("/");
}