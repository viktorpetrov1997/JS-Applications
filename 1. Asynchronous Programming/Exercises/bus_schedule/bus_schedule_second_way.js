function solve()
{
    const BASE_URL = "http://localhost:3030/jsonstore/bus/schedule/";

    const infoBox = document.querySelector("#info span");
    const departButton = document.getElementById("depart");
    const arriveButton = document.getElementById("arrive");

    const stopInfo =
    {
        name: "",
        nextStop: "depot" 
    }

    async function depart()
    {
        try 
        {
            const response = await fetch(BASE_URL + stopInfo.nextStop);
            const data = await response.json();
            stopInfo.name = data.name;
            stopInfo.nextStop = data.next;
            infoBox.textContent = `Next stop ${stopInfo.name}`;
            departButton.disabled = true;
            arriveButton.disabled = false;
        }
        catch(error)
        {
            infoBox.textContent = "Error";
            departButton.disabled = true;
            arriveButton.disabled = true;
        }
    }

    function arrive()
    {
        infoBox.textContent = `Arriving at ${stopInfo.name}`;
        departButton.disabled = false;
        arriveButton.disabled = true;
    }

    return { arrive, depart };
}

let result = solve(); // In order to use this method we need to put the variable result in front 
// of the depart and arrive functions calls in the html. (e.g. result.depart())
