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
        stickyHeaderContainer: document.getElementById("stickyHeaderContainer"),
        themeToggle: document.getElementById("theme-toggle"),
        currentMonthYear: document.getElementById("currentMonthYear"),
        modal: document.getElementById("specialDateModal"),
        modalTitle: document.getElementById("modalTitle"),
        modalSummary: document.getElementById("modalSummary"),
        modalMotivation: document.getElementById("modalMotivation"),
        modalCloseBtn: document.querySelector(".modal-close-btn"),
        paymentTooltip: document.getElementById('paymentTooltip'),
    };

    // --- ESTADO DA APLICAÇÃO ---
    let currentDate = new Date();
    const highlightedTeams = new Set();
    let headerOffsetTop = 0;
    let tooltipAnimationId = null;
    let hoveredIcon = null;
    const specialDatesCache = {};

    // --- FUNÇÕES AUXILIARES ---

    // INÍCIO DA ATUALIZAÇÃO: Função throttle para otimizar eventos de scroll
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    // FIM DA ATUALIZAÇÃO

    let updateNavButtonStates = () => { };

    // --- DADOS E CONSTANTES ---
    const config = {
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        teamColors: {
            A: { bg: '#a7f3d0', text: '#065f46' },
            B: { bg: '#bfdbfe', text: '#1e40af' },
            C: { bg: '#ddd6fe', text: '#5b21b6' },
            D: { bg: '#fed7aa', text: '#9a3412' },
            E: { bg: '#fef08a', text: '#854d0e' }
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
        if (specialDatesCache[year]) {
            return specialDatesCache[year];
        }

        const easter = ((y) => {
            const a = y % 19,b = Math.floor(y / 100),c = y % 100,d = Math.floor(b / 4),e = b % 4,f = Math.floor((b + 8) / 25),g = Math.floor((b - f + 1) / 3),h = (19 * a + b - d - g + 15) % 30,i = Math.floor(c / 4),k = c % 4,l = (32 + 2 * e + 2 * i - h - k) % 7,m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(y, month, day);
        })(year);

        const getDateOffset = (baseDate, offsetDays) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + offsetDays);
            return d;
        };

        const carnivalTuesday = getDateOffset(easter, -47);
        const carnivalMonday = getDateOffset(easter, -48);
        const ashWednesday = getDateOffset(easter, -46);
        const goodFriday = getDateOffset(easter, -2);
        const corpusChristi = getDateOffset(easter, 60);
        const getSecondSunday = (targetMonth) => {
            const date = new Date(year, targetMonth, 1);
            let sundayCount = 0;
            while (sundayCount < 2) {
                if (date.getDay() === 0) sundayCount++;
                if (sundayCount < 2) date.setDate(date.getDate() + 1);
            }
            return date;
        };
        const mothersDay = getSecondSunday(4);
        const fathersDay = getSecondSunday(7);

        const dates = {
            '0-1': { 
                type: 'national-holiday', 
                name: 'Ano Novo', 
                summary: 'Celebração universal que marca o início de um novo ciclo, um momento de renovação, esperança e planejamento para o futuro.', 
                motivation: 'Que a jornada deste novo ano seja repleta de realizações, superações e alegrias. Um feliz e próspero recomeço a todos!' 
            },
            '3-21': { 
                type: 'national-holiday', 
                name: 'Tiradentes', 
                summary: 'Homenagem a Joaquim José da Silva Xavier, herói nacional e mártir da Inconfidência Mineira, que lutou pelos ideais de liberdade e independência no Brasil.', 
                motivation: 'Que o legado de Tiradentes nos inspire a lutar por um país mais justo e livre. A coragem de um pode transformar uma nação.' 
            },
            '4-1': { 
                type: 'national-holiday', 
                name: 'Dia do Trabalho', 
                summary: 'Data internacional de homenagem às lutas e conquistas dos trabalhadores por melhores condições, direitos e uma sociedade mais justa.', 
                motivation: 'A cada profissional que, com sua dedicação e esforço diário, constrói e move nosso país: nosso respeito e gratidão. Parabéns pelo seu dia!' 
            },
            '8-7': { 
                type: 'national-holiday', 
                name: 'Independência do Brasil', 
                summary: 'Celebração do 7 de setembro de 1822, marco da soberania nacional em que o Brasil rompeu os laços coloniais com Portugal, declarando sua independência.', 
                motivation: 'Que o brado da independência ecoe em nossos corações, fortalecendo a união e o compromisso com o futuro de nossa Pátria. Viva o Brasil!' 
            },
            '9-12': { 
                type: 'national-holiday', 
                name: 'Nossa Senhora Aparecida', 
                summary: 'Dia de devoção à Padroeira do Brasil, Nossa Senhora Aparecida. Uma data que une milhões de fiéis em manifestações de fé por todo o país.', 
                motivation: 'Sob o manto de Nossa Senhora Aparecida, que encontremos proteção, conforto e esperança para seguir em frente com fé e coragem.' 
            },
            '10-2': { 
                type: 'national-holiday', 
                name: 'Finados', 
                summary: 'Momento de reflexão, saudade e homenagem à memória daqueles que partiram, mantendo vivo o legado e as boas lembranças que deixaram.', 
                motivation: 'O amor e as memórias que compartilhamos são eternos. Que este dia seja de paz, lembrança e conforto aos corações.' 
            },
            '10-15': { 
                type: 'national-holiday', 
                name: 'Proclamação da República', 
                summary: 'Comemoração do 15 de novembro de 1889, data que marcou o fim da monarquia e o início do regime republicano no Brasil, consolidando a cidadania.',
                motivation: 'Que os ideais de &quot;Ordem e Progresso&quot; e os princípios da República nos guiem na construção de uma nação cada vez mais democrática e igualitária.' 
            },
            '11-25': { 
                type: 'national-holiday', 
                name: 'Natal', 
                summary: 'Celebração do nascimento de Jesus Cristo, um momento de confraternização, união familiar e reflexão sobre o amor, a paz e a solidariedade.', 
                motivation: 'Que o espírito natalino renove nossas esperanças e nos inspire a compartilhar o bem. Um Natal de muita luz e harmonia para você e sua família!' 
            },
            '6-9': { 
                type: 'state-holiday', 
                name: 'Revolução Constitucionalista', 
                summary: 'Data magna do Estado de São Paulo, que rememora o movimento de 1932. Uma homenagem à bravura dos paulistas que lutaram por um Brasil constitucional.', 
                motivation: 'A memória de 32 vive! Que o exemplo de coragem e amor por São Paulo e pelo Brasil nos inspire a defender a democracia e a justiça.' 
            },
            '10-20': { 
                type: 'state-holiday', 
                name: 'Consciência Negra', 
                summary: 'Dia dedicado à reflexão sobre a inserção do negro na sociedade brasileira, homenageando a luta de Zumbi dos Palmares e a rica herança cultural afro-brasileira.', 
                motivation: 'Uma sociedade justa se constrói com igualdade, respeito e reconhecimento. Que a luta contra o racismo seja um compromisso diário de todos nós.' 
            },
            '0-25': { 
                type: 'municipal-holiday', 
                name: 'Aniversário de São Paulo', 
                summary: 'Celebração da fundação do Colégio de São Paulo de Piratininga em 1554, marco inicial da metrópole que se tornaria o coração pulsante do Brasil.', 
                motivation: 'Parabéns, São Paulo! Cidade de todos os povos, que acolhe, inspira e trabalha incansavelmente pelo progresso.' 
            },
            [`${goodFriday.getMonth()}-${goodFriday.getDate()}`]: { 
                type: 'national-holiday', 
                name: 'Sexta-feira Santa', 
                summary: 'Dia de profundo significado para os cristãos, que relembram a paixão e a crucificação de Jesus Cristo. É um dia de silêncio, oração e penitência.', 
                motivation: 'Que a reflexão deste dia nos traga um entendimento mais profundo sobre o amor, o perdão e a esperança que se renova.' 
            },
            [`${carnivalMonday.getMonth()}-${carnivalMonday.getDate()}`]: { 
                type: 'national-holiday', 
                name: 'Carnaval (Segunda)', 
                summary: 'Um dos pontos altos da maior festa popular do país, um dia de efervescência cultural, blocos de rua e a magia dos desfiles das escolas de samba.', 
                motivation: 'Mergulhe na folia! Que a alegria contagiante do Carnaval inspire momentos inesquecíveis e recarregue as energias.' 
            },
            [`${carnivalTuesday.getMonth()}-${carnivalTuesday.getDate()}`]: { 
                type: 'national-holiday', 
                name: 'Carnaval (Terça)', 
                summary: 'O ápice e a despedida da folia. O último dia oficial de Carnaval é marcado por uma celebração intensa antes do início da Quaresma.', 
                motivation: 'Aproveite até o último confete! Que a lembrança da festa nos traga sorrisos e a certeza de que a vida é feita para ser celebrada.' 
            },
            [`${ashWednesday.getMonth()}-${ashWednesday.getDate()}`]: { 
                type: 'commemorative', 
                name: 'Quarta-feira de Cinzas', 
                summary: 'Início da Quaresma para os cristãos. Um dia que simboliza a mortalidade e o arrependimento, convidando à conversão e à reflexão interior.', 
                motivation: 'Que este seja um tempo para repensar atitudes, perdoar, agradecer e se preparar para um novo ciclo de crescimento espiritual.' 
            },
            [`${corpusChristi.getMonth()}-${corpusChristi.getDate()}`]: { 
                type: 'national-holiday', 
                name: 'Corpus Christi', 
                summary: 'Solenidade da Igreja Católica que celebra o sacramento da Eucaristia. A data é marcada por procissões e pela tradição dos tapetes coloridos.', 
                motivation: 'Que o simbolismo de união e fé deste dia renove nossas forças e nos inspire a construir um caminho de mais paz e fraternidade.' 
            },
            [`${mothersDay.getMonth()}-${mothersDay.getDate()}`]: { 
                type: 'commemorative', 
                name: 'Dia das Mães', 
                summary: 'Uma data especial para celebrar e agradecer a todas as figuras maternas por seu amor incondicional, dedicação, força e inspiração em nossas vidas.', 
                motivation: 'Para quem é sinônimo de amor, cuidado e porto seguro: um dia de reconhecimento e carinho. Feliz Dia das Mães!' 
            },
            [`${fathersDay.getMonth()}-${fathersDay.getDate()}`]: { 
                type: 'commemorative', 
                name: 'Dia dos Pais', 
                summary: 'Dia dedicado a homenagear e reconhecer a importância da figura paterna, celebrando o amor, o cuidado, a proteção e os ensinamentos.', 
                motivation: 'Para o nosso primeiro herói, guia e amigo, toda a nossa admiração e gratidão. Feliz Dia dos Pais a todos que desempenham este papel!' 
            },
            '11-15': { 
                type: 'commemorative', 
                name: 'Aniversário da PMESP', 
                summary: 'Comemoração da fundação da Polícia Militar do Estado de São Paulo, uma instituição histórica e pilar na proteção da sociedade e manutenção da ordem pública.', 
                motivation: 'Nossa homenagem e profundo respeito aos homens e mulheres que, com bravura e dedicação, honram a farda e protegem o povo paulista. Parabéns, PMESP!' 
            },
        };
        
        specialDatesCache[year] = dates;
        return dates;
    };

    const getTeamForDate = (targetDate) => {
        const diffTime = targetDate.setHours(0, 0, 0, 0) - config.baseDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(diffTime / 86400000);
        const dayIndex = (diffDays % config.daySequence.length + config.daySequence.length) % config.daySequence.length;
        const nightIndex = (diffDays % config.nightSequence.length + config.nightSequence.length) % config.nightSequence.length;
        return { dayTeam: config.daySequence[dayIndex], nightTeam: config.nightSequence[nightIndex] };
    };

    const createCellHTML = (date, isCurrentMonth, businessDayCounter, specialDates) => {
        const day = date.getDate();
        const month = date.getMonth();
        const today = new Date();
        const dayOfWeek = date.getDay();
        const dayName = config.weekdaysShort[dayOfWeek];
        const dateKey = `${month}-${day}`;
        const specialDate = specialDates[dateKey];

        const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === date.getFullYear();
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

        const specialDateMarker = specialDate ?
            `<div class="special-date-marker" data-tooltip="${config.specialDateTypes[specialDate.type]}">
                ${specialDate.name}
                <i class="fas fa-info-circle date-info-icon" 
                   data-name="${specialDate.name}" 
                   data-summary="${specialDate.summary}" 
                   data-motivation="${specialDate.motivation}"></i>
            </div>` : '';

        return `
            <div class="${cellClasses} animate-in">
                <div class="day-number-wrapper">
                    <span class="day-name">${dayName}</span>
                    <span class="day-number">${day}</span>
                    ${isToday ? '<span class="today-marker">Hoje</span>' : ''}
                    ${paymentIcon}
                </div>
                <div class="day-details">
                    <div class="schedule-entry" data-team="${dayTeam}"><i class="fas fa-sun animated-sun"></i><span>Dia: ${dayTeam}</span></div>
                    <div class="schedule-entry" data-team="${nightTeam}"><i class="fas fa-moon animated-moon"></i><span>Noite: ${nightTeam}</span></div>
                </div>
                ${specialDateMarker}
            </div>`;
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const teamWorkDays = Object.fromEntries(Object.keys(config.teamColors).map(key => [key, 0]));

        elements.currentMonthYear.textContent = `${config.months[month]} de ${year}`;
        elements.monthSelect.value = month;
        elements.yearSelect.value = year;

        const specialDatesForYear = getSpecialDates(year);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let cells = [];
        let businessDayCounter = { count: 0 };

        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDayOfMonth; i > 0; i--) {
            cells.push(createCellHTML(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i + 1), false, { count: -1 }, specialDatesForYear));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const { dayTeam, nightTeam } = getTeamForDate(new Date(cellDate));
            teamWorkDays[dayTeam]++;
            teamWorkDays[nightTeam]++;
            cells.push(createCellHTML(cellDate, true, businessDayCounter, specialDatesForYear));
        }

        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        const nextMonth = new Date(year, month + 1, 1);
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(createCellHTML(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), false, { count: -1 }, specialDatesForYear));
        }

        elements.calendarBody.innerHTML = cells.join('');
        renderStatistics(teamWorkDays);
        updateMonthNav();
        updateHighlights();
        updateNavButtonStates();
        setTimeout(() => {
            if (elements.stickyHeaderContainer) {
                headerOffsetTop = elements.stickyHeaderContainer.offsetTop;
            }
        }, 100);
    };

    const triggerHighlightAnimation = (team) => {
        const entries = document.querySelectorAll(`.schedule-entry[data-team="${team}"]`);
        entries.forEach(entry => {
            entry.classList.add('highlight-animation');
            entry.addEventListener('animationend', () => entry.classList.remove('highlight-animation'), { once: true });
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
                if (icon) icon.style.color = '';
            }
        });
        document.querySelectorAll('.team-button').forEach(button => {
            const team = button.dataset.team;
            const isActive = highlightedTeams.has(team);
            
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);

            if (isActive) {
                button.style.setProperty('--team-bg-color', config.teamColors[team].bg);
                button.style.setProperty('--team-text-color', config.teamColors[team].text);
            } else {
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
        const prevMonthDate = new Date(currentDate);
        prevMonthDate.setMonth(currentDate.getMonth() - 1);
        elements.prevMonthNameEl.textContent = config.months[prevMonthDate.getMonth()];
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        elements.nextMonthNameEl.textContent = config.months[nextMonthDate.getMonth()];
    };

    const handleStickyHeader = () => {
        if (elements.stickyHeaderContainer && window.scrollY > headerOffsetTop && headerOffsetTop > 0) {
            elements.stickyHeaderContainer.classList.add('sticky-active');
        } else {
            elements.stickyHeaderContainer.classList.remove('sticky-active');
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

    const openModal = (name, summary, motivation) => {
        elements.modalTitle.textContent = name;
        elements.modalSummary.textContent = summary;
        elements.modalMotivation.innerHTML = `&quot;${motivation}&quot;`;
        elements.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        elements.modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    const init = () => {
        const startYear = new Date().getFullYear();
        const endYear = startYear + 2;
        elements.yearSelect.innerHTML = Array.from({ length: 3 }, (_, i) => startYear + i).map(y => `<option value="${y}">${y}</option>`).join('');
        elements.monthSelect.innerHTML = config.months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
        currentDate = new Date();
        updateNavButtonStates = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const isAtStart = year <= startYear && month === 0;
            const isAtEnd = year >= endYear && month === 11;
            elements.prevMonthBtn.classList.toggle('disabled', isAtStart);
            elements.nextMonthBtn.classList.toggle('disabled', isAtEnd);
        };
        
        document.querySelectorAll('.team-button').forEach(button => {
            button.setAttribute('aria-pressed', 'false');
        });

        renderCalendar();

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
                    triggerHighlightAnimation(team);
                }
                updateHighlights();
            }
        });
        
        // INÍCIO DA ATUALIZAÇÃO: Aplica o throttle ao evento de scroll
        window.addEventListener('scroll', throttle(handleStickyHeader, 100));
        // FIM DA ATUALIZAÇÃO

        elements.themeToggle.addEventListener("change", () => {
            const newTheme = elements.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
        elements.calendarBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-info-icon')) {
                const { name, summary, motivation } = e.target.dataset;
                openModal(name, summary, motivation);
            }
        });
        elements.modalCloseBtn.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });

        const startTooltipAnimation = (icon) => {
            hoveredIcon = icon;
            const tooltipEl = elements.paymentTooltip;
            tooltipEl.textContent = hoveredIcon.dataset.tooltip;
            tooltipEl.style.display = 'block';
            function updatePosition() {
                if (!hoveredIcon) return;
                const iconRect = hoveredIcon.getBoundingClientRect();
                tooltipEl.style.left = `${iconRect.left + iconRect.width / 2}px`;
                tooltipEl.style.top = `${iconRect.top}px`;
                tooltipAnimationId = requestAnimationFrame(updatePosition);
            }
            updatePosition();
        };
        const stopTooltipAnimation = () => {
            if (tooltipAnimationId) {
                cancelAnimationFrame(tooltipAnimationId);
                tooltipAnimationId = null;
            }
            hoveredIcon = null;
            elements.paymentTooltip.style.display = 'none';
        };
        elements.calendarBody.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                startTooltipAnimation(e.target);
            }
        });
        elements.calendarBody.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                stopTooltipAnimation();
            }
        });
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});