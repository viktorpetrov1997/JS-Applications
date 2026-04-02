import { html, render } from "../../node_modules/lit-html/lit-html.js";
import { userService } from "../service/userService.js";

const root = document.querySelector("div.container");

const registerTemplate = () => html`
    <div class="row space-top">
        <div class="col-md-12">
            <h1>Register New User</h1>
            <p>Please fill all fields.</p>
        </div>
    </div>
    <form @submit=${onSubmit}>
        <div class="row space-top">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label" for="email">Email</label>
                    <input class="form-control" id="email" type="text" name="email">
                </div>
                <div class="form-group">
                    <label class="form-control-label" for="password">Password</label>
                    <input class="form-control" id="password" type="password" name="password">
                </div>
                <div class="form-group">
                    <label class="form-control-label" for="rePass">Repeat</label>
                    <input class="form-control" id="rePass" type="password" name="rePass">
                </div>
                <input type="submit" class="btn btn-primary" value="Register" />
            </div>
        </div>
    </form>
`;

let context = null;

export function showRegisterView(ctx)
{
    render(registerTemplate(), root);
    context = ctx;
}

async function onSubmit(e)
{ 
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password, rePass } = Object.fromEntries(formData);

    if(!email || !password || password !== rePass)
    {
        return alert("Error");
    }

    await userService.register({ email, password });

    context.updateNav();
    context.goTo("/dashboard");
}