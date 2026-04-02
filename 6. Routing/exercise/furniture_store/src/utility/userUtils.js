function storeUserData(data) 
{
    const id = data._id;
    const accessToken = data.accessToken;

    sessionStorage.setItem("userData", JSON.stringify({ id, accessToken }));
}

function getUserData()
{
    return JSON.parse(sessionStorage.getItem("userData"));
}

function getUserId()
{
    return getUserData()?.id;
}

function getAccessToken()
{
    return getUserData()?.accessToken;
}

function clearUserData() 
{
    sessionStorage.removeItem("userData");
}

export const userUtils =
{
    storeUserData,
    getUserId,
    getAccessToken,
    clearUserData
}