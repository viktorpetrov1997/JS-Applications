let stopInfoElement = document.querySelector("div#info span.info");
let departButton = document.getElementById("depart");
let arriveButton = document.getElementById("arrive");

let nextStopId = "depot";
let stopName = "";


async function depart() 
{
    try 
    {
        let reponse = await fetch(`http://localhost:3030/jsonstore/bus/schedule/${nextStopId}`);

        if (!reponse.ok) 
        {
            let error = new Error(reponse.statusText);
            throw error;
        }

        let data = await reponse.json();

        stopName = data.name;
        nextStopId = data.next;

        stopInfoElement.textContent = `Next stop ${stopName}`;
        departButton.disabled = true;
        arriveButton.disabled = false;
    }
    catch(error) 
    {
        stopInfoElement.textContent = "Error";
        departButton.disabled = true;
        arriveButton.disabled = true;
    }

}

function arrive() 
{
    stopInfoElement.textContent = `Arriving at ${stopName}`;
    departButton.disabled = false;
    arriveButton.disabled = true;
}





