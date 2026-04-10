import { dataService } from "../service/dataService.js";
import { page } from "../utility/library.js";

export async function deleteHandler(ctx)
{
    const id = ctx.params.id;

    const userConfirm = confirm("Are you sure you want to delete this item?");
    
    if(userConfirm)
    {
        userConfirm && await dataService.deleteItemById(id);
        page.redirect("/dashboard");
    }
}