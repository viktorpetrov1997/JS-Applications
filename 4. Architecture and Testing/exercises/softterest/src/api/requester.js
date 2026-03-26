import { userUtils } from "../utils/userUtils.js";

async function requester(method, endpoint, data)
{
    const option =
    {
        method: method,
        headers:
        {
            "Content-Type": "application/json"
        }
    }

    const accessToken = userUtils.getAccessToken();

    if(accessToken)
    {
        option.headers["X-Authorization"] = accessToken;
    }

    if(data)
    {
        option.body = JSON.stringify(data);
    }

    try
    {
        const response = await fetch(endpoint, option);

        if(!response.ok)
        {
            if(response.status === 403)
            {

            }
            const error = response.json();
            throw new Error(error.message);
        }
        else if(response.status === 204)
        {
            return response;
        }

        return response.json();
    }
    catch(error)
    {
        alert(error);
    }
}

function get(endpoint)
{
    return requester("GET", endpoint);
}

function post(endpoint, data)
{
    return requester("POST", endpoint, data);
}

function update(endpoint, data)
{
    return requester("PUT", endpoint, data);
}

function del(endpoint)
{
    return requester("DELETE", endpoint);
}

export const api =
{
    get,
    post,
    update,
    del
}