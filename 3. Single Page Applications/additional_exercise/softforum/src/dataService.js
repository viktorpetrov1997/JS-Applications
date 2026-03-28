import { api } from "./requester.js";

const BASE_URL = "http://localhost:3030/jsonstore/collections/myboard";

const endPoints =
{
    topics: "/posts",
    specificTopic: (id) => `/posts/${id}`,
    comments: `/comments`
};

function getAllTopics()
{
    return api.get(BASE_URL + endPoints.topics);
}

function publishTopic(data)
{
    return api.post(BASE_URL + endPoints.topics, data);
}

function getSpecificTopic(id)
{
    return api.get(BASE_URL + endPoints.specificTopic(id));
}

function getAllComments()
{
    return api.get(BASE_URL + endPoints.comments);
}

async function getCommentsForSpecificTopic(id)
{
    const allComments = await getAllComments();
    
    const commentsForSpecificTopic = Object.values(allComments)
        .filter(comment => comment.topicId === id);
    
    return commentsForSpecificTopic;
}

function publishComment(data)
{
    return api.post(BASE_URL + endPoints.comments, data);
}

export const dataService =
{
    getAllTopics,
    publishTopic,
    getSpecificTopic,
    getAllComments,
    getCommentsForSpecificTopic,
    publishComment
}