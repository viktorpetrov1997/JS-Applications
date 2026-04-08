const wrapper = document.getElementById("notifications");
const container = document.getElementById("errorBox");
const span = container.querySelector("span");

export function showNotification(errorMsg)
{
    container.style.display = "block";
    wrapper.style.display = "block";
    span.textContent = errorMsg;

    setTimeout(() => {
        container.style.display = "none";
        wrapper.style.display = "none";
    }, 3000);
}