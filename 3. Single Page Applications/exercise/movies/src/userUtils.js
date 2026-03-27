function saveUserData(userData)
{
    const accessToken = userData.accessToken;
    const email = userData.email;
    const id = userData._id;

    sessionStorage.setItem("userData", JSON.stringify({ accessToken, email, id }));
}

function getUserData()
{
    return JSON.parse(sessionStorage.getItem("userData"));
}

function clearUserData()
{
    sessionStorage.removeItem("userData");
}

function getId()
{
    const userData = getUserData();
    return userData.id;
}

function isOwner(itemId)
{
    return itemId === getId();
}

export const userUtils =
{
    saveUserData, 
    getUserData,
    clearUserData, 
    getId,
    isOwner
}