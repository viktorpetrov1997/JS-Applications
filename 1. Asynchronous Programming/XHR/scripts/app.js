function loadRepos() 
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.github.com/users/testnakov/repos", true);

    xhr.onreadystatechange = function () 
    {
      if (xhr.readyState == 4 && xhr.status == 200) 
      {
        document.getElementById("res").textContent = xhr.responseText;
      }
    };
    
    xhr.send();
  }
  