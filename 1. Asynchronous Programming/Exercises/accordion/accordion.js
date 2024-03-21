async function accordion()
{
    let section = document.getElementById("main");

    try 
    {
        let response = await fetch(`http://localhost:3030/jsonstore/advanced/articles/details`);

        let data = await response.json();

        if(!response.ok) 
        {
            throw new Error('Network response was not ok');
        }

        Object.entries(data).forEach(([id, sectionInfo]) => 
        {
            let div = document.createElement("div");
            div.classList.add("accordion");
            div.innerHTML = `
            <div class="head">
                <span>${sectionInfo.title}</span>
                <button class="button" id="${id}">More</button>
            </div>
            <div class="extra">
            <p>${sectionInfo.content}</p>
            </div>`;
            section.appendChild(div);
        });
    } 
    catch(error)
    {
        section.innerHTML = `<p>${error.message}</p>`;
    }

    let buttons = document.querySelectorAll("button");

    buttons.forEach(button => 
    {
        button.addEventListener("click", function () 
        {
            // Find the parent container (.accordion) of the clicked button
            let accordionContainer = button.closest('.accordion');
    
            // Find the .extra div inside the parent container
            let extraDiv = accordionContainer.querySelector('.extra');
    
            // Check the computed display style
            let computedStyle = window.getComputedStyle(extraDiv);
            let currentDisplay = computedStyle.getPropertyValue("display");
    
            if(currentDisplay === "none") 
            {
                extraDiv.style.display = "block"; // Show the div
                button.textContent = "Less"; // Update button text
            } 
            else 
            {
                extraDiv.style.display = "none"; // Hide the div
                button.textContent = "More"; // Update button text
            }
        });
    });
}

accordion();