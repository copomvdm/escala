import { getSpecialDatesData } from './specialDates.js';

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

    // --- FUNÇÕES AUXILIARES / UTILITÁRIOS (DRY) ---
    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const createElement = (tag, attrs = {}, children = []) => {
        const el = document.createElement(tag);
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'className') el.className = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key.startsWith('data-')) el.setAttribute(key, val);
            else el.setAttribute(key, val);
        }
        children.forEach(child => {
            if (child) el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return el;
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
        if (specialDatesCache[year]) return specialDatesCache[year];

        const dates = { ...getSpecialDatesData() };

        // Algoritmo de Meeus/Jones/Butcher
        const calculateEasterDate = (y) => {
            const a = y % 19, b = Math.floor(y / 100), c = y % 100;
            const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(y, month, day);
        };

        const easter = calculateEasterDate(year);
        const getDateOffset = (base, offset) => {
            const d = new Date(base);
            d.setDate(d.getDate() + offset);
            return d;
        };

        const getSecondSunday = (y, month) => {
            const firstDay = new Date(y, month, 1);
            const firstSundayOffset = (7 - firstDay.getDay()) % 7;
            return new Date(y, month, 1 + firstSundayOffset + 7);
        };

        const addDate = (date, info) => {
            dates[`${date.getMonth()}-${date.getDate()}`] = info;
        };

        addDate(getDateOffset(easter, -2), {
            type: "national-holiday", name: "Sexta-feira Santa",
            summary: ["Feriado religioso que relembra a crucificação.", "Data de reflexão e penitência."],
            motivation: ["Momento de pausa para renovar a fé e a esperança."]
        });
        addDate(getDateOffset(easter, 60), {
            type: "national-holiday", name: "Corpus Christi",
            summary: ["Celebração do mistério da Eucaristia.", "Marcado por procissões e tapetes nas ruas."],
            motivation: ["Dia de celebrar a fé e a comunhão."]
        });
        addDate(getDateOffset(easter, -48), {
            type: "commemorative", name: "Carnaval (Segunda)",
            summary: ["Ponto facultativo tradicional que antecede a terça-feira gorda."],
            motivation: ["Alegria e descontração para recarregar as energias."]
        });
        addDate(getDateOffset(easter, -47), {
            type: "commemorative", name: "Carnaval (Terça)",
            summary: ["Ponto alto das festividades de Carnaval."],
            motivation: ["Um dia para celebrar a vida e a nossa identidade cultural."]
        });
        addDate(getDateOffset(easter, -46), {
            type: "commemorative", name: "Quarta-feira de Cinzas",
            summary: ["Marca o fim do Carnaval e o início da Quaresma."],
            motivation: ["Hora de retomar o foco e os objetivos do ano."]
        });
        addDate(getSecondSunday(year, 4), {
            type: "commemorative", name: "Dia das Mães",
            summary: ["Celebrado no segundo domingo de maio, homenageia as mães."],
            motivation: ["Mãe: princípio de tudo e sinônimo de amor infinito."]
        });
        addDate(getSecondSunday(year, 7), {
            type: "commemorative", name: "Dia dos Pais",
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

    // Criação programática de nós de DOM (evitando innerHTML)
    const createCellElement = (date, isCurrentMonth, businessDayCounter, specialDates) => {
        const day = date.getDate(), month = date.getMonth(), year = date.getFullYear();
        const today = new Date();
        const dayOfWeek = date.getDay();
        const dateKey = `${month}-${day}`;
        const specialDate = specialDates[dateKey];

        const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = specialDate && ['national-holiday', 'state-holiday', 'municipal-holiday'].includes(specialDate.type);

        const { dayTeam, nightTeam } = getTeamForDate(new Date(date));

        const classes = ['calendar-cell', 'animate-in'];
        if (!isCurrentMonth) classes.push('other-month');
        if (isToday) classes.push('current-day');
        if (dayOfWeek === 0) classes.push('sunday');
        if (specialDate) classes.push(specialDate.type);

        const cell = createElement('div', { className: classes.join(' ') });
        if (isToday) cell.setAttribute('aria-current', 'date');

        let paymentEl = null;
        if (isCurrentMonth && !isWeekend && !isHoliday) {
            businessDayCounter.count++;
            if (businessDayCounter.count === 5) {
                paymentEl = createElement('i', { className: 'fas fa-sack-dollar payment-icon', 'data-tooltip': 'Dia de Pagamento' });
            }
        }

        const dayWrapper = createElement('div', { className: 'day-number-wrapper' }, [
            createElement('span', { className: 'day-name', textContent: config.weekdaysShort[dayOfWeek] }),
            createElement('span', { className: 'day-number', textContent: day }),
            isToday ? createElement('span', { className: 'today-marker', textContent: 'Hoje' }) : null,
            paymentEl
        ]);

        const details = createElement('div', { className: 'day-details' }, [
            createElement('div', { className: 'schedule-entry', 'data-team': dayTeam }, [
                createElement('i', { className: 'fas fa-sun animated-sun' }),
                createElement('span', { textContent: `Dia · ${dayTeam}` })
            ]),
            createElement('div', { className: 'schedule-entry', 'data-team': nightTeam }, [
                createElement('i', { className: 'fas fa-moon animated-moon' }),
                createElement('span', { textContent: `Noite · ${nightTeam}` })
            ])
        ]);

        cell.appendChild(dayWrapper);
        cell.appendChild(details);

        if (specialDate) {
            cell.appendChild(createElement('div', {
                className: 'special-date-marker',
                'data-tooltip': config.specialDateTypes[specialDate.type]
            }, [
                specialDate.name, " ",
                createElement('i', { className: 'fas fa-info-circle date-info-icon', 'data-date-key': dateKey })
            ]));
        }

        return cell;
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

        // Otimização: Uso de DocumentFragment impede repaints pesados durante montagem
        const fragment = document.createDocumentFragment();
        let businessDayCounter = { count: 0 };

        const prevMonth = new Date(year, month, 0);
        for (let i = firstDayOfMonth; i > 0; i--) {
            fragment.appendChild(createCellElement(
                new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i + 1),
                false, { count: -1 }, getSpecialDates(prevMonth.getFullYear())
            ));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const { dayTeam, nightTeam } = getTeamForDate(new Date(cellDate));
            teamWorkDays[dayTeam]++;
            teamWorkDays[nightTeam]++;
            fragment.appendChild(createCellElement(cellDate, true, businessDayCounter, specialDatesForYear));
        }

        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        const nextMonth = new Date(year, month + 1, 1);
        for (let i = 1; i <= remainingCells; i++) {
            fragment.appendChild(createCellElement(
                new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
                false, { count: -1 }, getSpecialDates(nextMonth.getFullYear())
            ));
        }

        // Única inserção real no DOM
        elements.calendarBody.replaceChildren(fragment);

        renderStatistics(teamWorkDays);
        updateMonthNav();
        updateHighlights();
        updateNavButtonStates();
        setTimeout(() => {
            if (elements.stickyHeaderContainer) headerOffsetTop = elements.stickyHeaderContainer.offsetTop;
        }, 100);
    };

    const triggerHighlightAnimation = (team) => {
        document.querySelectorAll(`.schedule-entry[data-team="${team}"]`).forEach(entry => {
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
        const fragment = document.createDocumentFragment();

        Object.entries(teamWorkDays).forEach(([team, count]) => {
            const colors = config.teamColors[team] || { bg: 'var(--color-background)', text: 'var(--color-text-primary)' };
            const percent = Math.round((count / total) * 100);

            const statItem = createElement('div', {
                className: 'statistic-item',
                style: `border-color: ${colors.bg}; --stat-color-start:${colors.bg}; --stat-color-end:${colors.text};`
            }, [
                createElement('span', { className: 'team', textContent: `Equipe ${team}` }),
                createElement('span', { className: 'count', textContent: `${count} plantões (${percent}%)` }),
                createElement('div', { className: 'stat-bar' }, [
                    createElement('div', { className: 'stat-bar-fill', style: `width:${percent}%;` })
                ])
            ]);
            
            fragment.appendChild(statItem);

            if (elements.teamButtonsContainer) {
                const badge = elements.teamButtonsContainer.querySelector(`.team-badge[data-team-badge="${team}"]`);
                if (badge) badge.textContent = `${count}`;
            }
        });
        elements.estatisticaContainer.replaceChildren(fragment);
    };

    const updateMonthNav = () => {
        const prev = new Date(currentDate); prev.setMonth(currentDate.getMonth() - 1);
        elements.prevMonthNameEl.textContent = config.months[prev.getMonth()];
        const next = new Date(currentDate); next.setMonth(currentDate.getMonth() + 1);
        elements.nextMonthNameEl.textContent = config.months[next.getMonth()];
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
        elements.modalSummary.textContent = Array.isArray(summary) ? summary[Math.floor(Math.random() * summary.length)] : summary;
        elements.modalMotivation.textContent = `"${Array.isArray(motivation) ? motivation[Math.floor(Math.random() * motivation.length)] : motivation}"`;

        if (elements.modalTypeChip) {
            const typeLabel = config.specialDateTypes[typeKey] || '';
            elements.modalTypeChip.textContent = typeLabel;
            elements.modalTypeChip.className = 'modal-chip';
            if (typeKey) elements.modalTypeChip.classList.add(`modal-chip--${typeKey.split('-')[0]}`);
            elements.modalTypeChip.style.display = typeLabel ? 'inline-block' : 'none';
        }

        elements.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (name === 'Ano Novo') launchFireworks();
        else stopFireworks();
    };

    const closeModal = () => {
        elements.modal.style.display = 'none';
        document.body.style.overflow = '';
        stopFireworks();
    };

    // --- SISTEMA DE FOGOS DE ARTIFÍCIO (CANVAS) ---
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const ctx = fireworksCanvas.getContext('2d');
    let fireworks = [], particles = [], animationId = null, launchIntervalId = null;

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 4 + 1;
            this.friction = 0.97; this.gravity = 1; this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.01;
        }
        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
        }
        draw() {
            ctx.save(); ctx.globalAlpha = this.alpha;
            ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
        }
    }

    class Firework {
        constructor() {
            this.x = Math.random() * fireworksCanvas.width; this.y = fireworksCanvas.height;
            this.targetX = Math.random() * fireworksCanvas.width; this.targetY = Math.random() * (fireworksCanvas.height / 2);
            this.speed = 3; this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color; ctx.fill();
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        fireworks.forEach((fw, i) => {
            fw.update(); fw.draw();
            if (fw.y <= fw.targetY) {
                for (let j = 0; j < 100; j++) particles.push(new Particle(fw.x, fw.y, fw.color));
                fireworks.splice(i, 1);
            }
        });

        particles.forEach((p, i) => { p.alpha <= 0 ? particles.splice(i, 1) : p.update(); });
        particles.forEach(p => p.draw());
    }

    function stopFireworks() {
        if (launchIntervalId) clearInterval(launchIntervalId);
        if (animationId) cancelAnimationFrame(animationId);
        fireworksCanvas.style.display = 'none';
        fireworks = []; particles = [];
    }

    function launchFireworks() {
        stopFireworks();
        fireworksCanvas.width = window.innerWidth; fireworksCanvas.height = window.innerHeight;
        fireworksCanvas.style.display = 'block';
        animate();
        fireworks.push(new Firework());
        launchIntervalId = setInterval(() => { if (fireworks.length < 10) fireworks.push(new Firework()); }, 800);
    }

    const init = () => {
        const startYear = new Date().getFullYear() - 1;
        const endYear = startYear + 3;
        elements.yearSelect.innerHTML = Array.from({ length: 4 }, (_, i) => startYear + i).map(y => `<option value="${y}">${y}</option>`).join('');
        elements.monthSelect.innerHTML = config.months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
        
        updateNavButtonStates = () => {
            const year = currentDate.getFullYear(), month = currentDate.getMonth();
            elements.prevMonthBtn.classList.toggle('disabled', year <= startYear && month === 0);
            elements.nextMonthBtn.classList.toggle('disabled', year >= endYear && month === 11);
        };

        renderCalendar();

        elements.prevMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        elements.nextMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        elements.todayButton.addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });
        elements.monthSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
        elements.yearSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
        
        elements.teamButtonsContainer.addEventListener("click", (e) => {
            const button = e.target.closest('.team-button');
            if (!button) return;
            const team = button.dataset.team;
            highlightedTeams.has(team) ? highlightedTeams.delete(team) : (highlightedTeams.add(team), triggerHighlightAnimation(team));
            updateHighlights();
        });

        window.addEventListener('scroll', throttle(handleStickyHeader, 100));
        elements.themeToggle.addEventListener("change", () => {
            const newTheme = elements.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme); applyTheme(newTheme);
        });

        elements.calendarBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-info-icon')) {
                const info = getSpecialDates(currentDate.getFullYear())[e.target.dataset.dateKey];
                if (info) openModal(info.name, info.summary, info.motivation, info.type);
            }
        });

        elements.modalCloseBtn.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });

        elements.calendarBody.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                hoveredIcon = e.target;
                elements.paymentTooltip.textContent = hoveredIcon.dataset.tooltip;
                elements.paymentTooltip.style.display = 'block';
                const updatePos = () => {
                    if (!hoveredIcon) return;
                    const rect = hoveredIcon.getBoundingClientRect();
                    elements.paymentTooltip.style.left = `${rect.left + rect.width / 2}px`;
                    elements.paymentTooltip.style.top = `${rect.top}px`;
                    tooltipAnimationId = requestAnimationFrame(updatePos);
                };
                updatePos();
            }
        });
        elements.calendarBody.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                if (tooltipAnimationId) cancelAnimationFrame(tooltipAnimationId);
                hoveredIcon = null; elements.paymentTooltip.style.display = 'none';
            }
        });

        applyTheme(localStorage.getItem('theme') || 'light');
    };

    init();
});