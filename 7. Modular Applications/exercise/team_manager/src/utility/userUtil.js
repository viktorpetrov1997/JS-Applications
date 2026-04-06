function storeUserData(userData)
{
    const userId = userData._id;
    const accessToken = userData.accessToken;
    sessionStorage.setItem("userData", JSON.stringify({ userId, accessToken }));
}

function getUserId()
{
    const userData = sessionStorage.getItem("userData");
    const userId = userData && JSON.parse(userData).userId;
    return userId;
}

function getAccessToken()
{
    const userData = sessionStorage.getItem("userData");
    const accessToken = userData && JSON.parse(userData).accessToken;
    return accessToken;
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