const sections = document.querySelectorAll("section");

function showSection(id) 
{
    sections.forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

showSection("years");

document.querySelectorAll("#years .date").forEach(el => 
{
    el.addEventListener("click", (e) => 
    {
        const year = e.target.textContent;

        showSection(`year-${year}`);
    });
});

const months = 
{
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sept: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12
};

document.querySelectorAll(".monthCalendar .date").forEach(el => 
{
    el.addEventListener("click", (e) => 
    {
        const monthName = e.target.textContent;

        const year = e.target.closest("table").querySelector("caption").textContent;

        const monthNumber = months[monthName];

        const id = `month-${year}-${monthNumber}`;

        showSection(id);
    });
});

document.querySelectorAll(".monthCalendar caption").forEach(el => 
{
    el.addEventListener("click", (e) => 
    {
        showSection("years");
    });
});

document.querySelectorAll(".daysCalendar caption").forEach(el => 
{
    el.addEventListener("click", (e) => 
    {
        const text = e.target.textContent;
        const year = text.split(" ")[1];

        showSection(`year-${year}`);
    });
});