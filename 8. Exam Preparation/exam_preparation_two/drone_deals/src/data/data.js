import { get, post, put, del } from "./request.js";

const endpoints =
{
    all: "/data/drones?sortBy=_createdOn%20desc",
    byId: "/data/drones/",
    create: "/data/drones",
    edit: "/data/drones/"
}

async function getAll()
{
    return get(endpoints.all);
}

async function getById(id)
{
    return get(endpoints.byId + id);
}

async function create(data)
{
    return post(endpoints.create, data);
}

async function update(id, record)
{
    return put(endpoints.edit + id, record);
}

async function deleteById(id)
{
    return del(endpoints.byId + id);
}

export const dataService =
{
    getAll,
    getById,
    create,
    update,
    deleteById
}