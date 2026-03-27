import { dataService } from "./dataService.js";
import { showDetailsView } from "./detailsView.js";

const section = document.querySelectorAll("section");
const editSection = document.getElementById("edit-movie");
document.querySelector("#edit-movie form").addEventListener("submit", onSubmit);

let currentMovieId = null;

export async function showEditView(e)
{
    e.preventDefault();

    currentMovieId = e.target.dataset.id;

    section.forEach(section => section.style.display = "none");
    editSection.style.display = "block";

    const movie = await dataService.getMovieById(currentMovieId);

    const form = editSection.querySelector("form");
    form.querySelector("[name='title']").value = movie.title;
    form.querySelector("[name='description']").value = movie.description;
    form.querySelector("[name='img']").value = movie.img;
}

async function onSubmit(e)
{
    e.preventDefault();

    const formData = new FormData(e.target);

    const { title, description, img } = Object.fromEntries(formData);

    if(!title || !description || !img)
    {
        return;
    }
    
    await dataService.updateMovie(currentMovieId, { title, description, img });

    // Redirect to details page of the same movie.
    // showDetailsView normally expects a click event: e.target.dataset.id to get the data-id 
    // from the clicked button in detailsView.js.
    // Since we don't have access to that id when calling the onSubmit function in another file
    // we create a FAKE event object that has the same structure to imitate a button with the same 
    // data-id getting clicked.
    showDetailsView({ target: { dataset: { id: currentMovieId } } });
}