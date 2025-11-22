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
        modalTypeChip: document.getElementById("modalTypeChip"),
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
    const throttle = (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

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
            'commemorative': 'Data Comemorativa / Ponto Facultativo',
        }
    };

    const getSpecialDates = (year) => {
        // Se já calculou para este ano, retorna do cache
        if (specialDatesCache[year]) {
            return specialDatesCache[year];
        }

        // Pega as datas fixas do arquivo specialDates.js
        const dates = { ...getSpecialDatesData() };

        // --- CÁLCULO DE DATAS MÓVEIS ---

        // Algoritmo de Meeus/Jones/Butcher para Páscoa
        const calculateEasterDate = (y) => {
            const a = y % 19;
            const b = Math.floor(y / 100);
            const c = y % 100;
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
            return new Date(y, month, day);
        };

        const easter = calculateEasterDate(year);

        const getDateOffset = (baseDate, offsetInDays) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + offsetInDays);
            return d;
        };

        // 2º domingo do mês
        const getSecondSunday = (y, month) => {
            const firstDay = new Date(y, month, 1);
            const firstSundayOffset = (7 - firstDay.getDay()) % 7;
            const secondSunday = 1 + firstSundayOffset + 7;
            return new Date(y, month, secondSunday);
        };

        // Datas calculadas a partir da Páscoa
        const goodFriday = getDateOffset(easter, -2);      // Sexta-feira Santa
        const carnivalMonday = getDateOffset(easter, -48); // Segunda de Carnaval
        const carnivalTuesday = getDateOffset(easter, -47);// Terça de Carnaval
        const ashWednesday = getDateOffset(easter, -46);   // Quarta de Cinzas
        const corpusChristi = getDateOffset(easter, 60);   // Corpus Christi

        // Datas comemorativas móveis
        const mothersDay = getSecondSunday(year, 4);       // 2º dom Maio
        const fathersDay = getSecondSunday(year, 7);       // 2º dom Agosto

        const addDate = (date, info) => {
            const key = `${date.getMonth()}-${date.getDate()}`;
            dates[key] = info;
        };

        // --- INSERÇÃO DAS DATAS MÓVEIS COM HIERARQUIA ---

        // 1. Sexta-feira Santa (Definida como Nacional para destaque)
        addDate(goodFriday, {
            type: "national-holiday",
            name: "Sexta-feira Santa",
            summary: [
                "Feriado religioso que relembra a crucificação e morte de Jesus Cristo.",
                "Data de reflexão, silêncio e penitência para os cristãos.",
                "É o único dia do ano em que não se celebra a Eucaristia na Igreja Católica."
            ],
            motivation: [
                "Momento de pausa para renovar a fé e a esperança.",
                "Que o silêncio deste dia traga paz ao coração.",
                "Independente da crença, um dia para exercitar a compaixão e o perdão."
            ]
        });

        // 2. Corpus Christi (Definido como Nacional conforme solicitado)
        addDate(corpusChristi, {
            type: "national-holiday",
            name: "Corpus Christi",
            summary: [
                "Celebração do mistério da Eucaristia, o sacramento do corpo e do sangue de Jesus.",
                "Tradicionalmente marcado por procissões e tapetes coloridos nas ruas.",
                "Feriado de grande importância no calendário cristão e civil."
            ],
            motivation: [
                "Dia de celebrar a fé e a comunhão.",
                "Aproveite o descanso para estar com a família.",
                "Que a tradição e a cultura tragam cor aos nossos dias."
            ]
        });

        // 3. Carnaval (Comemorativo/Ponto Facultativo)
        addDate(carnivalMonday, {
            type: "commemorative",
            name: "Carnaval (Segunda)",
            summary: [
                "Ponto facultativo tradicional que antecede a terça-feira gorda.",
                "Dia de blocos, festas e grande movimentação popular.",
                "Alteração significativa na rotina de serviços e trânsito."
            ],
            motivation: [
                "Alegria e descontração para recarregar as energias.",
                "Celebre a cultura brasileira com responsabilidade.",
                "Aproveite o momento de folga com quem você gosta."
            ]
        });

        addDate(carnivalTuesday, {
            type: "commemorative",
            name: "Carnaval (Terça)",
            summary: [
                "Ponto alto das festividades de Carnaval.",
                "Embora não seja feriado nacional oficial, é amplamente respeitado como folga.",
                "Grande impacto operacional no policiamento e serviços de emergência."
            ],
            motivation: [
                "Que a alegria do carnaval contagie o resto do ano.",
                "Diversão com segurança é a melhor combinação.",
                "Um dia para celebrar a vida e a nossa identidade cultural."
            ]
        });

        // 4. Quarta de Cinzas
        addDate(ashWednesday, {
            type: "commemorative",
            name: "Quarta-feira de Cinzas",
            summary: [
                "Marca o fim do Carnaval e o início da Quaresma.",
                "Dia de expediente reduzido ou início após o meio-dia em muitos locais.",
                "Retorno à normalidade e reflexão após os dias de festa."
            ],
            motivation: [
                "Hora de retomar o foco e os objetivos do ano.",
                "Que o reinício das atividades seja leve e produtivo.",
                "Um bom retorno ao trabalho a todos!"
            ]
        });

        // 5. Datas Familiares
        addDate(mothersDay, {
            type: "commemorative",
            name: "Dia das Mães",
            summary: ["Celebrado no segundo domingo de maio, homenageia as mães."],
            motivation: ["Mãe: princípio de tudo e sinônimo de amor infinito."]
        });

        addDate(fathersDay, {
            type: "commemorative",
            name: "Dia dos Pais",
            summary: ["Celebrado no segundo domingo de agosto, homenageia os pais."],
            motivation: ["Pai é aquele que cuida, ama e protege."]
        });

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
        const year = date.getFullYear();
        const today = new Date();
        const dayOfWeek = date.getDay();
        const dayName = config.weekdaysShort[dayOfWeek];
        const dateKey = `${month}-${day}`;
        const specialDate = specialDates[dateKey];

        const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Apenas feriados reais (Nacional, Estadual, Municipal) bloqueiam o ícone de pagamento
        // "commemorative" (como Carnaval) não bloqueia a contagem de dia útil nesta lógica,
        // a menos que você queira que bloqueie. Aqui, apenas feriados explícitos bloqueiam.
        const isHoliday = specialDate && (
            specialDate.type === 'national-holiday' ||
            specialDate.type === 'state-holiday' ||
            specialDate.type === 'municipal-holiday'
        );

        const { dayTeam, nightTeam } = getTeamForDate(new Date(date));

        let cellClasses = 'calendar-cell';
        if (!isCurrentMonth) cellClasses += ' other-month';
        if (isToday) cellClasses += ' current-day';
        if (dayOfWeek === 0) cellClasses += ' sunday';
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
                <i class="fas fa-info-circle date-info-icon" data-date-key="${dateKey}"></i>
            </div>` : '';

        const ariaCurrentAttr = isToday ? ' aria-current="date"' : '';

        return `
            <div class="${cellClasses} animate-in"${ariaCurrentAttr}>
                <div class="day-number-wrapper">
                    <span class="day-name">${dayName}</span>
                    <span class="day-number">${day}</span>
                    ${isToday ? '<span class="today-marker">Hoje</span>' : ''}
                    ${paymentIcon}
                </div>
                <div class="day-details">
                    <div class="schedule-entry" data-team="${dayTeam}">
                        <i class="fas fa-sun animated-sun"></i>
                        <span>Dia &middot; ${dayTeam}</span>
                    </div>
                    <div class="schedule-entry" data-team="${nightTeam}">
                        <i class="fas fa-moon animated-moon"></i>
                        <span>Noite &middot; ${nightTeam}</span>
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

        const specialDatesForYear = getSpecialDates(year);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let cells = [];
        let businessDayCounter = { count: 0 };

        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDayOfMonth; i > 0; i--) {
            cells.push(
                createCellHTML(
                    new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i + 1),
                    false,
                    { count: -1 },
                    getSpecialDates(prevMonth.getFullYear())
                )
            );
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
            cells.push(
                createCellHTML(
                    new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
                    false,
                    { count: -1 },
                    getSpecialDates(nextMonth.getFullYear())
                )
            );
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
                button.style.setProperty('--team-dot-color', config.teamColors[team].bg);
            } else {
                button.style.removeProperty('--team-bg-color');
                button.style.removeProperty('--team-text-color');
                button.style.removeProperty('--team-dot-color');
            }
        });
    };

    const renderStatistics = (teamWorkDays) => {
        const total = Object.values(teamWorkDays).reduce((sum, value) => sum + value, 0) || 1;
        let html = '';

        Object.entries(teamWorkDays).forEach(([team, count]) => {
            const colors = config.teamColors[team] || {
                bg: 'var(--color-background)',
                text: 'var(--color-text-primary)'
            };

            const percent = Math.round((count / total) * 100);

            html += `
                <div class="statistic-item" style="border-color: ${colors.bg}; --stat-color-start:${colors.bg}; --stat-color-end:${colors.text};">
                    <span class="team">Equipe ${team}</span>
                    <span class="count">${count} plantões (${percent}%)</span>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width:${percent}%;"></div>
                    </div>
                </div>`;

            if (elements.teamButtonsContainer) {
                const badge = elements.teamButtonsContainer.querySelector(`.team-badge[data-team-badge="${team}"]`);
                if (badge) {
                    badge.textContent = `${count} plantões`;
                }
            }
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

    const openModal = (name, summary, motivation, typeKey) => {
        elements.modalTitle.textContent = name;
        
        const summaryText = Array.isArray(summary) ? summary[Math.floor(Math.random() * summary.length)] : summary;
        const motivationText = Array.isArray(motivation) ? motivation[Math.floor(Math.random() * motivation.length)] : motivation;

        elements.modalSummary.textContent = summaryText;
        elements.modalMotivation.innerHTML = `&quot;${motivationText}&quot;`;

        if (elements.modalTypeChip) {
            const typeLabel = config.specialDateTypes[typeKey] || '';
            elements.modalTypeChip.textContent = typeLabel;
            elements.modalTypeChip.className = 'modal-chip';
            if (typeKey) {
                if (typeKey === 'national-holiday') {
                    elements.modalTypeChip.classList.add('modal-chip--national');
                } else if (typeKey === 'state-holiday') {
                    elements.modalTypeChip.classList.add('modal-chip--state');
                } else if (typeKey === 'municipal-holiday') {
                    elements.modalTypeChip.classList.add('modal-chip--municipal');
                } else if (typeKey === 'commemorative') {
                    elements.modalTypeChip.classList.add('modal-chip--commemorative');
                }
            }
            elements.modalTypeChip.style.display = typeLabel ? 'inline-block' : 'none';
        }

        elements.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (name === 'Ano Novo') {
            launchFireworks();
        } else {
            stopFireworks();
        }
    };

    const closeModal = () => {
        elements.modal.style.display = 'none';
        document.body.style.overflow = '';
        stopFireworks();
    };

    // --- SISTEMA DE FOGOS DE ARTIFÍCIO (CANVAS) ---
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const ctx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let particles = [];
    let animationId = null;
    let launchIntervalId = null;
    let stopTimeoutId = null;

    function setupCanvas() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 4 + 1;
            this.friction = 0.97;
            this.gravity = 1;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.01;
        }

        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    class Firework {
        constructor() {
            this.x = Math.random() * fireworksCanvas.width;
            this.y = fireworksCanvas.height;
            this.targetX = Math.random() * fireworksCanvas.width;
            this.targetY = Math.random() * (fireworksCanvas.height / 2);
            this.speed = 3;
            this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function createExplosion(firework) {
        const particleCount = 100;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(firework.x, firework.y, firework.color));
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        fireworks.forEach((firework, index) => {
            firework.update();
            firework.draw();
            if (firework.y <= firework.targetY) {
                createExplosion(firework);
                fireworks.splice(index, 1);
            }
        });

        particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                particles.splice(index, 1);
            } else {
                particle.update();
            }
        });
        particles.forEach(particle => particle.draw());
    }

    function stopFireworks() {
        if (stopTimeoutId) clearTimeout(stopTimeoutId);
        if (launchIntervalId) clearInterval(launchIntervalId);
        if (animationId) cancelAnimationFrame(animationId);
        
        stopTimeoutId = null;
        launchIntervalId = null;
        animationId = null;

        setTimeout(() => {
            fireworksCanvas.style.display = 'none';
            fireworks = [];
            particles = [];
        }, 100);
    }

    function launchFireworks() {
        stopFireworks();
        setupCanvas();
        fireworksCanvas.style.display = 'block';
        animate();
        fireworks.push(new Firework());
        launchIntervalId = setInterval(() => {
            if (fireworks.length < 10) {
                fireworks.push(new Firework());
            }
        }, 800);
    }

    const init = () => {
        const startYear = new Date().getFullYear();
        const endYear = startYear + 2;
        elements.yearSelect.innerHTML = Array.from({ length: 3 }, (_, i) => startYear + i)
            .map(y => `<option value="${y}">${y}</option>`).join('');
        elements.monthSelect.innerHTML = config.months
            .map((m, i) => `<option value="${i}">${m}</option>`).join('');
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
            const button = e.target.closest('.team-button');
            if (!button) return;
            const team = button.dataset.team;
            if (highlightedTeams.has(team)) {
                highlightedTeams.delete(team);
            } else {
                highlightedTeams.add(team);
                triggerHighlightAnimation(team);
            }
            updateHighlights();
        });

        window.addEventListener('scroll', throttle(handleStickyHeader, 100));
        elements.themeToggle.addEventListener("change", () => {
            const newTheme = elements.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        elements.calendarBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-info-icon')) {
                const dateKey = e.target.dataset.dateKey;
                const year = currentDate.getFullYear();
                const allSpecialDates = getSpecialDates(year);
                const dateInfo = allSpecialDates[dateKey];
                if (dateInfo) {
                    openModal(dateInfo.name, dateInfo.summary, dateInfo.motivation, dateInfo.type);
                }
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
            if (tooltipAnimationId) cancelAnimationFrame(tooltipAnimationId);
            tooltipAnimationId = null;
            hoveredIcon = null;
            elements.paymentTooltip.style.display = 'none';
        };

        elements.calendarBody.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('payment-icon')) startTooltipAnimation(e.target);
        });
        elements.calendarBody.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('payment-icon')) stopTooltipAnimation();
        });

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});