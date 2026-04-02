import { userUtils } from "./userUtils.js";

async function requester(method, url, data)
{
    const option =
    {
        method: method,
        headers: {}
    }

    const accessToken = userUtils.getAccessToken();

    if(accessToken)
    {
        option.headers["X-Authorization"] = accessToken;
    }

    if(data)
    {
        option.headers["Content-Type"] = "application/json";
        option.body = JSON.stringify(data);
    }

    try 
    {
        const response = await fetch(url, option);

        if(!response.ok)
        {
            const err = await response.json();
            throw new Error(err);
        }

        if(response.status === 204)
        {
            return response;
        }

        return await response.json();
    } 
    catch(error) 
    {
        alert(error);
    }
}

async function get(url)
{
    return requester("GET", url);
}

async function post(url, data)
{
    return requester("POST", url, data);
}

async function put(url, data)
{
    return requester("PUT", url, data);
}

async function del(url)
{
    return requester("DELETE", url);
}

export const api =
{
    get,
    post,
    put,
    del
}