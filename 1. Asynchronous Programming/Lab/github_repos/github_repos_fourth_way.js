function loadRepos()
{
    const username = document.getElementById('username').value;

    const list = document.getElementById('repos');

    const url = `https://api.github.com/users/${username}/repos`;

    fetch(url)
        .then(response => 
        {
            if(!response.ok) 
            {
                throw response.json();
            }
            return response.json();
        })
        .then(data => 
        {
            list.innerHTML = data.map(r => `<li><a href="${r.html_url}">${r.full_name}</a></li>`);
        })
        .catch(errPromise => 
        {
            if(errPromise instanceof Promise)
            {
                errPromise.then(err => handleError(err.message));
            }
            else
            {
                handleError(errPromise.message);
            }
        });

    function handleError(message)
    {
        list.innerHTML = message;
    }
}