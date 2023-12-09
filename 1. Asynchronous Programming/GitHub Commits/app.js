function loadCommits() 
{
    let username = document.getElementById('username').value;
    let repo = document.getElementById('repo').value;
    let commitsList = document.getElementById('commits');

    fetch(`https://api.github.com/repos/${username}/${repo}/commits`)
        .then(response => 
            {
            if (!response.ok) 
            {
                throw new Error(`Error: ${response.status} (Not Found)`);
            }
            return response.json();
        })
        .then(commits => 
        {
            commitsList.innerHTML = '';

            commits.forEach(commit => 
            {
                let listItem = document.createElement('li');
                let authorName = commit.author ? commit.author.login : 'Unknown Author';
                listItem.textContent = `${authorName}: ${commit.commit.message}`;
                commitsList.appendChild(listItem);
            });
        })
        .catch(error => 
        {
            let listItem = document.createElement('li');
            listItem.textContent = error.message;
            commitsList.innerHTML = '';
            commitsList.appendChild(listItem);
        });
}
