let sendButton = document.getElementById("submit");

let refreshButton = document.getElementById("refresh");

sendButton.addEventListener("click", sendData);

refreshButton.addEventListener("click", refreshData);

async function sendData() 
{
    let author = document.getElementsByTagName("input")[0].value;
    let content = document.getElementsByTagName("input")[1].value;

    if(author !== "" && content !== "") 
    {
        let url = 'http://localhost:3030/jsonstore/messenger';
        let settings =
        {
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ author, content })
        };

        await fetch(url, settings);

        document.getElementsByTagName("input")[0].value = "";
        document.getElementsByTagName("input")[1].value = "";
    }
}

async function refreshData() 
{
    let textArea = document.getElementById("messages");

    let url = 'http://localhost:3030/jsonstore/messenger';

    let response = await fetch(url);
    let data = await response.json();
    textArea.innerHTML = "";

    Object.values(data).forEach(element => 
    {
        textArea.textContent += `${element.author}: ${element.content}\n`;
    });
}