let createBtn = document.getElementById('create-btn');
createBtn.addEventListener('click', createHandler);

let loadBtn = document.getElementById('load-btn');
loadBtn.addEventListener('click', loadLandmarks);

let landmarksTableBody = document.querySelector('#landmarks-table tbody');

let editBtn = document.getElementById('edit-btn');
editBtn.addEventListener('click', editHandler);

async function loadLandmarks()
{
    [...landmarksTableBody.children].forEach(c => c.remove());
    let url = 'http://localhost:3030/jsonstore/landmarks';
    let response = await fetch(url);
    let result = await response.json();
    Object.values(result).forEach(e => {
        let tr = createLandmark(e._id, e.name, e.area, e.yearDatedStart, e.yearDatedEnd);
        landmarksTableBody.appendChild(tr);
    })
}

function createLandmark(id, name, area, yearDatedStart, yearDatedEnd)
{
    let tr = document.createElement('tr');

    let nameTd = document.createElement('td');
    nameTd.textContent = name;

    let areaTd = document.createElement('td');
    areaTd.textContent = area;

    let yearDatedStartTd = document.createElement('td');
    yearDatedStartTd.textContent = yearDatedStart;

    let yearDatedEndTd = document.createElement('td');
    yearDatedEndTd.textContent = yearDatedEnd;

    let controlsTd = document.createElement('td');

    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.id = id;
    deleteBtn.addEventListener('click',deleteHandler);

    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.dataset.id = id;
    editBtn.addEventListener('click',loadEditData);

    controlsTd.appendChild(deleteBtn);
    controlsTd.appendChild(editBtn);

    tr.appendChild(nameTd);
    tr.appendChild(areaTd);
    tr.appendChild(yearDatedStartTd);
    tr.appendChild(yearDatedEndTd);
    tr.appendChild(controlsTd);

    return tr;
}

async function loadEditData()
{
    let editBtn = e.target;
    let id = editBtn.dataset.id;

    let url = `http://localhost:3030/jsonstore/landmarks/${id}`;
    let response = await fetch(url, settings);
    let result = await response.json();

    let idInput = document.getElementById('edit-id');
    let nameInput = document.getElementById('edit-name');
    let areaInput = document.getElementById('edit-area');
    let yearDatedStartInput = document.getElementById('edit-year-dated-start');
    let yearDatedEndInput = document.getElementById('edit-year-dated-end');

    idInput.value = result._id;
    nameInput.value = result.name;
    areaInput.value = result.area;
    yearDatedStartInput.value = result.yearDatedStart;
    yearDatedEndInput.value = result.yearDatedEnd;
}

async function editHandler(e)
{
    e.preventDefault();

    let idInput = document.getElementById('edit-id');
    let nameInput = document.getElementById('edit-name');
    let areaInput = document.getElementById('edit-area');
    let yearDatedStartInput = document.getElementById('edit-year-dated-start');
    let yearDatedEndInput = document.getElementById('edit-year-dated-end');

    let id = idInput.value;
    let name = nameInput.value;
    let area = areaInput.value;
    let yearDatedStart = Number(yearDatedStartInput.value);
    let yearDatedEnd = Number(yearDatedEndInput.value);

    let url = `http://localhost:3030/jsonstore/landmarks/${id}`;
    let settings = {
        method: 'Put',
        headers: { 'Content-type': 'application/json'},
        body: JSON.stringify({_id: id,name, area, yearDatedStart, yearDatedEnd})
    };

    let response = await fetch(url, settings);
    let result = await response.json();

    idInput.value = '';
    nameInput.value = '';
    areaInput.value = '';
    yearDatedStartInput.value = '';
    yearDatedEndInput.value = '';

    await loadLandmarks();
    console.log(result);
}

async function deleteHandler(e)
{
    let deleteBtn = e.target;
    let id = deleteBtn.dataset.id;

    let url = `http://localhost:3030/jsonstore/landmarks/${id}`;
    let settings = {
        method: 'Delete'
    };

    let response = await fetch(url, settings);
    let result = await response.json();
    await loadLandmarks();
    console.log(result);
}

async function createHandler(e)
{
    e.preventDefault();
    let name = document.getElementById('create-name').value;
    let area = document.getElementById('create-area').value;
    let yearDatedStart = Number(document.getElementById('create-year-dated-start').value);
    let yearDatedEnd = Number(document.getElementById('create-year-dated-end').value);

    let url = 'http://localhost:3030/jsonstore/landmarks';
    let settings = {
        method: 'post',
        headers: { 'Content-type': 'application/json'},
        body: JSON.stringify({name, area, yearDatedStart, yearDatedEnd})
    };

    let response = await fetch(url, settings);
    let result = await response.json();
    await loadLandmarks();
    console.log(result);
}