document.addEventListener("DOMContentLoaded", function() 
{
    function manageCookbook() 
    {
        let main = document.getElementsByTagName("main")[0];
        let p = document.getElementsByTagName("p")[0];
        p.style.display = "none";

        async function loadAllRecipes() 
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
                    if (data.hasOwnProperty(key)) 
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
                        article.addEventListener("click", function() {
                            loadSelectedRecipe(recipe._id, article);
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

        loadAllRecipes();

        async function loadSelectedRecipe(recipeId, clickedArticle) 
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

                clickedArticle.replaceWith(article);
            } 
            catch(error) 
            {
                console.log(error.message);
            }
        }
    }
    manageCookbook();
});
