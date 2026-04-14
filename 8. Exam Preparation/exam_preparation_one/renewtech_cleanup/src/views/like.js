import { dataService } from "../service/dataService.js";
import { page } from "../utility/library.js";

export async function likeSolution(ctx) 
{
    const id = ctx.params.id;

    await dataService.addLikeForSolution(id);

    page.redirect("/details/" + id);
}