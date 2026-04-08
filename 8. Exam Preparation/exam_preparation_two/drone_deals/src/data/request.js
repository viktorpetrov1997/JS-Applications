import { getUserData,clearUserData } from "../utils/utils.js";
import { showNotification } from "../utils/notification.js";

const hostname = "http://localhost:3030";

async function request(method, url, data)
{
    const options =
    {
        method: method,
        headers: {}
    }

    if(data != undefined)
    {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const userData = getUserData();
    
    if(userData)
    {
        options.headers["X-Authorization"] = userData.accessToken;
    }

    try
    {
        const res = await fetch(hostname + url, options);

        if(!res.ok) 
        {
            const error = await res.json();

            if(error.message == "Invalid access token") 
            {
                clearUserData();
            }

            throw new Error(error.message);
        }

        if(res.status == 204) 
        {
            return res;
        }

        return res.json();
    }
    catch(error)
    {
        showNotification(error);
    }
}

export const get = (url) => request("get", url);
export const post = (url, data) => request("post", url, data);
export const put = (url, data) => request("put", url, data);
export const del = (url) => request("delete", url);