function register()
{
    const URL = "http://localhost:3030/users/register";

    document.querySelector("form").addEventListener("submit", onSubmit);

    function onSubmit(e)
    {
        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get("email");
        const password = formData.get("password");
        const rePass = formData.get("rePass");

        if(!email || !password || !rePass || rePass !== password)
        {
            alert("Oooooooops Error!");
            return;
        }

        createUser({ email, password });
    }

    async function createUser(data)
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