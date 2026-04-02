import { api } from "../utility/requester.js";

const endPoints =
{
    create: "http://localhost:3030/data/catalog",
    getAll: "http://localhost:3030/data/catalog",
    getDetails: "http://localhost:3030/data/catalog/",
    update: "http://localhost:3030/data/catalog/",
    del: "http://localhost:3030/data/catalog/",
    getMyFurniture: (userId) => `http://localhost:3030/data/catalog?where=_ownerId%3D%22${userId}%22`
}

async function createFurniture(data)
{
    return await api.post(endPoints.create, data);
}

async function getAllFurniture()
{
    return await api.get(endPoints.getAll);
}

async function getFurnitureById(id)
{
    return await api.get(endPoints.getDetails + id);
}

async function updateFurniture(data, id)
{
    return await api.put(endPoints.update + id, data);
}

async function deleteFurniture(id)
{
    return await api.del(endPoints.del + id);
}

async function getMyFurniture(userId)
{
    return await api.get(endPoints.getMyFurniture(userId));
}

export const dataService =
{
    createFurniture,
    getAllFurniture,
    getFurnitureById,
    updateFurniture,
    deleteFurniture,
    getMyFurniture
}