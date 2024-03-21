async function manageLockedProfiles() 
{
    let main = document.getElementById("main");

    let firstDiv = document.getElementsByClassName("profile")[0];
    firstDiv.style.display = "none";

    try 
    {
        let response = await fetch(`http://localhost:3030/jsonstore/advanced/profiles`);

        let data = await response.json();

        if(!response.ok) 
        {
            throw new Error('Network response was not ok');
        }

        Object.entries(data).forEach(([userId, profile]) => 
        {
            let div = document.createElement("div");
            div.classList.add("profile");
            div.innerHTML = `
                <img src="icon.png" class="userIcon" />
				<label>Lock</label>
				<input type="radio" name="${userId}Locked" value="lock" checked>
				<label>Unlock</label>
				<input type="radio" name="${userId}Locked" value="unlock"><br>
				<hr>
				<label>Username</label>
				<input type="text" name="${userId}Username" value="${profile.username}" disabled readonly />
				<div class="hiddenField">
					<hr>
					<label>Email:</label>
					<input type="email" name="${userId}Email" value="${profile.email}" disabled readonly />
					<label>Age:</label>
					<input type="text" name="${userId}Age" value="${profile.age}" disabled readonly />
				</div>
				
				<button>Show more</button>`;
            main.appendChild(div);
        });
    } 
    catch(error)
    {
        main.innerHTML = `<p>${error.message}</p>`;
    }

    const btns = [...document.getElementsByTagName('button')];
    btns.forEach(btn => btn.addEventListener('click', showHide));
}

function showHide(event) 
{
    const button = event.target;
    const profile = button.parentNode;
    const hiddenField = profile.querySelector('.hiddenField');
    const lockStatus = profile.querySelector('input[type="radio"]:checked').value;

    if(lockStatus === 'unlock') 
    {
        if(button.textContent.trim() === 'Show more') 
        {
            hiddenField.style.display = 'inline-block';
            button.textContent = 'Hide it';
        } 
        else if(button.textContent.trim() === 'Hide it') 
        {
            hiddenField.style.display = 'none';
            button.textContent = 'Show more';
        }
    }
}

