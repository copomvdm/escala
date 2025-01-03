document.addEventListener("DOMContentLoaded", () => {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const calendarContainer = document.getElementById("calendar");
    const currentMonthLabel = document.getElementById("current-month");
    const statisticsContainer = document.getElementById("statistics");

    const today = new Date();
    let currentDate = new Date(today);
    const activeTeams = new Set();

    const dayPattern = ["A", "B", "A", "E", "B"];
    const nightPattern = ["E", "C", "D", "C", "D"];

    const feriados = {
        nacional: {
            "01/01": "Ano Novo",
            "21/04": "Tiradentes",
            "01/05": "Dia do Trabalho",
            "07/09": "Independência",
            "12/10": "Nossa Senhora Aparecida",
            "02/11": "Finados",
            "15/11": "Proclamação da República",
            "20/11": "Consciência Negra",
            "25/12": "Natal",
        },
        estadual: { "09/07": "Revolução Constitucionalista" },
        municipal: { "25/01": "Aniversário de SP" },
    };

    const isDiaEspecial = (date) => {
        const month = date.getMonth();
        const day = date.getDate();
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0) {
            const firstDayOfMonth = new Date(date.getFullYear(), month, 1).getDay();
            const firstSunday = firstDayOfMonth === 0 ? 1 : 8 - firstDayOfMonth;

            if ((month === 4 && day === firstSunday + 7)) return "Dia das Mães";
            if ((month === 7 && day === firstSunday + 7)) return "Dia dos Pais";
        }

        return null;
    };

    const isFeriado = (date) => {
        const formattedDate = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        return feriados.nacional[formattedDate] || feriados.estadual[formattedDate] || feriados.municipal[formattedDate] || isDiaEspecial(date);
    };

    const getShift = (index, pattern) => pattern[(index % pattern.length + pattern.length) % pattern.length];

    const calculateStatistics = (year, month, daysInMonth) => {
        const stats = { A: 0, B: 0, E: 0, C: 0, D: 0 };
        for (let i = 1; i <= daysInMonth; i++) {
            const shiftIndex = Math.floor((new Date(year, month, i) - new Date(2025, 0, 1)) / 86400000);
            stats[getShift(shiftIndex, dayPattern)]++;
            stats[getShift(shiftIndex, nightPattern)]++;
        }
        return stats;
    };

    const updateStatistics = (stats) => {
        statisticsContainer.innerHTML = "<h2>Estatísticas</h2>";
        Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)).forEach(([team, count]) => {
            const statDiv = document.createElement("div");
            statDiv.className = "stat-item";
            statDiv.textContent = `Equipe ${team}: ${count} dias trabalhados`;
            statisticsContainer.appendChild(statDiv);
        });
    };

    const toggleTeamHighlight = (team) => {
        activeTeams.has(team) ? activeTeams.delete(team) : activeTeams.add(team);
        updateCalendar();
    };

    document.querySelectorAll(".team-button").forEach(button => {
        button.addEventListener("click", () => {
            toggleTeamHighlight(button.dataset.team);
            button.classList.toggle("active");
        });
    });

    const syncSelects = () => {
        document.getElementById("month-select").value = currentDate.getMonth();
        document.getElementById("year-select").value = currentDate.getFullYear();
    };

    const updateCalendar = () => {
        calendarContainer.innerHTML = "";
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        currentMonthLabel.textContent = `${currentDate.toLocaleString("pt-BR", { month: "long" })} ${year}`;

        weekDays.forEach(day => {
            const headerDiv = document.createElement("div");
            headerDiv.className = "day header";
            headerDiv.textContent = day;
            calendarContainer.appendChild(headerDiv);
        });

        Array.from({ length: firstDay }, () => {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "day empty";
            calendarContainer.appendChild(emptyDiv);
        });

        Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            const shiftIndex = Math.floor((date - new Date(2025, 0, 1)) / 86400000);
            const feriadoNome = isFeriado(date);
            const dayDiv = document.createElement("div");
            const dayNumber = document.createElement("span");

            dayNumber.textContent = i + 1;
            dayDiv.className = "day";
            if (date.getDay() === 0 || feriadoNome) {
                dayDiv.classList.add("feriado");
                dayNumber.classList.add("feriado-numero");
            }

            if (date.toDateString() === today.toDateString()) {
                dayDiv.classList.add("today");
            
                // Adicionar o rodapé com "HOJE"
                const footerDiv = document.createElement("div");
                footerDiv.className = "today-footer";
                footerDiv.textContent = "HOJE";
                dayDiv.appendChild(footerDiv);
            }

            dayDiv.appendChild(dayNumber);
            if (feriadoNome) {
                const feriadoDiv = document.createElement("div");
                feriadoDiv.className = "feriado-nome";
                feriadoDiv.textContent = feriadoNome;
                dayDiv.appendChild(feriadoDiv);
            }

            ["day-shift", "night-shift"].forEach((shiftClass, idx) => {
                const shiftDiv = document.createElement("div");
                const team = getShift(shiftIndex, idx === 0 ? dayPattern : nightPattern);
                shiftDiv.className = `shift ${shiftClass}`;
                shiftDiv.textContent = `${idx === 0 ? "Dia" : "Noite"}: ${team}`;
                shiftDiv.setAttribute("data-team", team);

                if (activeTeams.has(team)) shiftDiv.classList.add("highlight");
                dayDiv.appendChild(shiftDiv);
            });

            calendarContainer.appendChild(dayDiv);
        });

        updateStatistics(calculateStatistics(year, month, daysInMonth));
        syncSelects();
    };

    ["prev-month", "next-month"].forEach((id, idx) => {
        document.getElementById(id).addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + (idx === 0 ? -1 : 1));
            updateCalendar();
        });
    });

    document.getElementById("today-button").addEventListener("click", () => {
        currentDate = new Date(today);
        updateCalendar();
    });

    document.querySelectorAll("#month-select, #year-select").forEach(select => {
        select.addEventListener("change", () => {
            currentDate.setMonth(document.getElementById("month-select").value);
            currentDate.setFullYear(document.getElementById("year-select").value);
            updateCalendar();
        });
    });

    updateCalendar();
});