import { dataService } from "./dataService.js";
import { userUtils } from "./userUtils.js";
import { showHome } from "./homeView.js";
import { showEditView } from "./editMovieView.js";

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

    const userId = userUtils.getId();

    let hasLiked = false;

    if(userId)
    {
        const liked = await dataService.getLikeForUser(id, userId);

        if(liked.length > 0)
        {
            hasLiked = true;
        }
    }

    showMovie(data, isOwner, likeCount, hasLiked);
}

function showMovie(data, isOwner, likeCount, hasLiked)
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
                    <a class="btn btn-danger" data-action="delete" data-id=${data._id} href="#">Delete</a>
                    <a class="btn btn-warning" data-action="edit" data-id=${data._id} href="#">Edit</a>
                    <span class="enrolled-span">Liked ${likeCount}</span>
                    ` : ""
                }
                ${!isOwner && !hasLiked ? `<a class="btn btn-primary" data-action="like" data-id=${data._id} href="#">Like</a>` : ""}
                ${!isOwner && hasLiked ? `<span class="enrolled-span">Liked ${likeCount}</span>` : ""}
            </div>
          </div>
        </div>
      </div>
    `

    detailsView.querySelector("a[data-action='delete']")?.addEventListener("click", deleteMovie);
    detailsView.querySelector("a[data-action='like']")?.addEventListener("click", onLike);
    detailsView.querySelector("a[data-action='edit']")?.addEventListener("click", showEditView);
}

async function deleteMovie(e)
{
    e.preventDefault();
    const id = e.target.dataset.id;
    await dataService.del(id);
    showHome();
}

async function onLike(e)
{
    e.preventDefault();
    const id = e.target.dataset.id;
    const userId = userUtils.getId();

    await dataService.addLike({ movieId: id });

    showDetailsView({ target: { dataset: { id } } }); 
}