document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DO DOM ---
    const elements = {
        body: document.body,
        calendarBody: document.getElementById("calendarBody"),
        monthSelect: document.getElementById("monthSelect"),
        yearSelect: document.getElementById("yearSelect"),
        prevMonthBtn: document.getElementById("prevMonth"),
        nextMonthBtn: document.getElementById("nextMonth"),
        todayButton: document.getElementById("todayButton"),
        prevMonthNameEl: document.getElementById("prevMonthName"),
        nextMonthNameEl: document.getElementById("nextMonthName"),
        teamButtonsContainer: document.querySelector(".team-buttons"),
        estatisticaContainer: document.getElementById("estatisticaContainer"),
        calendarGridHeader: document.getElementById("calendarGridHeader"),
        themeToggle: document.getElementById("theme-toggle"),
    };

    // --- ESTADO DA APLICAÇÃO ---
    let currentDate = new Date();
    const highlightedTeams = new Set();
    let headerOffsetTop = 0;

    // --- DADOS E CONSTANTES ---
    const config = {
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        teamColors: { A: '#27ae60', B: '#2980b9', C: '#8e44ad', D: '#f39c12', E: '#c0392b' },
        daySequence: ["A", "B", "A", "E", "B"],
        nightSequence: ["E", "C", "D", "C", "D"],
        baseDate: new Date(2025, 0, 1),
        specialDateTypes: {
            'national-holiday': 'Feriado Nacional',
            'state-holiday': 'Feriado Estadual',
            'municipal-holiday': 'Feriado Municipal',
            'commemorative': 'Data Comemorativa',
        }
    };

    const getSpecialDates = (year) => {
        const easter = ((y) => {
            const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(y, month, day);
        })(year);
        const getSecondSunday = (targetMonth) => { const date = new Date(year, targetMonth, 1); let sundayCount = 0; while (sundayCount < 2) { if (date.getDay() === 0) sundayCount++; if (sundayCount < 2) date.setDate(date.getDate() + 1); } return date; };
        const mothersDay = getSecondSunday(4);
        const fathersDay = getSecondSunday(7);
        return {
            '0-1': { type: 'national-holiday', name: 'Ano Novo' }, '3-21': { type: 'national-holiday', name: 'Tiradentes' },
            '4-1': { type: 'national-holiday', name: 'Dia do Trabalho' }, '8-7': { type: 'national-holiday', name: 'Independência' },
            '9-12': { type: 'national-holiday', name: 'N. Sra. Aparecida' }, '10-2': { type: 'national-holiday', name: 'Finados' },
            '10-15': { type: 'national-holiday', name: 'Proclamação da República' }, '11-25': { type: 'national-holiday', name: 'Natal' },
            '0-25': { type: 'municipal-holiday', name: 'Aniv. de São Paulo' },
            '6-9': { type: 'state-holiday', name: 'Rev. Constitucionalista' }, '10-20': { type: 'state-holiday', name: 'Consciência Negra' },
            [`${easter.getMonth()}-${easter.getDate()}`]: { type: 'national-holiday', name: 'Páscoa' },
            [`${(d => new Date(d.setDate(d.getDate() - 47)))(new Date(easter)).getMonth()}-${(d => new Date(d.setDate(d.getDate() - 47)))(new Date(easter)).getDate()}`]: { type: 'commemorative', name: 'Carnaval' },
            [`${(d => new Date(d.setDate(d.getDate() - 2)))(new Date(easter)).getMonth()}-${(d => new Date(d.setDate(d.getDate() - 2)))(new Date(easter)).getDate()}`]: { type: 'national-holiday', name: 'Sexta-feira Santa' },
            [`${(d => new Date(d.setDate(d.getDate() + 60)))(new Date(easter)).getMonth()}-${(d => new Date(d.setDate(d.getDate() + 60)))(new Date(easter)).getDate()}`]: { type: 'national-holiday', name: 'Corpus Christi' },
            [`${mothersDay.getMonth()}-${mothersDay.getDate()}`]: { type: 'commemorative', name: 'Dia das Mães' },
            [`${fathersDay.getMonth()}-${fathersDay.getDate()}`]: { type: 'commemorative', name: 'Dia dos Pais' },
        };
    };

    const getTeamForDate = (targetDate) => {
        const diffTime = targetDate.setHours(0, 0, 0, 0) - config.baseDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(diffTime / 86400000);
        const dayIndex = (diffDays % config.daySequence.length + config.daySequence.length) % config.daySequence.length;
        const nightIndex = (diffDays % config.nightSequence.length + config.nightSequence.length) % config.nightSequence.length;
        return { dayTeam: config.daySequence[dayIndex], nightTeam: config.nightSequence[nightIndex] };
    };
    
    const createCellHTML = (date, isCurrentMonth, businessDayCounter) => {
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        const specialDates = getSpecialDates(year);
        const dateKey = `${month}-${day}`;
        const specialDate = specialDates[dateKey];
        
        const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isHoliday = specialDate && specialDate.type.includes('holiday');
        
        const { dayTeam, nightTeam } = getTeamForDate(new Date(date));
        
        let cellClasses = 'calendar-cell';
        if (!isCurrentMonth) cellClasses += ' other-month';
        if (isToday) cellClasses += ' current-day';
        if (date.getDay() === 0) cellClasses += ' sunday';
        if (specialDate) cellClasses += ` ${specialDate.type}`;

        let paymentIcon = '';
        if (isCurrentMonth && !isWeekend && !isHoliday) {
            businessDayCounter.count++;
            if (businessDayCounter.count === 5) {
                paymentIcon = `<i class="fas fa-sack-dollar payment-icon" data-tooltip="Dia de Pagamento"></i>`;
            }
        }
        
        const specialDateMarker = specialDate
            ? `<div class="special-date-marker" data-tooltip="${config.specialDateTypes[specialDate.type]}">${specialDate.name}</div>`
            : '';

        return `
            <div class="${cellClasses} animate-in">
                <div class="day-number-wrapper">
                    <span class="day-number">${day}</span>
                    ${isToday ? '<span class="today-marker">Hoje</span>' : ''}
                    ${paymentIcon}
                </div>
                <div class="day-details">
                    <div class="schedule-entry">
                        <i class="fas fa-sun animated-sun"></i>
                        <span class="team-pill" data-team="${dayTeam}"></span>
                        <span>Dia: ${dayTeam}</span>
                    </div>
                    <div class="schedule-entry">
                        <i class="fas fa-moon animated-moon"></i>
                        <span class="team-pill" data-team="${nightTeam}"></span>
                        <span>Noite: ${nightTeam}</span>
                    </div>
                </div>
                ${specialDateMarker}
            </div>`;
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const teamWorkDays = Object.fromEntries(Object.keys(config.teamColors).map(key => [key, 0]));

        elements.monthSelect.value = month;
        elements.yearSelect.value = year;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let cells = [];
        let businessDayCounter = { count: 0 };

        // Dias do mês anterior
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            cells.push(createCellHTML(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day), false, {count: -1})); // Não conta dia útil
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const { dayTeam, nightTeam } = getTeamForDate(new Date(cellDate));
            teamWorkDays[dayTeam]++;
            teamWorkDays[nightTeam]++;
            cells.push(createCellHTML(cellDate, true, businessDayCounter));
        }

        // Dias do próximo mês
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        const nextMonth = new Date(year, month + 1, 1);
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(createCellHTML(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), false, {count: -1}));
        }

        elements.calendarBody.innerHTML = cells.join('');
        
        renderStatistics(teamWorkDays);
        updateMonthNav();
        updateHighlights();
        
        setTimeout(() => {
            if (elements.calendarGridHeader) {
                headerOffsetTop = elements.calendarGridHeader.offsetTop;
            }
        }, 100);
    };

    const updateHighlights = () => {
        document.querySelectorAll('.team-pill').forEach(pill => {
            const team = pill.dataset.team;
            if (highlightedTeams.has(team)) {
                pill.classList.add('active-pill');
                pill.style.setProperty('--team-color', config.teamColors[team]);
            } else {
                pill.classList.remove('active-pill');
                pill.style.removeProperty('--team-color');
            }
        });
        document.querySelectorAll('.team-button').forEach(button => {
            const team = button.dataset.team;
            if (highlightedTeams.has(team)) {
                button.classList.add('active');
                button.style.setProperty('--team-color', config.teamColors[team]);
            } else {
                button.classList.remove('active');
                button.style.removeProperty('--team-color');
            }
        });
    };

    const renderStatistics = (teamWorkDays) => {
        let html = '';
        Object.entries(teamWorkDays).forEach(([team, count]) => {
            html += `<div class="statistic-item" style="border-color: ${config.teamColors[team]}"><span class="team">Equipe ${team}</span> <span>${count} plantões</span></div>`;
        });
        elements.estatisticaContainer.innerHTML = html;
    };

    const updateMonthNav = () => {
        const prevMonthDate = new Date(currentDate); prevMonthDate.setMonth(currentDate.getMonth() - 1);
        elements.prevMonthNameEl.textContent = config.months[prevMonthDate.getMonth()];
        const nextMonthDate = new Date(currentDate); nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        elements.nextMonthNameEl.textContent = config.months[nextMonthDate.getMonth()];
    };

    const handleStickyHeader = () => {
        if (elements.calendarGridHeader && window.scrollY > headerOffsetTop && headerOffsetTop > 0) {
            elements.calendarGridHeader.classList.add('sticky-active');
        } else {
            elements.calendarGridHeader.classList.remove('sticky-active');
        }
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            elements.body.classList.add('dark-mode');
            elements.themeToggle.checked = true;
        } else {
            elements.body.classList.remove('dark-mode');
            elements.themeToggle.checked = false;
        }
    };

    const init = () => {
        const currentYear = new Date().getFullYear();
        
        elements.yearSelect.innerHTML = Array.from({length: 3}, (_, i) => currentYear + i)
            .map(y => `<option value="${y}">${y}</option>`).join('');

        elements.monthSelect.innerHTML = config.months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
        
        currentDate = new Date();
        renderCalendar();

        // --- EVENT LISTENERS ---
        elements.prevMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        elements.nextMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        elements.todayButton.addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });
        elements.monthSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
        elements.yearSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
        
        elements.teamButtonsContainer.addEventListener("click", (e) => {
            if (e.target.matches('.team-button')) {
                const team = e.target.dataset.team;
                if (highlightedTeams.has(team)) {
                    highlightedTeams.delete(team);
                } else {
                    highlightedTeams.add(team);
                }
                updateHighlights();
            }
        });

        window.addEventListener('scroll', handleStickyHeader);

        elements.themeToggle.addEventListener('change', () => {
            const newTheme = elements.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});