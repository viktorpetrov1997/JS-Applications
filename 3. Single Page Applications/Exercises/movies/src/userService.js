import { api } from "./requester.js";

const endPoints =
{
    login: "http://localhost:3030/users/login",
    register: "http://localhost:3030/users/register",
    logout: "http://localhost:3030/users/logout"
};

function register(data)
{
    return api.post(endPoints.register, data);
}

function login(data)
{
    return api.post(endPoints.login, data);
}

function logout()
{
    return api.get(endPoints.logout);
}

export const userService =
{
    register,
    login,
    logout
}