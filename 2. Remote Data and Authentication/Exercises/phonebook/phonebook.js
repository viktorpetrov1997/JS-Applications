function managePhonebook() 
{
    let loadButton = document.getElementById("btnLoad");
    loadButton.addEventListener("click", loadPhonebook);

    let phonebookList = document.getElementById("phonebook");

    let createButton = document.getElementById("btnCreate");
    createButton.addEventListener("click", createRecord);

    async function loadPhonebook() 
    {
        let response = await fetch("http://localhost:3030/jsonstore/phonebook");

        let data = await response.json();

        phonebookList.innerHTML = "";

        Object.values(data).forEach(element => 
        {
            let li = document.createElement("li");
            li.textContent = `${element.person}: ${element.phone}`;
            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("id", element._id);
            deleteButton.addEventListener("click", deleteRow);
            li.appendChild(deleteButton);
            phonebookList.appendChild(li);
        });
    }

    async function createRecord() 
    {
        let person = document.getElementById("person").value;
        let phone = document.getElementById("phone").value;

        if(person !== "" && phone !== "") 
        {
            let url = `http://localhost:3030/jsonstore/phonebook`;
            let settings =
            {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ person, phone })
            };

            await fetch(url, settings);

            document.getElementById("person").value = "";
            document.getElementById("phone").value = "";

            loadPhonebook();
        }
    }

    async function deleteRow(e) 
    {
        if(e.target.textContent !== "Delete")
        {
            return;
        }
        
        let clickedButtonThatContainsTheRowId = e.target.id;

        await fetch(`http://localhost:3030/jsonstore/phonebook/${clickedButtonThatContainsTheRowId}`,
        {
            method: "DELETE",
        });

        loadPhonebook();
    }
}

managePhonebook();