import { html, renderer } from "../utility/library.js";
import { createSubmitHandler } from "../utility/createSubmitHandler.js";

const registerTemplate = (handler) => html`
    <section id="register">
    <article class="narrow">
        <header class="pad-med">
            <h1>Register</h1>
        </header>
        <form id="register-form" class="main-form pad-large" @submit=${handler}>
            <div class="error">Error message.</div>
            <label>E-mail: <input type="text" name="email"></label>
            <label>Username: <input type="text" name="username"></label>
            <label>Password: <input type="password" name="password"></label>
            <label>Repeat: <input type="password" name="repass"></label>
            <input class="action cta" type="submit" value="Create Account">
        </form>
        <footer class="pad-small">Already have an account? <a href="#" class="invert">Sign in here</a>
        </footer>
    </article>
</section>
`;

export function showRegisterView(ctx)
{
    renderer(registerTemplate(createSubmitHandler(onSubmit)));
}

async function onSubmit(data)
{
    const { email, username, password, rePass } = data;

    if(!email || password.length < 3 || password !== rePass || !username)
    {
        return renderer(registerTemplate(createSubmitHandler(onSubmit), { message: "All fields are required!" }));
    }
}