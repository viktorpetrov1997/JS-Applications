import { auth } from "../auth/authService.js";

const API_BASE_URL = "http://localhost:3030";

async function request(url, options = {})
{
    const response = await fetch(API_BASE_URL + url,
    {
        ...options,
        headers:
        {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if(response.status === 204)
    {
        return null;
    }

    const data = await response.json();

    if(!response.ok)
    {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const api =
{
    async get(url)
    {
        return request(url, { method: "GET" });
    },

    async post(url, data)
    {
        return request(url, { method: "POST", body: JSON.stringify(data) });
    },

    async authenticatedGet(url)
    {
        const token = auth.getToken();

        if(!token)
        {
            throw new Error("Unauthorized");
        }

        return request(url, { method: "GET", headers: 
        {
            "X-Authorization": token
        }});
    },

    async authenticatedPost(url, data)
    {
        const token = auth.getToken();

        if(!token)
        {
            throw new Error("Unauthorized");
        }

        return request(url, { method: "POST", body: JSON.stringify(data), headers: 
        {
            "X-Authorization": token
        }});
    },

    async authenticatedPut(url, data)
    {
        const token = auth.getToken();

        if(!token)
        {
            throw new Error("Unauthorized");
        }

        return request(url, { method: "PUT", body: JSON.stringify(data), headers: 
        {
            "X-Authorization": token
        }});
    },

    async authenticatedDelete(url)
    {
        const token = auth.getToken();

        if(!token)
        {
            throw new Error("Unauthorized");
        }

        return request(url, { method: "DELETE", headers: 
        {
            "X-Authorization": token
        }});
    },
}