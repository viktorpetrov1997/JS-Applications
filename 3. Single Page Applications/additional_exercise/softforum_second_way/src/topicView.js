import { showCommentsView } from "./commentsView.js";
import { dataService } from "./dataService.js";
import { formatDate } from "./commentsView.js";

const section = document.querySelectorAll("section");
const homeSection = document.getElementById("home-page");

export function showHome() 
{
    section.forEach(section => section.style.display = "none");
    homeSection.style.display = "block";

    showAllTopics();
}

// ---------------------------------------------------------------------------------------------

const topicContainer = document.querySelector('.topic-container');

async function showAllTopics() 
{
    topicContainer.innerHTML = '';

    const topics = await dataService.getAllTopics();

    Object.values(topics).forEach(topic => 
        topicContainer.appendChild(createTopic(topic))
    );
}

function createTopic(data) 
{
    const topicElement = document.createElement('div');
    topicElement.classList.add('topic-name-wrapper');

    const commentDate = data.date ? formatDate(data.date) : 'Unknown';

    topicElement.innerHTML = `
                <div class="topic-name">
                    <a href="#" class="normal" data-id="${data._id}">
                        <h2>${data.topicName}</h2>
                    </a>
                    <div class="columns">
                        <div>
                            <p>Date: <time>${commentDate}</time></p>
                            <div class="nick-name">
                                <p>Username: <span>${data.username}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

    topicElement.querySelector("a").addEventListener("click", showCommentsView);
    
    return topicElement;
}

// ---------------------------------------------------------------------------------------------

const form = document.querySelector("form");  

form.addEventListener("submit", onSubmit);   

form.querySelector(".cancel").addEventListener("click", (e) => 
{
    e.preventDefault();
    form.reset();  
});

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { topicName, username, postText } = Object.fromEntries(formData);

    if(!topicName || !username|| !postText) 
    {
        return;
    }

    await dataService.publishTopic({ topicName, username, postText, date: new Date().toISOString() });

    showAllTopics();

    e.target.reset();
}