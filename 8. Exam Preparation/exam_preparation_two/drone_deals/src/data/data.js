import { get, post, put, del } from "./request.js";

const endpoints =
{
    all: "/data/drones?sortBy=_createdOn%20desc",
    byId: "/data/collection/",

}

async function getAll()
{
    return get(endpoints.all);
}

async function getById(id)
{
    return get(endpoints.byId + id);
}

async function create(prop1, prop2)
{
    return post(endpoints.all, { prop1, prop2 });
}

async function update(id, record)
{
    return put(endpoints.byId + id, record);
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