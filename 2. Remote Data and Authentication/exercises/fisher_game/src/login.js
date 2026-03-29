function login() 
{
    const accessToken = sessionStorage.getItem("accessToken");
    if(accessToken) 
    {
        document.getElementById("logout").style.display = "inline";
    } 
    else 
    {
        document.getElementById("logout").style.display = "none";
    }
    
    const buttonElem = document.querySelector("button");
    const formElem = document.querySelector("form");
    const notificationParagraphElem = document.getElementsByClassName("notification")[0];
    
    buttonElem.addEventListener("click", onLogin);
    
    async function onLogin(event) 
    {
        event.preventDefault();
        const formData = new FormData(formElem);
        const email = formData.get("email");
        const password = formData.get("password");
        
        if(!email) 
        {
            notificationParagraphElem.textContent = "Email is required!";
        } 
        else if(!password) 
        {
            notificationParagraphElem.textContent = "Password is required!";
        }
        
        if(email && password) 
        {
            try 
            {
                const response = await fetch("http://localhost:3030/users/login", 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json",
                    },
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
}

login();
