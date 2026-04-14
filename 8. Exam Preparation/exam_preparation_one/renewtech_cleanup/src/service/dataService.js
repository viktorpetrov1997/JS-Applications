import { api } from "../utility/requester.js";

const endPoints =
{
    all: "/data/solutions?sortBy=_createdOn%20desc",
    byId: "/data/solutions/",
    create: "/data/solutions",
    edit: "/data/solutions/",
    likes: "/data/likes",
    likesForSolution: (solutionId) => `/data/likes?where=solutionId%3D%22${solutionId}%22&distinct=_ownerId&count`,
    likesForUser: (solutionId, userId ) => `/data/likes?where=solutionId%3D%22${solutionId}%22%20and%20_ownerId%3D%22${userId}%22&count`
}

async function getAllSolutions()
{
    return await api.get(endPoints.all);
}

async function getSolutionById(id)
{
    return await api.get(endPoints.byId + id);
}

async function createSolution(data)
{
    return await api.post(endPoints.create, data);
}

async function updateSolution(id, data)
{
    return await api.put(endPoints.edit + id, data);
}

async function deleteSolutionById(id)
{
    return await api.del(endPoints.byId + id);
}

async function addLikeForSolution(solutionId)
{
    return await api.post(endPoints.likes, { solutionId });
}

async function getLikesForSolution(id)
{
    return await api.get(endPoints.likesForSolution(id));
}

async function getLikesForUser(solutionId, userId)
{
    return await api.get(endPoints.likesForUser(solutionId, userId));
}

export const dataService =
{
    getAllSolutions,
    getSolutionById,
    createSolution,
    updateSolution,
    deleteSolutionById,
    addLikeForSolution,
    getLikesForSolution,
    getLikesForUser
}