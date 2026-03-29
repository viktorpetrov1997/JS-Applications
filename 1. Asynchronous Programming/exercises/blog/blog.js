function manageBlog()
{
    let loadPostsButton = document.getElementById("btnLoadPosts");
    let p = document.getElementById("post-body");
    let selectPosts = document.getElementById("posts");
    let viewPostsButton = document.getElementById("btnViewPost");

    loadPostsButton.addEventListener("click", loadPosts);

    viewPostsButton.addEventListener("click", viewPosts);

    async function loadPosts() 
    {
        try 
        {
            const url = `http://localhost:3030/jsonstore/blog/posts`;
 
            const response = await fetch(url);
            const data = await response.json();
 
            if(!response.ok) 
            {
                throw new Error(`${response.status} (${response.statusText})`);
            }

            selectPosts.innerHTML = ""; // Clear previous options

            for(const key in data) 
            {
                if(data.hasOwnProperty(key)) 
                {
                    const element = data[key];
                    let option = document.createElement("option");
                    option.value = element.id;
                    option.textContent = element.title.toUpperCase();
                    selectPosts.appendChild(option);
                }
            }
        } 
        catch(error)
        {
            p.textContent = error.message;
        }
    }

    async function viewPosts() 
    {
        try 
        {
            let options = document.querySelectorAll("option");
            let postId = "";
            options.forEach(o => 
            {
                if(o.selected)
                {
                    postId = o.value;
                }
            });
    
            const postUrl = `http://localhost:3030/jsonstore/blog/posts/${postId}`;
            const postResponse = await fetch(postUrl);
            const postData = await postResponse.json();
    
            if(!postResponse.ok) 
            {
                throw new Error(`${postResponse.status} (${postResponse.statusText})`);
            }
    
            let postTitle = document.getElementById("post-title");
            postTitle.textContent = postData.title;
            let postDetails = document.getElementById("post-body");
            postDetails.textContent = postData.body;
    
            const commentsUrl = `http://localhost:3030/jsonstore/blog/comments/`;
            const commentsResponse = await fetch(commentsUrl);
            const commentsData = await commentsResponse.json();
    
            if(!commentsResponse.ok) 
            {
                throw new Error(`${commentsResponse.status} (${commentsResponse.statusText})`);
            }
    
            let commentsList = document.getElementById("post-comments");
            commentsList.innerHTML = ""; // Clear previous comments

            for(const key in commentsData) 
            {
                if(commentsData.hasOwnProperty(key)) 
                {
                    const element = commentsData[key];
                    if(element.postId == postId)
                    {
                        let li = document.createElement("li");
                        li.textContent = element.text;
                        commentsList.appendChild(li);
                    }
                }
            }
        } 
        catch(error) 
        {
            p.textContent = error.message;
        }
    }
    
}

manageBlog();