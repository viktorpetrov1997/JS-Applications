async function getInfo()
{
    const BASE_URL = "http://localhost:3030/jsonstore/bus/businfo/";

    const input = document.getElementById("stopId");
    const busId = input.value;

    const stopRef = document.getElementById("stopName");
    const busListRef = document.getElementById("buses");

    if(!busId)
    {
        return;
    }

    try
    {
        const response = await fetch(BASE_URL + busId);
        const data = await response.json();

        busListRef.innerHTML = "";

        stopRef.textContent = data.name;

        Object.entries(data.buses).forEach(([busId, time]) => 
        {
            const li = document.createElement("li");
            li.textContent = `Bus ${busId} arrives in ${time} minutes`;
            busListRef.appendChild(li);
        })
    }
    catch(error)
    {
        stopRef.textContent = "Error!";
        busListRef.innerHTML = "";
    }
}