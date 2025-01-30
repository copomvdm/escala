const calendarBody = document.getElementById("calendarBody");
const calendarDate = document.getElementById("calendarDate");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const teamButtons = document.querySelectorAll(".team-button");
const highlightedTeams = new Set();

const teamColors = {
    A: "#34d399",
    B: "#60a5fa",
    C: "#d196f3",
    D: "#fb923c",
    E: "#facc15"
};

const daySequence = ["A", "B", "A", "E", "B"];
const nightSequence = ["E", "C", "D", "C", "D"];
const baseDate = new Date(2025, 0, 1);

let date = new Date();

// Feriados fixos e municipais
const fixedHolidays = [
    { month: 0, day: 1, name: "Ano Novo" },
    { month: 3, day: 21, name: "Tiradentes" },
    { month: 4, day: 1, name: "Dia do Trabalho" },
    { month: 6, day: 9, name: "Rev. Constitucionalista" },
    { month: 8, day: 7, name: "Independência do Brasil" },
    { month: 9, day: 12, name: "Nossa Senhora Aparecida" },
    { month: 10, day: 2, name: "Finados" },
    { month: 10, day: 15, name: "Proclamação da República" },
    { month: 10, day: 20, name: "Consciência Negra" },
    { month: 11, day: 25, name: "Natal" }
];

const municipalHolidays = [
    { month: 0, day: 25, name: "Aniversário de São Paulo" }
];

// Cálculo da Páscoa e feriados móveis
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

function calculateMobileHolidays(year) {
    const easter = calculateEaster(year);
    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2); // Sexta-feira Santa
    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);

    return [
        { date: carnival, name: "Carnaval" },
        { date: goodFriday, name: "Paixão de Cristo" }, // Adicionado
        { date: easter, name: "Páscoa" },
        { date: corpusChristi, name: "Corpus Christi" }
    ];
}


function getHolidays(year) {
    const mobileHolidays = calculateMobileHolidays(year);

    const mothersDay = calculateSecondSunday(year, 4); // Maio (mês 4)
    const fathersDay = calculateSecondSunday(year, 7); // Agosto (mês 7)

    const allHolidays = [
        ...fixedHolidays.map(h => ({ date: new Date(year, h.month, h.day), name: h.name })),
        ...municipalHolidays.map(h => ({ date: new Date(year, h.month, h.day), name: h.name })),
        ...mobileHolidays,
        { date: mothersDay, name: "Dia das Mães" },
        { date: fathersDay, name: "Dia dos Pais" }
    ];

    return allHolidays.reduce((acc, holiday) => {
        const formattedDate = holiday.date.toISOString().split("T")[0];
        acc[formattedDate] = holiday.name;
        return acc;
    }, {});
}




function getDayIndex(targetDate) {
    const diffTime = targetDate - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayIndex = (diffDays % daySequence.length + daySequence.length) % daySequence.length;
    const nightIndex = (diffDays % nightSequence.length + nightSequence.length) % nightSequence.length;
    return { dayIndex, nightIndex };
}

function populateMonthSelect() {
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = date.getMonth();
}

function calculateSpecialSundays(year, month) {
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const offset = (dayOfWeek === 0) ? 7 : (7 - dayOfWeek); // Primeiro domingo no mês
    const secondSunday = offset + 7; // Segundo domingo é uma semana após o primeiro
    return new Date(year, month, secondSunday);
}

function calculateSecondSunday(year, month) {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstSundayOffset = (7 - firstDayOfMonth.getDay()) % 7; // Dias até o primeiro domingo
    const secondSundayDate = 1 + firstSundayOffset + 7; // Primeiro domingo + 7 dias
    return new Date(year, month, secondSundayDate);
}




function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 2; year++) { // Inicia no ano atual
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear; // Define o ano atual como selecionado por padrão
}


function updateCalendarDate() {
    const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const monthName = monthSelect.options[monthSelect.selectedIndex].text;
    const year = yearSelect.value;

    // Atualiza o título do calendário
    calendarDate.textContent = `${monthName} de ${year}`;

    // Verifica se há meses anteriores para mostrar
    const prevContainer = document.querySelector(".prev-container");
    if (date.getMonth() === 0 && date.getFullYear() === new Date().getFullYear()) {
        // Janeiro do ano atual: aplica a classe "hidden"
        prevContainer.classList.add("hidden");
    } else {
        // Mostra o botão e o span, removendo a classe "hidden"
        prevContainer.classList.remove("hidden");

        // Calcula e exibe o mês anterior
        const prevMonthIndex = (date.getMonth() === 0) ? 11 : date.getMonth() - 1;
        const prevMonthName = months[prevMonthIndex];
        document.getElementById("prevMonthName").textContent = prevMonthName;
    }

    // Calcula e exibe o mês posterior
    const nextMonthIndex = (date.getMonth() === 11) ? 0 : date.getMonth() + 1;
    const nextMonthName = months[nextMonthIndex];
    document.getElementById("nextMonthName").textContent = nextMonthName;
}





