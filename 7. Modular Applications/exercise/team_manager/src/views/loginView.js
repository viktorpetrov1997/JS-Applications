import { html, nothing, renderer } from "../utility/library.js";
import { createSubmitHandler } from "../utility/createSubmitHandler.js";
import { userService } from "../service/userService.js";

const loginTemplate = (handler, error) => html`
    <section id="login">
    <article class="narrow">
        <header class="pad-med">
            <h1>Login</h1>
        </header>
        <form id="login-form" class="main-form pad-large" @submit=${handler}>
            ${Boolean(error) ? html` <div class="error">${error.message}</div>` : nothing}
            <label>E-mail: <input type="text" name="email"></label>
            <label>Password: <input type="password" name="password"></label>
            <input class="action cta" type="submit" value="Sign In">
        </form>
        <footer class="pad-small">Don't have an account? <a href="#" class="invert">Sign up here</a>
        </footer>
    </article>
</section>
`;

let context = null;

export function showLoginView(ctx)
{
    renderer(loginTemplate(createSubmitHandler(onSubmit)));
    context = ctx;
}

async function onSubmit(data)
{
    const { email, password } = data;

    if(!email || !password)
    {
        return renderer(loginTemplate(createSubmitHandler(onSubmit), { message: "All fields are required!" }));
    }
    
    await userService.login({ email, password });

    context.goTo("/myTeams");
    context.updateNav();
}