import { userUtils } from "./userUtils.js";

const hostname = "http://localhost:3030";

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
        const response = await fetch(hostname + url, option);

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
        alert(error.message);
    }
}

const get = (url) => requester("get", url);
const post = (url, data) => requester("post", url, data);
const put = (url, data) => requester("put", url, data);
const del = (url) => requester("delete", url);

export const api =
{
    get,
    post,
    put,
    del
}