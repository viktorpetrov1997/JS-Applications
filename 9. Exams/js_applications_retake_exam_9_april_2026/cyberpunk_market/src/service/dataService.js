import { api } from "../utility/requester.js";

const endPoints =
{
    all: "/data/cyberpunk?sortBy=_createdOn%20desc",
    byId: "/data/cyberpunk/",
    create: "/data/cyberpunk",
    edit: "/data/cyberpunk/"
}

async function getAllItems()
{
    return await api.get(endPoints.all);
}

async function getItemById(id)
{
    return await api.get(endPoints.byId + id);
}

async function createItem(data)
{
    return await api.post(endPoints.create, data);
}

async function updateItem(id, data)
{
    return await api.put(endPoints.edit + id, data);
}

async function deleteItemById(id)
{
    return await api.del(endPoints.byId + id);
}

export const dataService =
{
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItemById
}