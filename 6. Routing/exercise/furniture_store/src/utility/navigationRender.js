import { html, render } from "../../node_modules/lit-html/lit-html.js";
import { userUtils } from "./userUtils.js";

const navigationBar = document.querySelector("nav");

// This is a way of updating the navigation bar when we use page.js and lit-html together
// instead of writing a function to show and hide the user and guest part of the nav bar the old way
// in previous exercises

const navigationTemplate = (userData) => html`
        <a id="catalogLink" href="/dashboard" >Dashboard</a>
            ${userData ? userTemplate() : guestTemplate()}
`;

// We seperated the user and guest part of the nav bar into two different templates
// because it gets messy to put them into one only

const userTemplate = () => html`
    <div id="user">
        <a id="createLink" href="/create">Create Furniture</a>
        <a id="profileLink" href="/my-furniture" >My Publications</a>
        <a id="logoutBtn" href="/logout">Logout</a>
    </div>   
`;

const guestTemplate = () => html`
    <div id="guest">
        <a id="loginLink" href="/login">Login</a>
        <a id="registerLink" href="/register">Register</a>
    </div>   
`;

export function updateNav()
{
    const userData = userUtils.getUserId();

    render(navigationTemplate(userData), navigationBar);
}