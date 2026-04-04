import { userUtils } from "../utility/userUtil.js";
import { api } from "./requester.js";

const endPoints =
{
    register: "http://localhost:3030/users/register",
    login: "http://localhost:3030/users/login",
    logout: "http://localhost:3030/users/logout"
}

async function login(data)
{
    const userData = await api.post(endPoints.login, data);
    return userUtils.storeUserData(userData);
}

async function register(data)
{
   const userData = await api.post(endPoints.register, data);
   return userUtils.storeUserData(userData);
}

async function logout()
{
    await api.get(endPoints.logout);
    return userUtils.clearUserData();
}

export const userService = 
{
    login,
    register,
    logout
}