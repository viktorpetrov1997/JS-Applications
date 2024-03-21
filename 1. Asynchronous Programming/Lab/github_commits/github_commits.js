function loadCommits()
{
    let username = document.getElementById('username').value;
    let repo = document.getElementById('repo').value;
    let ul = document.getElementById('commits');
    let url = `https://api.github.com/repos/${username}/${repo}/commits`;

    fetch(url)
        .then(response => 
        {
            if(response.status != 200) 
            {
                throw new Error(`Error: ${response.status} (Not Found)`);
            }
            return response.json(); 
        })
        .then(data => 
        {
            data.forEach(element => 
            {
                let li = document.createElement('li');
                let authorName = element.author ? element.author.login : 'Unknown Author';
                li.textContent = `${authorName}: ${element.commit.message}`;
                ul.appendChild(li);
            });
        })
        .catch(error => 
        {
            let li = document.createElement('li');
            li.textContent = error.message;
            ul.appendChild(li); 
        });
}
