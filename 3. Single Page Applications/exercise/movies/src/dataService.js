import { api } from "./requester.js";

const BASE_URL = "http://localhost:3030";

const endPoints =
{
    moviesCollections: "/data/movies",
    getMovieById: (id) => `/data/movies/${id}`,
    updateMovies: (id) => `/data/movies/${id}`,
    deleteMovies: (id) => `/data/movies/${id}`,
    likeCount: (movieId) => `/data/likes?where=movieId%3D%22${movieId}%22&distinct=_ownerId&count`,
    getLikeForUser: (movieId, userId) => `/data/likes?where=movieId%3D%22${movieId}%22%20and%20_ownerId%3D%22${userId}%22`,
    addLike: `/data/likes`
};

function getAllMovies()
{
    return api.get(BASE_URL + endPoints.moviesCollections);
}

function addMovie(data)
{
    return api.post(BASE_URL + endPoints.moviesCollections, data);
}

function updateMovie(id, data)
{
    return api.update(BASE_URL + endPoints.updateMovies(id), data);
}

function del(id)
{
    return api.del(BASE_URL + endPoints.deleteMovies(id));
}

function getMovieById(id)
{
    return api.get(BASE_URL + endPoints.getMovieById(id));
}

function getLikeCount(id)
{
    return api.get(BASE_URL + endPoints.likeCount(id));
}

function addLike(data)
{
    return api.post(BASE_URL + endPoints.addLike, data);
}

function getLikeForUser(movieId, userId)
{
    return api.get(BASE_URL + endPoints.getLikeForUser(movieId, userId));
}

export const dataService =
{
    getAllMovies,
    getMovieById,
    getLikeCount,
    addMovie,
    updateMovie,
    del,
    addLike,
    getLikeForUser
}