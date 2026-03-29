function solve() 
{
    const registerButton = document.querySelectorAll("button")[0];
    const registerForm = document.querySelectorAll("form")[0];
    
    registerButton.addEventListener("click", onRegister);

    async function onRegister(event)
    {
        event.preventDefault();
        
        const formData = new FormData(registerForm);
        const email = formData.get("email");
        const password = formData.get("password");
        const rePass = formData.get("rePass");
        
        if(email && password && rePass && password == rePass) 
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
                window.location = "homeLogged.html";
            }
            catch(err) 
            {
                alert(err.message);
            }
        }
    }

    const loginButton = document.querySelectorAll("button")[1];
    const loginForm = document.querySelectorAll("form")[1];
    
    loginButton.addEventListener("click", onLogin);

    async function onLogin(event)
    {
        event.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get("email");
        const password = formData.get("password");
        
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
                window.location = "homeLogged.html";
            } 
            catch(err) 
            {
                alert(err.message);
            }
        }
    }

    let logOutButton = document.getElementById("logoutBtn");
    logOutButton.addEventListener("click", onLogOut);

    async function onLogOut() 
    {
        const accessToken = sessionStorage.getItem("accessToken");
        await fetch(`http://localhost:3030/users/logout`, 
        {
            method: "GET",
            headers: 
            {
                "X-Authorization": accessToken,
            },
        });
        
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("loggedUser");
        sessionStorage.removeItem("id");
        window.location = "home.html";
    }

    const createButton = document.getElementById("createButton");
    const createForm = document.getElementById("createForm");
    const productsList = document.getElementById("productsList");
    
    createButton.addEventListener("click", createProduct);

    async function createProduct()
    {
        const formData = new FormData(createForm);
        const name = formData.get("name");
        const price = formData.get("price");
        const factor = formData.get("factor");
        const img = formData.get("img");

        if(name !== "" && price !== "" && factor !== "" && img !== "")
        {
            let tr = document.createElement("tr");
            tr.innerHTML = `
            <td>
            <img src="${img}">
            </td>
            <td>
            <p>${name}</p>
            </td>
            <td>
            <p>${price}</p>
            </td>
            <td>
            <p>${factor}</p>
            </td>
            <td>
            <input type="checkbox"/>
            </td>`;

            productsList.appendChild(tr);

            createForm.reset();

            let url = 'http://localhost:3030/data/furniture';
            let settings = 
            {
                method: 'post',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify({name, price, factor, img})
            };

            await fetch(url, settings);
        }
    }

    let buyButton = document.getElementById("buyButton");

    buyButton.addEventListener("click", makeOrder);

    async function makeOrder()
    {
        let checkboxes = document.querySelectorAll("input[type='checkbox']:checked");

        if(checkboxes.length != 0) 
        {
            checkboxes.forEach(async function(checkbox) 
            {
                let row = checkbox.closest("tr");
                let nameElement = row.querySelector("td:nth-child(2) p");
                let name = nameElement.textContent.trim();
  
                let price = parseFloat(row.querySelector("td:nth-child(3) p").textContent);

                let url = ' http://localhost:3030/data/orders';
                let settings = 
                {
                    method: 'post',
                    headers: { 'Content-type': 'application/json'},
                    body: JSON.stringify({name, price})
                };

                await fetch(url, settings);
            });
        }
    }

    let boughtFurnitureField = document.getElementById("boughtFurniture");
    let totalPriceField = document.getElementById("totalPrice");
    let allOrdersButton = document.getElementById("allOrders");

    allOrdersButton.addEventListener("click", printAllOrdersAndTotalPrice);

    function printAllOrdersAndTotalPrice()
    {
        let checkboxes = document.querySelectorAll("input[type='checkbox']:checked");

        if(checkboxes.length != 0) 
        {
            let checkedNames = new Set();
            let totalPrice = 0;

            checkboxes.forEach(async function(checkbox) 
            {
                let row = checkbox.closest("tr");
                let nameElement = row.querySelector("td:nth-child(2) p");
                let name = nameElement.textContent.trim();
                checkedNames.add(name);
  
                let price = parseFloat(row.querySelector("td:nth-child(3) p").textContent);
                totalPrice += price;
            });

            let furnitureArray = Array.from(checkedNames).join(", ");
            boughtFurnitureField.textContent = furnitureArray;
            totalPriceField.textContent = totalPrice.toFixed(2);
        }
    }
}

solve();