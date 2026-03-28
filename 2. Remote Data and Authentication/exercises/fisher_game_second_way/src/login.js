function register()
{
    const URL = "http://localhost:3030/users/login";

    document.querySelector("form").addEventListener("submit", onSubmit);

    function onSubmit(e)
    {
        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get("email");
        const password = formData.get("password");

        if(!email || !password)
        {
            alert("Oooooooops Error!");
            return;
        }

        onLogin({ email, password });
    }

    async function onLogin(data)
    {
        const options =
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        const response = await fetch(URL, options);

        if(response.status !== 200)
        {
            return;
        }

        const userData = await response.json();
        
        sessionStorage.setItem("userData", JSON.stringify(userData));

        window.location = "index.html";
    }
}

register();