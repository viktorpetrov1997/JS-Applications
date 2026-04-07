import { auth } from "../auth/authService.js";

export const navigation = () => 
{
    return {
        update()
        {
            const isAuthenticated = auth.isAuthenticated();
            const userNav = document.querySelector(".user");
            const guestNav = document.querySelector(".guest");

            if(isAuthenticated) 
            {
                userNav.style.display = "block";
                guestNav.style.display = "none";
            }
            else 
            {
                userNav.style.display = "none";
                guestNav.style.display = "block";
            }
        }
    };
}