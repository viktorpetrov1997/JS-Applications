function loadRepos() 
{
    let input = document.getElementById('username');
    let ul = document.getElementById('repos');
    let username = input.value;
    let url = `https://api.github.com/users/${username}/repos`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET",url,true);

    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            let data = JSON.parse(xhr.response);
            data.forEach(element => 
            {
                let li = createLi(element.full_name, element.html_url);
                ul.appendChild(li);
            });
        }
        else if(xhr.readyState == 4)
        {
            let li = createLi(`${xhr.status} ${xhr.statusText}`);
            ul.appendChild(li);
        }
    }
    xhr.send();
}

function createLi(name, url)
{
	let li = document.createElement('li');
	let a = document.createElement('a');
	a.textContent = name;
	a.href = url;
	li.appendChild(a);
	return li;
}