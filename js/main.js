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
        // NOVO ELEMENTO ADICIONADO
        currentMonthYear: document.getElementById("currentMonthYear"), 
    };

    // --- ESTADO DA APLICAÇÃO ---
    let currentDate = new Date();
    const highlightedTeams = new Set();
    let headerOffsetTop = 0;
    
    // --- LÓGICA DE CONTROLE DE NAVEGAÇÃO ---
    let updateNavButtonStates = () => {}; 

    // --- DADOS E CONSTANTES ---
    const config = {
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        teamColors: {
            A: { bg: '#a7f3d0', text: '#065f46' }, // Verde Menta | Texto Verde Escuro
            B: { bg: '#bfdbfe', text: '#1e40af' }, // Azul Céu | Texto Azul Escuro
            C: { bg: '#ddd6fe', text: '#5b21b6' }, // Lavanda | Texto Roxo Escuro
            D: { bg: '#fed7aa', text: '#9a3412' }, // Pêssego | Texto Laranja Escuro
            E: { bg: '#fef08a', text: '#854d0e' }  // Amarelo Baunilha | Texto Amarelo Queimado
        },
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
        // ... (seu código de cálculo da Páscoa permanece o mesmo) ...
        const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(y, month, day);
    })(year);

    // Funções auxiliares para calcular datas baseadas na Páscoa
    const getDateOffset = (baseDate, offsetDays) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + offsetDays);
        return d;
    };

    const carnivalTuesday = getDateOffset(easter, -47);    // Terça-feira de Carnaval
    const carnivalMonday = getDateOffset(easter, -48);     // Segunda-feira de Carnaval
    const ashWednesday = getDateOffset(easter, -46);       // Quarta-feira de Cinzas
    const goodFriday = getDateOffset(easter, -2);          // Sexta-feira Santa
    const corpusChristi = getDateOffset(easter, 60);       // Corpus Christi

    // Funções para calcular Dia das Mães e Dia dos Pais (já existentes)
    const getSecondSunday = (targetMonth) => { 
        const date = new Date(year, targetMonth, 1); 
        let sundayCount = 0; 
        while (sundayCount < 2) { 
            if (date.getDay() === 0) sundayCount++; 
            if (sundayCount < 2) date.setDate(date.getDate() + 1); 
        } 
        return date; 
    };
    const mothersDay = getSecondSunday(4); // Mês 4 é Maio
    const fathersDay = getSecondSunday(7); // Mês 7 é Agosto

    return {
        // Feriados Nacionais Fixos
        '0-1': { type: 'national-holiday', name: 'Ano Novo' }, // 1 de Janeiro
        '3-21': { type: 'national-holiday', name: 'Tiradentes' }, // 21 de Abril
        '4-1': { type: 'national-holiday', name: 'Dia do Trabalho' }, // 1 de Maio
        '8-7': { type: 'national-holiday', name: 'Independência do Brasil' }, // 7 de Setembro
        '9-12': { type: 'national-holiday', name: 'Nossa Senhora Aparecida' }, // 12 de Outubro
        '10-2': { type: 'national-holiday', name: 'Finados' }, // 2 de Novembro
        '10-15': { type: 'national-holiday', name: 'Proclamação da República' }, // 15 de Novembro
        '11-25': { type: 'national-holiday', name: 'Natal' }, // 25 de Dezembro

        // Feriados Estaduais de São Paulo
        '6-9': { type: 'state-holiday', name: 'Revolução Constitucionalista' }, // 9 de Julho
        '10-20': { type: 'state-holiday', name: 'Consciência Negra' }, // 20 de Novembro

        // Feriados Municipais de São Paulo
        '0-25': { type: 'municipal-holiday', name: 'Aniversário de São Paulo' }, // 25 de Janeiro
        '5-29': { type: 'municipal-holiday', name: 'Dia de São Pedro e São Paulo' }, // 29 de Junho

        // Feriados Móveis (baseados na Páscoa)
        [`${goodFriday.getMonth()}-${goodFriday.getDate()}`]: { type: 'national-holiday', name: 'Sexta-feira Santa' }, // Feriado Nacional
        [`${carnivalMonday.getMonth()}-${carnivalMonday.getDate()}`]: { type: 'national-holiday', name: 'Carnaval (Segunda)' }, // Marcado como 'national-holiday' conforme solicitado
        [`${carnivalTuesday.getMonth()}-${carnivalTuesday.getDate()}`]: { type: 'national-holiday', name: 'Carnaval (Terça)' }, // Marcado como 'national-holiday' conforme solicitado
        [`${ashWednesday.getMonth()}-${ashWednesday.getDate()}`]: { type: 'commemorative', name: 'Quarta-feira de Cinzas' }, // Mantido como 'commemorative' (ponto facultativo)
        [`${corpusChristi.getMonth()}-${corpusChristi.getDate()}`]: { type: 'national-holiday', name: 'Corpus Christi' }, // Mantido como 'municipal-holiday' para SP

        // Datas Comemorativas (se quiser exibir no calendário)
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
                    <div class="schedule-entry" data-team="${dayTeam}">
                        <i class="fas fa-sun animated-sun"></i>
                        <span>Dia: ${dayTeam}</span>
                    </div>
                    <div class="schedule-entry" data-team="${nightTeam}">
                        <i class="fas fa-moon animated-moon"></i>
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

        // ATUALIZA O CABEÇALHO DO MÊS
        elements.currentMonthYear.textContent = `${config.months[month]} de ${year}`;

        elements.monthSelect.value = month;
        elements.yearSelect.value = year;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let cells = [];
        let businessDayCounter = { count: 0 };

        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDayOfMonth; i > 0; i--) {
            cells.push(createCellHTML(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i + 1), false, {count: -1}));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const { dayTeam, nightTeam } = getTeamForDate(new Date(cellDate));
            teamWorkDays[dayTeam]++;
            teamWorkDays[nightTeam]++;
            cells.push(createCellHTML(cellDate, true, businessDayCounter));
        }

        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        const nextMonth = new Date(year, month + 1, 1);
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(createCellHTML(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), false, {count: -1}));
        }

        elements.calendarBody.innerHTML = cells.join('');
        
        renderStatistics(teamWorkDays);
        updateMonthNav();
        updateHighlights();
        
        // Chama a função que oculta ou mostra os botões de navegação
        updateNavButtonStates();
        
        setTimeout(() => {
            if (elements.calendarGridHeader) {
                headerOffsetTop = elements.calendarGridHeader.offsetTop;
            }
        }, 100);
    };
    
    const triggerHighlightAnimation = (team) => {
        const entries = document.querySelectorAll(`.schedule-entry[data-team="${team}"]`);
        entries.forEach(entry => {
            entry.classList.add('highlight-animation');
            entry.addEventListener('animationend', () => {
                entry.classList.remove('highlight-animation');
            }, { once: true });
        });
    };
    
    const updateHighlights = () => {
        document.querySelectorAll('.schedule-entry').forEach(entry => {
            const team = entry.dataset.team;
            const icon = entry.querySelector('i');
            const teamStyle = config.teamColors[team];

            if (highlightedTeams.has(team)) {
                entry.style.backgroundColor = teamStyle.bg;
                entry.style.color = teamStyle.text;
                if (icon) icon.style.color = teamStyle.text;
            } else {
                entry.style.backgroundColor = '';
                entry.style.color = '';
                if (icon) {
                    icon.style.color = ''; 
                }
            }
        });

        document.querySelectorAll('.team-button').forEach(button => {
            const team = button.dataset.team;
            if (highlightedTeams.has(team)) {
                button.classList.add('active');
                button.style.setProperty('--team-bg-color', config.teamColors[team].bg);
                button.style.setProperty('--team-text-color', config.teamColors[team].text);
            } else {
                button.classList.remove('active');
                button.style.removeProperty('--team-bg-color');
                button.style.removeProperty('--team-text-color');
            }
        });
    };

    const renderStatistics = (teamWorkDays) => {
        let html = '';
        Object.entries(teamWorkDays).forEach(([team, count]) => {
            html += `<div class="statistic-item" style="border-color: ${config.teamColors[team].bg}"><span class="team">Equipe ${team}</span> <span>${count} plantões</span></div>`;
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
        // Define os anos permitidos
        const startYear = new Date().getFullYear();
        const endYear = startYear + 2;
        
        // Popula o seletor de anos com o intervalo correto
        elements.yearSelect.innerHTML = Array.from({length: 3}, (_, i) => startYear + i)
            .map(y => `<option value="${y}">${y}</option>`).join('');

        // Popula o seletor de meses
        elements.monthSelect.innerHTML = config.months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
        
        currentDate = new Date();

        // --- FUNÇÃO DE CONTROLE DE NAVEGAÇÃO ---
        updateNavButtonStates = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Verifica se está no primeiro mês do primeiro ano
            const isAtStart = year <= startYear && month === 0;
            // Verifica se está no último mês do último ano
            const isAtEnd = year >= endYear && month === 11;

            // Adiciona ou remove a classe 'disabled' (que oculta o botão via CSS)
            elements.prevMonthBtn.classList.toggle('disabled', isAtStart);
            elements.nextMonthBtn.classList.toggle('disabled', isAtEnd);
        };
        
        renderCalendar();

        // --- EVENT LISTENERS ---
        elements.prevMonthBtn.addEventListener("click", (e) => { 
            e.preventDefault(); 
            currentDate.setMonth(currentDate.getMonth() - 1); 
            renderCalendar(); 
        });
        elements.nextMonthBtn.addEventListener("click", (e) => { 
            e.preventDefault(); 
            currentDate.setMonth(currentDate.getMonth() + 1); 
            renderCalendar(); 
        });
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
                    triggerHighlightAnimation(team);
                }
                updateHighlights();
            }
        });

        window.addEventListener('scroll', handleStickyHeader);

        elements.themeToggle.addEventListener("change", () => {
            const newTheme = elements.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});