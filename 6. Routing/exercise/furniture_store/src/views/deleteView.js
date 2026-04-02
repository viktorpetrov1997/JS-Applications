import { dataService } from "../service/dataService.js";

export async function deleteItem(ctx)
{
    const userAction = confirm("delete this item?");

    if(!userAction)
    {
        return;
    }
    
    const id = ctx.params.id;
    await dataService.deleteFurniture(id);
    ctx.goTo("/dashboard");
}