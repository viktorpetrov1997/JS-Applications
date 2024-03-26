import { baseUrl } from "./config.js";

function register() 
{   
    const buttonElem = document.querySelector("button");
    const formElem = document.querySelector("form");
    const notificationParagraphElem = document.getElementsByClassName("notification")[0];
    
    buttonElem.addEventListener("click", onRegister);
    
    async function onRegister(event)
    {
        event.preventDefault();
        
        const formData = new FormData(formElem);
        const email = formData.get("email");
        const password = formData.get("password");
        const rePass = formData.get("rePass");
        
        if(!email)
        {
            notificationParagraphElem.textContent = "Email is required!";
        } 
        else if(!password) 
        {
            notificationParagraphElem.textContent = "Password is required!";
        } 
        else if(password !== rePass) 
        {
            notificationParagraphElem.textContent = "Password and Repeat must match!";
        }
        
        if(email && password && rePass) 
        {
            try 
            {
                const response = await fetch("http://localhost:3030/users/register", 
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify({ email, password }),
                });
                
                if(!response.ok) 
                {
                    const err = new Error(response.statusText);
                    throw err;
                }
                
                const data = await response.json();
                
                sessionStorage.setItem("accessToken", data.accessToken);
                sessionStorage.setItem("loggedUser", data.email);
                sessionStorage.setItem("id", data._id);
                window.location = "index.html";
            }
            catch(err) 
            {
                notificationParagraphElem.textContent = err.message;
            }
        }
    }
    
    const accessToken = sessionStorage.getItem("accessToken");
    
    if(accessToken) 
    {
        document.getElementById("logout").style.display = "inline";
    } 
    else
    {
        document.getElementById("logout").style.display = "none";
    }
}

register();
