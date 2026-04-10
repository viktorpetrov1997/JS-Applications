const notificationsSection = document.getElementById("notifications");
const notificationsContainer = document.getElementById("errorBox");
const textMessage = notificationsContainer.querySelector("span");

export function showNotification(errorMessage)
{
    notificationsSection.style.display = "block";
    notificationsContainer.style.display = "block";
    textMessage.textContent = errorMessage;

    setTimeout(() => 
    {
        notificationsSection.style.display = "none";
        notificationsContainer.style.display = "none";
    }, 3000);
}