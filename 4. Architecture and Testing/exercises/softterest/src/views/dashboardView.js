import { dataService } from "../api/dataService.js";

const dashboardSection = document.querySelector("div[data-section='dashboard']");
const main = document.querySelector("main");

let context = null;

export function showDashboardView(ctx)
{
    context = ctx;
    main.replaceChildren(dashboardSection);
    loadIdea();
}

async function loadIdea()
{
    const data = await dataService.getAll();
    dashboardSection.innerHTML = data.length === 0 ? getNoDataText() : "";
    data.forEach(x => dashboardSection.innerHTML += createIdea(x));
    dashboardSection.querySelectorAll("a").forEach(x => x.addEventListener("click", onDetails));
}

function createIdea(idea)
{
    return `
        <div class="card overflow-hidden current-card details" style="width: 20rem; height: 18rem;">
            <div class="card-body">
                <p class="card-text">${idea.title}</p>
            </div>
            <img class="card-image" src="${idea.img}" alt="Card image cap">
            <a class="btn" data-id=${idea._id} href="">Details</a>
        </div>
    `
}

function onDetails(e)
{
    e.preventDefault();

    const id = e.target.dataset.id;

    context.goTo("/details", id);
}

function getNoDataText()
{
    return `
        <h1>No ideas yet! Be the first one :)</h1>
    `
}