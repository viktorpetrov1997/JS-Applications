function getBusStopInfo() 
{
    let busesList = document.getElementById("buses");
    let stopId = document.getElementById("stopId").value;

    let url = `http://localhost:3030/jsonstore/bus/businfo/${stopId}`;

    //When using fetch(url).then we don't need to make the function async and use await
    //because this version of fetch chains promises together and handles them sequentially without using await
    //and won't go through the code without waiting for the content to be fetched

    fetch(url)
        .then(response => 
        {
            if(!response.ok) 
            {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => 
        {
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
        })
        .catch(error => 
        {
            document.getElementById("stopName").textContent = "Error";
        });
}
