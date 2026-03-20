import { dataService } from "./dataService.js";
import { userUtils } from "./userUtils.js";

const section = document.querySelectorAll("section");
const detailsView = document.getElementById("movie-example");

export async function showDetailsView(e)
{
    const id = e.target.dataset.id;

    section.forEach(x => x.style.display = "none");
    detailsView.style.display = "block";

    const data = await dataService.getMovieById(id);

    const isOwner = userUtils.isOwner(data._ownerId);

    const likeCount = await dataService.getLikeCount(id);

    showMovie(data, isOwner, likeCount);
}

function showMovie(data, isOwner, likeCount)
{
    detailsView.innerHTML = `
    <div class="container">
        <div class="row bg-light text-dark">
          <h1>Movie title: ${data.title}</h1>
          <div class="wrapper">
            <div class="col-md-8">
              <img class="img-thumbnail" src=${data.img} alt="Movie" />
            </div>
            <div class="col-md-4 text-center">
              <h3 class="my-3">Movie Description</h3>
              <p>
                ${data.description}
              </p>
                ${isOwner ?
                    `
                    <a class="btn btn-danger" href="#">Delete</a>
                    <a class="btn btn-warning" href="#">Edit</a>
                    <span class="enrolled-span">Liked ${likeCount}</span>
                    ` : ""
                }
                ${!isOwner ? `<a class="btn btn-primary" href="#">Like</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    `
}