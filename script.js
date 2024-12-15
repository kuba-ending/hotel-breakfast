const TIMES = Array.from({ length: 32 }, (_, i) => 
    `${String(5 + Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`
);
const ROOMS = [1, 2, 3, 4, 5, 7, 8, 10, 11, 13, 14, 15];
const storageKey = "breakfastData";

// Generowanie zakładek
function createTabs() {
    const tabsContainer = document.getElementById("tabs");
    tabsContainer.innerHTML = "";
    const today = new Date();
    for (let i = -3; i <= 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split("T")[0];
        const tab = document.createElement("div");
        tab.className = "tab";
        tab.dataset.date = formattedDate;
        tab.textContent = formattedDate;
        tab.onclick = () => activateTab(formattedDate);
        tabsContainer.appendChild(tab);
    }
    activateTab(today.toISOString().split("T")[0]);
}

// Aktywacja zakładki
function activateTab(date) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelector(`.tab[data-date="${date}"]`).classList.add("active");
    loadBreakfasts(date);
}

// Ładowanie godzin i pokoi
function populateForm() {
    const roomSelect = document.getElementById("room");
    const timeSelect = document.getElementById("time");

    roomSelect.innerHTML = ROOMS.map(room => `<option value="${room}">${room}</option>`).join("");
    timeSelect.innerHTML = TIMES.map(time => `<option value="${time}">${time}</option>`).join("");
}

// Dodawanie śniadania
function addBreakfast(event) {
    event.preventDefault();
    const room = document.getElementById("room").value;
    const time = document.getElementById("time").value;
    const people = document.getElementById("people").value;
    const date = document.querySelector(".tab.active").dataset.date;

    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!data[date]) data[date] = [];
    data[date].push({ room, time, people });
    localStorage.setItem(storageKey, JSON.stringify(data));
    loadBreakfasts(date);
}

// Wczytywanie śniadań
function loadBreakfasts(date) {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const breakfasts = data[date] || [];
    
    const tbody = document.querySelector("#breakfastTable tbody");
    tbody.innerHTML = "";
    breakfasts.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.room}</td>
            <td>
                <select class="edit-select" onchange="updateBreakfast('${date}', ${index}, 'time', this.value)">
                    ${TIMES.map(time => `<option value="${time}" ${time === entry.time ? 'selected' : ''}>${time}</option>`).join("")}
                </select>
            </td>
            <td>
                <input type="number" class="edit-select" min="1" max="10" value="${entry.people}" onchange="updateBreakfast('${date}', ${index}, 'people', this.value)">
            </td>
            <td>
                <button onclick="deleteBreakfast('${date}', ${index})">Usuń</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Aktualizacja śniadania
function updateBreakfast(date, index, field, value) {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    data[date][index][field] = value;
    localStorage.setItem(storageKey, JSON.stringify(data));
    loadBreakfasts(date);
}

// Usuwanie śniadania
function deleteBreakfast(date, index) {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    data[date].splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(data));
    loadBreakfasts(date);
}

// Kopiowanie do SMS
function copyAllBreakfasts() {
    const date = document.querySelector(".tab.active").dataset.date;
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const breakfasts = data[date] || [];
    
    const grouped = {};
    breakfasts.forEach(entry => {
        const key = `${entry.time}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(`${entry.room} (${entry.people} os.)`);
    });
    
    const message = `ŚNIADANIA\n${date}\n` + Object.keys(grouped).sort().map(time => 
        `${time} - ${grouped[time].join(", ")}`
    ).join("\n");
    
    navigator.clipboard.writeText(message).then(() => alert("Skopiowano!"));
}

// Inicjalizacja
document.getElementById("breakfastForm").addEventListener("submit", addBreakfast);
populateForm();
createTabs();
