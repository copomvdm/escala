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
    // INÍCIO DA ATUALIZAÇÃO: Variáveis para controlar a animação do tooltip
    let tooltipAnimationId = null;
    let hoveredIcon = null;
    // FIM DA ATUALIZAÇÃO

    // --- LÓGICA DE CONTROLE DE NAVEGAÇÃO ---
    let updateNavButtonStates = () => { };

    // --- DADOS E CONSTANTES ---
    const config = {
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        teamColors: {
            A: { bg: '#a7f3d0', text: '#065f46' }, // Verde Menta | Texto Verde Escuro
            B: { bg: '#bfdbfe', text: '#1e40af' }, // Azul Céu | Texto Azul Escuro
            C: { bg: '#ddd6fe', text: '#5b21b6' }, // Lavanda | Texto Roxo Escuro
            D: { bg: '#fed7aa', text: '#9a3412' }, // Pêssego | Texto Laranja Escuro
            E: { bg: '#fef08a', text: '#854d0e' } // Amarelo Baunilha | Texto Amarelo Queimado
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
            const a = y % 19,
                b = Math.floor(y / 100),
                c = y % 100,
                d = Math.floor(b / 4),
                e = b % 4,
                f = Math.floor((b + 8) / 25),
                g = Math.floor((b - f + 1) / 3),
                h = (19 * a + b - d - g + 15) % 30,
                i = Math.floor(c / 4),
                k = c % 4,
                l = (32 + 2 * e + 2 * i - h - k) % 7,
                m = Math.floor((a + 11 * h + 22 * l) / 451);
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

        return {
            // Feriados Nacionais Fixos
            '0-1': {
                type: 'national-holiday',
                name: 'Ano Novo',
                summary: 'Celebração do primeiro dia do ano no calendário Gregoriano. Um momento para novos começos e resoluções.',
                motivation: 'Que o novo ano traga novas oportunidades e conquistas. Abrace o futuro com esperança!'
            },
            '3-21': {
                type: 'national-holiday',
                name: 'Tiradentes',
                summary: 'Homenageia Joaquim José da Silva Xavier, o Tiradentes, mártir da Inconfidência Mineira e herói nacional.',
                motivation: 'Lembrando a coragem dos que lutaram pela liberdade. Que o ideal de um Brasil melhor nos inspire.'
            },
            '4-1': {
                type: 'national-holiday',
                name: 'Dia do Trabalho',
                summary: 'Celebra as conquistas dos trabalhadores e do movimento operário em todo o mundo.',
                motivation: 'Todo trabalho é digno e fundamental. Parabéns a todos que constroem nosso país dia após dia!'
            },
            '8-7': {
                type: 'national-holiday',
                name: 'Independência do Brasil',
                summary: 'Comemora a Declaração de Independência do Brasil do Império Português em 7 de setembro de 1822.',
                motivation: 'Pátria amada, Brasil! Que o orgulho de ser brasileiro nos una na construção de um futuro próspero.'
            },
            '9-12': {
                type: 'national-holiday',
                name: 'Nossa Senhora Aparecida',
                summary: 'Homenageia a padroeira do Brasil, Nossa Senhora Aparecida. Um dia de fé e devoção para milhões de católicos.',
                motivation: 'Que a fé na Padroeira do Brasil nos proteja, ilumine nossos caminhos e traga paz e esperança.'
            },
            '10-2': {
                type: 'national-holiday',
                name: 'Finados',
                summary: 'Dia de oração e lembrança pelos entes queridos que já faleceram.',
                motivation: 'A saudade é a prova de que o passado valeu a pena. Um dia para honrar a memória e o legado daqueles que amamos.'
            },
            '10-15': {
                type: 'national-holiday',
                name: 'Proclamação da República',
                summary: 'Marca o fim do Império e a instauração da forma republicana de governo no Brasil, em 15 de novembro de 1889.',
                motivation: 'Celebrando a nação e a democracia. Que os ideais republicanos de liberdade e igualdade nos guiem.'
            },
            '11-25': {
                type: 'national-holiday',
                name: 'Natal',
                summary: 'Celebração cristã do nascimento de Jesus Cristo. Uma época de união familiar, amor e boa vontade.',
                motivation: 'Que a magia do Natal encha nossos corações de alegria, paz e fraternidade. Feliz Natal!'
            },

            // Feriados Estaduais de São Paulo
            '6-9': {
                type: 'state-holiday',
                name: 'Revolução Constitucionalista',
                summary: 'Relembra o levante de 1932, em que o estado de São Paulo lutou por uma nova Constituição para o Brasil.',
                motivation: 'Honrando a bravura e o idealismo paulista. Que a luta por um país mais justo nunca cesse.'
            },
            '10-20': {
                type: 'state-holiday',
                name: 'Consciência Negra',
                summary: 'Dia de celebração e reflexão sobre a resistência e as contribuições da comunidade afro-brasileira. Homenageia Zumbi dos Palmares.',
                motivation: 'Reconhecimento, respeito e igualdade. Um dia para celebrar a força da cultura afro-brasileira.'
            },

            // Feriados Municipais de São Paulo
            '0-25': {
                type: 'municipal-holiday',
                name: 'Aniversário de São Paulo',
                summary: 'Comemora a fundação da cidade de São Paulo em 1554 por missionários jesuítas.',
                motivation: 'Honrando a história da cidade que nunca para. Que o espírito trabalhador de São Paulo inspire seu dia!'
            },

            // Feriados Móveis (baseados na Páscoa)
            [`${goodFriday.getMonth()}-${goodFriday.getDate()}`]: {
                type: 'national-holiday',
                name: 'Sexta-feira Santa',
                summary: 'Data cristã que relembra a crucificação e morte de Jesus Cristo. É um dia de profundo recolhimento.',
                motivation: 'Um momento de reflexão sobre sacrifício e amor. Que a esperança e a fé se renovem em seu coração.'
            },
            [`${carnivalMonday.getMonth()}-${carnivalMonday.getDate()}`]: {
                type: 'national-holiday',
                name: 'Carnaval (Segunda)',
                summary: 'A maior festa popular do Brasil, marcada por desfiles, música e blocos de rua. Uma celebração da alegria.',
                motivation: 'Alegria, cor e festa! Que a energia contagiante do Carnaval renove seu ânimo para o ano todo.'
            },
            [`${carnivalTuesday.getMonth()}-${carnivalTuesday.getDate()}`]: {
                type: 'national-holiday',
                name: 'Carnaval (Terça)',
                summary: 'Ponto alto do Carnaval, é o último dia de festividades antes do início da Quaresma.',
                motivation: 'Aproveite cada momento de alegria. A vida é o nosso maior carnaval!'
            },
            [`${ashWednesday.getMonth()}-${ashWednesday.getDate()}`]: {
                type: 'commemorative',
                name: 'Quarta-feira de Cinzas',
                summary: 'Marca o início da Quaresma no calendário cristão, um período de 40 dias de jejum e penitência.',
                motivation: 'Um dia de reflexão e renovação. Que seja um tempo para repensar caminhos e fortalecer o espírito.'
            },
            [`${corpusChristi.getMonth()}-${corpusChristi.getDate()}`]: {
                type: 'national-holiday',
                name: 'Corpus Christi',
                summary: 'Festa católica que celebra a presença real de Cristo na Eucaristia, com procissões e tapetes coloridos.',
                motivation: 'Fé, união e tradição. Que o dia de Corpus Christi fortaleça a crença em dias melhores e mais fraternos.'
            },

            // Datas Comemorativas (se quiser exibir no calendário)
            [`${mothersDay.getMonth()}-${mothersDay.getDate()}`]: {
                type: 'commemorative',
                name: 'Dia das Mães',
                summary: 'Dia de homenagear as mães, a maternidade e a influência materna na sociedade.',
                motivation: 'Amor que guia, cuida e inspira. Celebre e agradeça a figura materna em sua vida.'
            },
            [`${fathersDay.getMonth()}-${fathersDay.getDate()}`]: {
                type: 'commemorative',
                name: 'Dia dos Pais',
                summary: 'Dia de homenagear os pais, a paternidade e a influência paterna na família e na sociedade.',
                motivation: 'O exemplo que ensina, o abraço que protege. Feliz Dia dos Pais a todos que exercem esse papel com amor.'
            },
            
            '11-15': {
                type: 'commemorative',
                name: 'Aniversário da PMESP',
                summary: 'Celebração da fundação da Polícia Militar do Estado de São Paulo, uma instituição histórica dedicada à proteção da sociedade paulista.',
                motivation: 'Honra e gratidão a todos os policiais militares que dedicam suas vidas para garantir a segurança do povo paulista. Parabéns, <strong>PMESP!</strong>'
            },
            
        };
    };

    const getTeamForDate = (targetDate) => {
        const diffTime = targetDate.setHours(0, 0, 0, 0) - config.baseDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(diffTime / 86400000);
        const dayIndex = (diffDays % config.daySequence.length + config.daySequence.length) % config.daySequence.length;
        const nightIndex = (diffDays % config.nightSequence.length + config.nightSequence.length) % config.nightSequence.length;
        return {
            dayTeam: config.daySequence[dayIndex],
            nightTeam: config.nightSequence[nightIndex]
        };
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

        const {
            dayTeam,
            nightTeam
        } = getTeamForDate(new Date(date));

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
            </div>` :
            '';

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

        elements.currentMonthYear.textContent = `${config.months[month]} de ${year}`;

        elements.monthSelect.value = month;
        elements.yearSelect.value = year;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let cells = [];
        let businessDayCounter = {
            count: 0
        };

        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDayOfMonth; i > 0; i--) {
            cells.push(createCellHTML(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i + 1), false, {
                count: -1
            }));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const {
                dayTeam,
                nightTeam
            } = getTeamForDate(new Date(cellDate));
            teamWorkDays[dayTeam]++;
            teamWorkDays[nightTeam]++;
            cells.push(createCellHTML(cellDate, true, businessDayCounter));
        }

        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        const nextMonth = new Date(year, month + 1, 1);
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(createCellHTML(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), false, {
                count: -1
            }));
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
            entry.addEventListener('animationend', () => {
                entry.classList.remove('highlight-animation');
            }, {
                once: true
            });
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

        elements.yearSelect.innerHTML = Array.from({
            length: 3
        }, (_, i) => startYear + i)
            .map(y => `<option value="${y}">${y}</option>`).join('');

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
        elements.todayButton.addEventListener("click", () => {
            currentDate = new Date();
            renderCalendar();
        });
        elements.monthSelect.addEventListener("change", () => {
            currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1);
            renderCalendar();
        });
        elements.yearSelect.addEventListener("change", () => {
            currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1);
            renderCalendar();
        });

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

        elements.calendarBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-info-icon')) {
                const { name, summary, motivation } = e.target.dataset;
                openModal(name, summary, motivation);
            }
        });

        elements.modalCloseBtn.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });

        // --- INÍCIO DA ATUALIZAÇÃO: Lógica de animação para o tooltip de pagamento ---

        // Função que inicia a exibição e a animação do tooltip
        const startTooltipAnimation = (icon) => {
            hoveredIcon = icon; // Guarda a referência do ícone que o mouse está em cima
            const tooltipEl = elements.paymentTooltip;

            // Mostra o tooltip e define seu texto
            tooltipEl.textContent = hoveredIcon.dataset.tooltip;
            tooltipEl.style.display = 'block';

            // Função que será executada a cada quadro de animação
            function updatePosition() {
                if (!hoveredIcon) return; // Para o loop se o mouse não estiver mais no ícone

                // Pega a posição atual do ícone (que está se movendo)
                const iconRect = hoveredIcon.getBoundingClientRect();
                // Atualiza a posição do tooltip para corresponder ao ícone
                tooltipEl.style.left = `${iconRect.left + iconRect.width / 2}px`;
                tooltipEl.style.top = `${iconRect.top}px`;
                
                // Solicita o próximo quadro de animação, criando o loop
                tooltipAnimationId = requestAnimationFrame(updatePosition);
            }
            
            // Inicia o loop de animação
            updatePosition();
        };

        // Função que para a animação e esconde o tooltip
        const stopTooltipAnimation = () => {
            if (tooltipAnimationId) {
                cancelAnimationFrame(tooltipAnimationId); // Para o loop de animação
                tooltipAnimationId = null;
            }
            hoveredIcon = null; // Limpa a referência do ícone
            elements.paymentTooltip.style.display = 'none'; // Esconde o tooltip
        };

        // Listener para quando o mouse entra no ícone de pagamento
        elements.calendarBody.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                startTooltipAnimation(e.target);
            }
        });

        // Listener para quando o mouse sai do ícone de pagamento
        elements.calendarBody.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                stopTooltipAnimation();
            }
        });
        // --- FIM DA ATUALIZAÇÃO ---


        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});