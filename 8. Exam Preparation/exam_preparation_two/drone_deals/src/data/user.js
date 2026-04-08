import { get, post } from "./request.js";
import { clearUserData, setUserData } from "../utils/utils.js";

const endpoints =
{
    login: "/users/login",
    register: "/users/register",
    logout: "/users/logout"
}

async function login(email, password)
{
    const result = await post(endpoints.login, { email, password });

    const userData =
    {
        id: result._id,
        accessToken: result.accessToken
    }

    setUserData(userData);
}

async function register(email, password)
{
    const result = await post(endpoints.register, { email, password });

    const userData =
    {
        id: result._id,
        accessToken: result.accessToken
    }

    setUserData(userData);
}

async function logout()
{
    await get(endpoints.logout);
    clearUserData();
}

export const userService =
{
    login,
    register,
    logout
}

