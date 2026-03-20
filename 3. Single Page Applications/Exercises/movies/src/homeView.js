import { userUtils } from "./userUtils.js";
import { dataService } from "./dataService.js";
import { showCreateView } from "./createMovieView.js";
import { showDetailsView } from "./detailsView.js";

const section = document.querySelectorAll("section");
const homeSection = document.getElementById("home-page");
const addMovieButton = document.getElementById("add-movie-button");
const movieContainer = document.getElementById("movie");
const movieList = document.getElementById("movies-list");

export function showHome()
{
    section.forEach(section => section.style.display = "none");
    homeSection.style.display = "block";

    if(userUtils.getUserData())
    {
        addMovieButton.style.display = "block";
        addMovieButton.querySelector("a").addEventListener("click", showCreateView);
    }

    movieContainer.style.display = "block";
    showAllMovies();
}

async function showAllMovies()
{
    movieList.innerHTML = "";

    const movies = await dataService.getAllMovies();

    movies.forEach(x => movieList.appendChild(createMovie(x)));
}

function createMovie(data)
{
    const userData = userUtils.getUserData();

    const li = document.createElement("li");
    li.classList.add("card", "mb-4");

    li.innerHTML = `
        <img class="card-img-top" src=${data.img} alt="Card image cap" width="400" />
        <div class="card-body">
                <h4 class="card-title">${data.title}</h4>
                <a href="#">
                </a>
            </div>
            <div class="card-footer">
                ${!!userData ?
                    `<button type="button" data-id=${data._id} class="btn btn-info">Details</button>`
                    : ""
                }
            </div>
    `
    !!userData && li.querySelector("button").addEventListener("click", showDetailsView);
    return li;
}