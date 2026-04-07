export const auth = 
{
    getToken()
    {
        return sessionStorage.getItem("accessToken");
    },

    getUserId()
    {
        return sessionStorage.getItem("userId");
    },

    setUser(user)
    {
        sessionStorage.setItem("accessToken", user.accessToken);
        sessionStorage.setItem("userId", user._id);
    },

    clearUser()
    {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userId");
    },

    isAuthenticated()
    {
        return !!this.getToken();
    }
}