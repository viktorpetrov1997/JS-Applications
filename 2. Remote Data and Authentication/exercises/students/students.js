let submitButton = document.getElementById("submit");

submitButton.addEventListener("click", submitData);

async function submitData(e) 
{
    e.preventDefault();

    let firstName = document.getElementsByTagName("input")[0].value;
    let lastName = document.getElementsByTagName("input")[1].value;
    let facultyNumber = document.getElementsByTagName("input")[2].value;
    let grade = Number(document.getElementsByTagName("input")[3].value);

    if(firstName !== "" && lastName !== "" && facultyNumber !== "" && grade !== "" && (grade >= 2 && grade <= 6))
    {
        let url = 'http://localhost:3030/jsonstore/collections/students';
        let settings =
        {
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, facultyNumber, grade })
        };

        await fetch(url, settings);

        document.getElementsByTagName("input")[0].value = "";
        document.getElementsByTagName("input")[1].value = "";
        document.getElementsByTagName("input")[2].value = "";
        document.getElementsByTagName("input")[3].value = "";
    }
    loadData();
}

async function loadData(e) 
{
    let tbody = document.querySelector("#results tbody");
    tbody.innerHTML = "";

    let url = 'http://localhost:3030/jsonstore/collections/students';

    let response = await fetch(url);
    let data = await response.json();

    Object.values(data).forEach(element =>
    {
        let tr = document.createElement("tr");
        
        let tdFirstName = document.createElement("td");
        tdFirstName.textContent = element.firstName;
        
        let tdLastName = document.createElement("td");
        tdLastName.textContent = element.lastName;
        
        let tdFacultyNumber = document.createElement("td");
        tdFacultyNumber.textContent = element.facultyNumber;
        
        let tdGrade = document.createElement("td");
        tdGrade.textContent = element.grade;
        
        tr.appendChild(tdFirstName);
        tr.appendChild(tdLastName);
        tr.appendChild(tdFacultyNumber);
        tr.appendChild(tdGrade);
        
        tbody.appendChild(tr);
    });
}