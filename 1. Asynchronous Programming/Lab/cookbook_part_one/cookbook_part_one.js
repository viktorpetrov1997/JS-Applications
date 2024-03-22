// Wrap your JavaScript code inside the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() 
{
    function manageCookbook() 
    {
        // Access the main element inside this function
        let main = document.getElementsByTagName("main")[0];
        let p = document.getElementsByTagName("p")[0];
        p.style.display = "none";

        async function loadAllRecipies() 
        {
            try 
            {
                let url = "http://localhost:3030/jsonstore/cookbook/recipes";
                let response = await fetch(url);
                let data = await response.json();

                if(!response.ok) 
                {
                    throw new Error(`${response.status} (${response.statusText})`);
                }

                for(const key in data) 
                {
                    if(data.hasOwnProperty(key)) 
                    {
                        const recipe = data[key];
                        let article = document.createElement("article");
                        article.classList.add("preview");
                        article.innerHTML = `<div class="title">
                                                <h2>${recipe.name}</h2>
                                            </div>
                                            <div class="small">
                                                <img src="${recipe.img}">
                                            </div>`;
                        article.addEventListener("click", function() 
                        {
                            loadSelectedRecipe(recipe._id);
                        });
                        main.appendChild(article);
                    }
                }
            } 
            catch(error) 
            {
                console.log(error.message);
            }
        }

        loadAllRecipies();

        async function loadSelectedRecipe(recipeId) 
        {
            try 
            {
                let url = `http://localhost:3030/jsonstore/cookbook/details/${recipeId}`;
                let response = await fetch(url);
                let data = await response.json();
        
                if(!response.ok) 
                {
                    throw new Error(`${response.status} (${response.statusText})`);
                }
        
                // Create the HTML structure for the recipe details
                let article = document.createElement("article");
                article.innerHTML = `
                    <h2>${data.name}</h2>
                    <div class="band">
                        <div class="thumb">
                            <img src="${data.img}">
                        </div>
                        <div class="ingredients">
                            <h3>Ingredients:</h3>
                            <ul>
                                ${data.ingredients ? data.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("") : ""}
                            </ul>
                        </div>
                    </div>
                    <div class="description">
                        <h3>Preparation:</h3>
                        ${data.steps ? data.steps.map(step => `<p>${step}</p>`).join("") : ""}
                    </div>
                `;
        
                // Replace the existing content with the recipe details
                main.innerHTML = "";
                main.appendChild(article);
                /*article.addEventListener("click", function() 
                {
                    article.style.display = "none";
                    loadAllRecipies();
                }); Can be used to go back to the inital page after loading a specific recipe*/
            } 
            catch(error) 
            {
                console.log(error.message);
            }
        }
    }
    manageCookbook();
});
