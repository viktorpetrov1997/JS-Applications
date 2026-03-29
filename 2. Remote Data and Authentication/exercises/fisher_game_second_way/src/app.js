function app()
{
    document.getElementById("logout").addEventListener("click", onLogout);

    const userEmail = document.querySelector(".email span");

    const userSection = document.getElementById("user");
    const guestSection = document.getElementById("guest");
    
    const loadButton = document.querySelector("aside button");
    const addButton = document.querySelector("form button");

    const catchesSection = document.getElementById("catches");

    loadButton.addEventListener("click", onLoadAllCatches);
    document.querySelector("form").addEventListener("submit", onSubmit);

    const endPoints = 
    {
        logout: "http://localhost:3030/users/logout",
        catches: "http://localhost:3030/data/catches"
    }

    let userData = JSON.parse(sessionStorage.getItem("userData"));

    updateNav();

    async function onLogout(e)
    {
        const options =
        {
            method: "GET",
            headers:
            {
                "X-Authorization": userData.accessToken
            }
        };

        await fetch(endPoints.logout, options);

        sessionStorage.clear();

        userData = "";

        updateNav();

        onLoadAllCatches();
    }

    function updateNav()
    {
        if(userData)
        {
            userSection.style.display = "inline-block";
            guestSection.style.display = "none";
            userEmail.textContent = userData.email;
            addButton.disabled = false;
        }
        else
        {
            userSection.style.display = "none";
            guestSection.style.display = "inline-block";
            userEmail.textContent = "guest";
            addButton.disabled = true;
        }
    }

    async function onLoadAllCatches(e)
    {
        const response = await fetch(endPoints.catches);
        const data = await response.json();

        catchesSection.innerHTML = "";

        showAllCatches(data);
    }

    function showAllCatches(data)
    {
        data.forEach(x =>
        {
            const container = document.createElement("div");
            container.classList.add("catch");
            const content = createContent(x);

            container.innerHTML = content;
            container.querySelector("button.update").addEventListener("click", onUpdate);
            container.querySelector("button.delete").addEventListener("click", onDelete);
            catchesSection.appendChild(container);
        });
    }

    function createContent(data)
    {
        const isOwner = userData && userData._id === data._ownerId;

        return `
            <label>Angler</label>
            <input type="text" class="angler" value=${data.angler}>
            <label>Weight</label>
            <input type="text" class="weight" value=${data.weight}>
            <label>Species</label>
            <input type="text" class="species" value=${data.species}>
            <label>Location</label>
            <input type="text" class="location" value=${data.location}>
            <label>Bait</label>
            <input type="text" class="bait" value=${data.bait}>
            <label>Capture Time</label>
            <input type="number" class="captureTime" value=${data.captureTime}>
            <button class="update" data-id=${data._id} ${!isOwner ? "disabled" : ""}>Update</button>
            <button class="delete" data-id=${data._id} ${!isOwner ? "disabled" : ""}>Delete</button>
        `
    }

    async function onSubmit(e)
    {
        e.preventDefault();

        const formData = new FormData(e.target);

        const { angler, weight, species, location, bait, captureTime } = Object.fromEntries(formData);

        if(!angler || !weight || !species || !location || !bait || !captureTime)
        {
            return;
        }

        await saveCatches({ angler, weight, species, location, bait, captureTime });

        e.target.reset();

        onLoadAllCatches();
    }

    async function saveCatches(data)
    {
        const option =
        {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json",
                "X-Authorization": userData.accessToken
            },
            body: JSON.stringify(data)
        }

        await fetch(endPoints.catches, option);
    }

    async function onUpdate(e)
    {
        const id = e.target.dataset.id;
        const inputs = Array.from(e.target.parentElement.querySelectorAll("input"));
        const [anglerRef, weightRef, speciesRef, locationRef, baitRef, captureTimeRef] = inputs;

        const data = 
        {
            angler: anglerRef.value,
            weight: weightRef.value,
            species: speciesRef.value,
            location: locationRef.value,
            bait: baitRef.value,
            captureTime: captureTimeRef.value
        }

        await updateCatches(data, id);
        onLoadAllCatches();
    }

    async function updateCatches(data, id)
    {
        const option =
        {
            method: "PUT",
            headers: 
            {
                "Content-Type": "application/json",
                "X-Authorization": userData.accessToken
            },
            body: JSON.stringify(data)
        }

        await fetch(endPoints.catches + "/" + id, option);
    }

    async function onDelete(e)
    {
        const id = e.target.dataset.id;

        const option =
        {
            method: "DELETE",
            headers: 
            {
                "X-Authorization": userData.accessToken
            }
        }

        await fetch(endPoints.catches + "/" + id, option);

        onLoadAllCatches();
    }
}

app();