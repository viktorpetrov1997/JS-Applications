import { html, page } from "../utility/library.js";
import { userService } from "../service/userService.js";
import { updateNav } from "../utility/navigation.js";

const registerTemplate = () => html`
    <section id="register">
        <div class="form">
            <img class="border" src="./images/border.png" alt="" />
            <h2>Register</h2>
            <form class="register-form" @submit=${onSubmit}>
                <input type="text" name="email" id="register-email" placeholder="email" />
                <input type="password" name="password" id="register-password" placeholder="password" />
                <input type="password" name="re-password" id="repeat-password" placeholder="repeat password" />
                <button type="submit">register</button>
                <p class="message">Already registered? <a href="#">Login</a></p>
            </form>
        </div>
    </section>
`;

export function showRegisterView(ctx)
{
    ctx.render(registerTemplate());
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password, ["re-password"] : rePassword } = Object.fromEntries(formData);

    if(!email || !password)
    {
        return alert("All fields are required!");
    }

    if(password !== rePassword)
    {
        return alert("Passwords don't match!");
    }

    await userService.register({ email, password });
    updateNav();
    page.redirect("/");
}