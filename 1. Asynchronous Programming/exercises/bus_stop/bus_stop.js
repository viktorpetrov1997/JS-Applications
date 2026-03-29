async function getBusStopInfo() 
{
    let busesList = document.getElementById("buses");

    let stopId = document.getElementById("stopId").value;

    try 
    {
        let response = await fetch(`http://localhost:3030/jsonstore/bus/businfo/${stopId}`);

        let data = await response.json();

        document.getElementById("stopName").textContent = data.name;
        busesList.innerHTML = ""; // To prevent appending the same result to the initial one after clicking
        // the Check button multiple times

        Object.entries(data.buses).forEach(([busId, time]) => 
        {
            let li = document.createElement("li");
            li.textContent = `Bus ${busId} arrives in ${time} minutes`;
            busesList.appendChild(li);
        }); // Object.entries can be used to access key/value pairs and print them instead of using
        // a for...in loop
    }
    catch(error)
    {
        document.getElementById("stopName").textContent = "Error";
    }
}