import { api } from "../utility/requester.js";
import { userUtils } from "../utility/userUtils.js";

const endPoints =
{
    register: "/users/register",
    login: "/users/login",
    logout: "/users/logout"
}

async function login(data)
{
    const userData = await api.post(endPoints.login, data);
    userUtils.storeUserData(userData);
}

async function register(data)
{
    const userData = await api.post(endPoints.register, data);
    userUtils.storeUserData(userData);
}

async function logout()
{
    await api.get(endPoints.logout);
    userUtils.clearUserData();
}

export const userService =
{
    login,
    register,
    logout
}