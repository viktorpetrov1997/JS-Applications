let button = document.querySelector("#load");

button.addEventListener("click", function () 
{
    let url = "https://api.github.com/users/testnakov/repos";

    fetch(url)
        .then(response => response.text())
        .then(data => 
        {
            document.getElementById("res").textContent = data;
        })
        .catch(error => console.log(error));
});