const homeSection = document.querySelector("div[data-section='home']");
const main = document.querySelector("main");

export function showHomeView(ctx)
{
    homeSection.querySelector("a").addEventListener("click", (e) => 
    {
        e.preventDefault();
        return ctx.goTo("/dashboard");
    })
    main.replaceChildren(homeSection);
}