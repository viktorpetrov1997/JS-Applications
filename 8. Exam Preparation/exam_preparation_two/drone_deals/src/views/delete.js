import { dataService } from "../data/data.js";
import { page } from "../lib.js";

export async function deleteHandler(ctx)
{
    const id = ctx.params.id;

    const userConfirm = confirm("Are you sure you want to delete this drone?");
    
    if(userConfirm)
    {
        userConfirm && await dataService.deleteById(id);
        page.redirect("/dashboard");
    }
}