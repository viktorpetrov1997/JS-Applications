import { dataService } from "./dataService.js";

const section = document.querySelectorAll("section");
const commentsSection = document.getElementById("comments-section");

let currentTopicId = null;

export function showCommentsView(e) 
{
    currentTopicId = e.currentTarget.dataset.id;

    section.forEach(section => section.style.display = "none");
    commentsSection.style.display = "block";

    showSelectedTopic(currentTopicId);
    showCommentsForSelectedTopic(currentTopicId);
}

// ---------------------------------------------------------------------------------------------

const topicContainer = document.querySelector('#comments-section .topic-container');

async function showSelectedTopic(id) 
{
    topicContainer.innerHTML = "";

    const topic = await dataService.getSpecificTopic(id);

    const topicElement = document.createElement('div');
    topicElement.classList.add('topic-name-wrapper');

    const commentDate = topic.date ? formatDate(topic.date) : 'Unknown';

    topicElement.innerHTML = `
                <div class="topic-name">
                    <a href="#" class="normal">
                        <h2>${topic.topicName}</h2>
                    </a>
                    <div class="columns">
                        <div>
                            <p>Date: <time>${commentDate}</time></p>
                            <div class="nick-name">
                                <p>Username: <span>${topic.username}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

    topicContainer.appendChild(topicElement);
}

// ---------------------------------------------------------------------------------------------

const commentsContainer = document.getElementById("comments-container");

async function showCommentsForSelectedTopic(id) 
{
    commentsContainer.innerHTML = "";

    const topicData = await dataService.getSpecificTopic(id);
    const comments = await dataService.getCommentsForSpecificTopic(id);

    Object.values(comments).forEach(comment => 
    {
        const commentElement = createComment(comment, topicData);

        if(topicData.username === comment.username) 
        {
            const lastComment = commentsContainer.lastElementChild;
            
            if(lastComment) 
            {
                lastComment.appendChild(commentElement);
            } 
            else 
            {
                commentsContainer.appendChild(commentElement);
            }
        }
        else 
        {
            commentsContainer.appendChild(commentElement);
        }
    });
}

export function formatDate(date) 
{
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function createComment(data, topicData) 
{
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');

    const commentDate = data.date ? formatDate(data.date) : 'Unknown';

    if(topicData.username === data.username) 
    {
        commentElement.innerHTML = `
               <div id="user-comment">
                    <div class="topic-name-wrapper">
                        <div class="topic-name">
                            <p><strong>${data.username}</strong> commented on <time>${commentDate}</time></p>
                            <div class="post-content">
                                <p>${data.postText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }
    else 
    {
        commentElement.innerHTML = `
               <div class="header">
                    <img src="./static/profile.png" alt="avatar">
                    <p><span>${data.username}</span> posted on <time>${commentDate}</time></p>

                    <p class="post-content">${data.postText}</p>
                </div>
            `;
    }

    return commentElement;
}

// ---------------------------------------------------------------------------------------------

document.querySelector('#comments-section form').addEventListener("submit", onSubmit);

async function onSubmit(e) 
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { postText, username } = Object.fromEntries(formData);

    if(!postText || !username) 
    {
        return;
    }

    await dataService.publishComment({ postText, username, topicId: currentTopicId, date: new Date().toISOString() });

    e.target.reset();

    showCommentsForSelectedTopic(currentTopicId);
}