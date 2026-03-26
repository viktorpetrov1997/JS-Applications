import { api } from "./requester.js";

const endpoints =
{
    getAll: "http://localhost:3030/data/ideas?select=_id%2Ctitle%2Cimg&sortBy=_createdOn%20desc",
    create: "http://localhost:3030/data/ideas",
    ideaById: "http://localhost:3030/data/ideas/"
}

async function getAll()
{
    return await api.get(endpoints.getAll);
}

async function create(data)
{
    return await api.post(endpoints.create, data);
}

async function updateIdea(id, data)
{
    return await api.update(endpoints.ideaById + id, data);
}

async function deleteIdea(id)
{
    return await api.del(endpoints.ideaById + id);
}

async function getIdeaById(id)
{
    return await api.get(endpoints.ideaById + id);
}

export const dataService =
{
    getAll,
    create,
    updateIdea,
    deleteIdea,
    getIdeaById
}