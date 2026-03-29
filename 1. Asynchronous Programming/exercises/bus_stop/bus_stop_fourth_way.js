function getInfo()
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

    const response = fetch(BASE_URL + busId);
    response.then(res =>
    {
        res.json().then(data => 
        {
            stopRef.textContent = data.name;
            busListRef.innerHTML = "";
            Object.entries(data.buses).forEach(([busId, time]) =>
            {
                const li = document.createElement("li");
                li.textContent = `Bus ${busId} arrives in ${time} minutes`;
                busListRef.appendChild(li);
            })
        }).catch(err => 
        {
            stopRef.textContent = "Error";
            busListRef.innerHTML = "";
        })
    }).catch(err => 
    {
        stopRef.textContent = "Error";
    });
}