function renderCalendar() {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const holidays = getHolidays(year);

    updateCalendarDate();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    calendarBody.innerHTML = "";

    const dayHeaders = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    dayHeaders.forEach(day => {
        const header = document.createElement("div");
        header.classList.add("day-header");
        header.textContent = day;
        calendarBody.appendChild(header);
    });

    // Inicializa contadores de dias por equipe
    const teamWorkDays = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0
    };

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-cell");
        calendarBody.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const { dayIndex, nightIndex } = getDayIndex(currentDate);
        const dayTeam = daySequence[dayIndex];
        const nightTeam = nightSequence[nightIndex];
        const formattedDate = currentDate.toISOString().split("T")[0];

        // Incrementa contadores de dias trabalhados
        teamWorkDays[dayTeam]++;
        teamWorkDays[nightTeam]++;

        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");

        if (currentDate.getDay() === 0) {
            cell.classList.add("sunday");
        }

        if (holidays[formattedDate]) {
            cell.classList.add("holiday");
        }

        if (
            currentDate.getDate() === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        ) {
            cell.classList.add("current-day");

            const todayLabel = document.createElement("div");
            todayLabel.classList.add("today-label");
            todayLabel.textContent = "HOJE";
            cell.appendChild(todayLabel);
        }

        const dayNumber = document.createElement("div");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day;

        const dayDetails = document.createElement("div");
        dayDetails.classList.add("day-details");
        dayDetails.innerHTML = `
                    <span class="day-text ${highlightedTeams.has(dayTeam) ? "highlighted" : ""}" style="--team-color: ${teamColors[dayTeam]}">Dia: ${dayTeam}</span>
                    <span class="night-text ${highlightedTeams.has(nightTeam) ? "highlighted" : ""}" style="--team-color: ${teamColors[nightTeam]}">Noite: ${nightTeam}</span>
                `;

        if (holidays[formattedDate]) {
            const holidayName = document.createElement("div");
            holidayName.classList.add("holiday-name");
            holidayName.textContent = holidays[formattedDate];
            cell.appendChild(dayNumber);
            cell.appendChild(holidayName);
        } else {
            cell.appendChild(dayNumber);
        }

        cell.appendChild(dayDetails);
        calendarBody.appendChild(cell);
    }

    // Atualiza a div estatística com os dados calculados
    const estatisticaDiv = document.querySelector(".estatistica");
    estatisticaDiv.innerHTML = "<h3>Estatísticas de Trabalho</h3>";
    Object.keys(teamWorkDays).forEach(team => {
        const teamStat = document.createElement("div");
        teamStat.innerHTML = `
        <span class="team">Equipe ${team}</span>
        <span>${teamWorkDays[team]} dias</span>
    `;
        estatisticaDiv.appendChild(teamStat);
    });
}



document.addEventListener("DOMContentLoaded", () => {
    populateMonthSelect();
    populateYearSelect();
    renderCalendar();

    prevMonth.addEventListener("click", () => {
        let currentMonth = parseInt(monthSelect.value);
        let currentYear = parseInt(yearSelect.value);
    
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    
        date = new Date(currentYear, currentMonth, 1);
        monthSelect.value = currentMonth;
        yearSelect.value = currentYear;
        renderCalendar();
    });

    nextMonth.addEventListener("click", () => {
        let currentMonth = parseInt(monthSelect.value);
        let currentYear = parseInt(yearSelect.value);
    
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    
        date = new Date(currentYear, currentMonth, 1);
        monthSelect.value = currentMonth;
        yearSelect.value = currentYear;
        renderCalendar();
    });

    monthSelect.addEventListener("change", () => {
        let selectedMonth = parseInt(monthSelect.value);
        let selectedYear = parseInt(yearSelect.value);
        date = new Date(selectedYear, selectedMonth, 1);
        renderCalendar();
    });

    yearSelect.addEventListener("change", () => {
        let selectedMonth = parseInt(monthSelect.value);
        let selectedYear = parseInt(yearSelect.value);
        date = new Date(selectedYear, selectedMonth, 1);
        renderCalendar();
    });

    teamButtons.forEach(button => {
        button.addEventListener("click", () => {
            const team = button.dataset.team;
            if (highlightedTeams.has(team)) {
                highlightedTeams.delete(team);
                button.style.backgroundColor = "#e0e0e0";
                button.classList.remove("active");
            } else {
                highlightedTeams.add(team);
                button.style.backgroundColor = teamColors[team];
                button.classList.add("active");
            }
            renderCalendar();
        });
    });

    // Adiciona o evento de clique para voltar à data atual
    document.getElementById("todayButton").addEventListener("click", () => {
        date = new Date(); // Define a data atual
        monthSelect.value = date.getMonth(); // Atualiza o seletor de mês
        yearSelect.value = date.getFullYear(); // Atualiza o seletor de ano
        renderCalendar(); // Re-renderiza o calendário
    });

    renderCalendar();
});