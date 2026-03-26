import { userUtils } from "../utils/userUtils.js";
import { api } from "./requester.js";

const endpoint = 
{
    login: "http://localhost:3030/users/login",
    register: "http://localhost:3030/users/register",
    logout: "http://localhost:3030/users/logout"
}

async function register(data)
{
    const userData = await api.post(endpoint.register, data);
    userUtils.storeUserData(userData);
}

async function login(data)
{
    const userData = await api.post(endpoint.login, data);
    userUtils.storeUserData(userData);
}

async function logout(dta)
{
    await api.get(endpoint.logout);
    userUtils.clear();
}

export const userService =
{
    register,
    login,
    logout
}