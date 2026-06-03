(function bootApplication(window, document) {
  "use strict";

  const namespace = window.COPOMScale || {};
  const config = namespace.config;
  const dates = namespace.dateUtils;
  const scheduleService = namespace.scheduleService;

  if (
    !config ||
    !dates ||
    !scheduleService ||
    !namespace.createFireworksController
  ) {
    throw new Error(
      "A aplicação não pôde iniciar porque dependências obrigatórias não foram carregadas.",
    );
  }

  const state = {
    currentDate: dates.startOfDay(new Date()),
    highlightedTeams: new Set(),
    activeTooltipTarget: null,
    tooltipFrameId: null,
    lastFocusedElement: null,
    fireworksController: null,
  };

  const elements = {};

  function queryRequired(selector, parent = document) {
    const element = parent.querySelector(selector);

    if (!element) {
      throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
    }

    return element;
  }

  function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.text !== undefined) {
      element.textContent = String(options.text);
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.setAttribute(key, String(value));
        }
      });
    }

    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.dataset[key] = String(value);
        }
      });
    }

    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.style.setProperty(key, String(value));
        }
      });
    }

    return element;
  }

  function createIcon(className) {
    return createElement("i", {
      className,
      attributes: {
        "aria-hidden": "true",
      },
    });
  }

  function setText(element, value) {
    element.textContent = String(value ?? "");
  }

  function getClosestElement(event, selector) {
    if (!(event.target instanceof Element)) {
      return null;
    }

    return event.target.closest(selector);
  }

  function getStorageValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStorageValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /*
       * O armazenamento local pode estar indisponível em modo privado,
       * bloqueio de navegador ou ambiente restrito.
       * A aplicação segue funcionando normalmente sem persistência.
       */
    }
  }

  function getAllowedYearRange() {
    const currentYear = new Date().getFullYear();

    return {
      start: config.minYear,
      end: Math.max(config.minYear, currentYear + config.yearRangeAhead),
    };
  }

  function initializeElements() {
    elements.documentElement = document.documentElement;
    elements.body = document.body;
    elements.themeColorMeta = document.querySelector('meta[name="theme-color"]');

    elements.calendarBody = queryRequired("#calendarBody");
    elements.monthSelect = queryRequired("#monthSelect");
    elements.yearSelect = queryRequired("#yearSelect");

    elements.prevMonthBtn = queryRequired("#prevMonth");
    elements.nextMonthBtn = queryRequired("#nextMonth");
    elements.todayButton = queryRequired("#todayButton");
    elements.prevMonthNameEl = queryRequired("#prevMonthName");
    elements.nextMonthNameEl = queryRequired("#nextMonthName");

    elements.teamButtonsContainer = queryRequired("#teamButtons");
    elements.statisticsContainer = queryRequired("#estatisticaContainer");

    elements.themeToggle = queryRequired("#themeToggle");
    elements.themeToggleIcon = queryRequired("#themeToggleIcon");

    elements.currentMonthYear = queryRequired("#currentMonthYear");
    elements.calendarStatus = queryRequired("#calendarStatus");
    elements.liveDateLabel = queryRequired("#liveDateLabel");

    elements.modal = queryRequired("#specialDateModal");
    elements.modalContent = queryRequired(".modal-content", elements.modal);
    elements.modalTitle = queryRequired("#modalTitle");
    elements.modalSummary = queryRequired("#modalSummary");
    elements.modalMotivation = queryRequired("#modalMotivation");
    elements.modalCloseBtn = queryRequired(".modal-close-btn", elements.modal);
    elements.modalTypeChip = queryRequired("#modalTypeChip");

    elements.paymentTooltip = queryRequired("#paymentTooltip");
    elements.fireworksCanvas = queryRequired("#fireworksCanvas");
  }

  function initializeTheme() {
    const storedTheme = getStorageValue(config.storageKeys.theme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : prefersDark
          ? "dark"
          : "light";

    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    const isDark = safeTheme === "dark";

    elements.documentElement.dataset.theme = safeTheme;

    if (elements.themeColorMeta) {
      elements.themeColorMeta.setAttribute(
        "content",
        isDark ? "#111827" : "#0f2f4a",
      );
    }

    elements.themeToggle.classList.toggle("is-dark", isDark);
    elements.themeToggle.setAttribute("aria-pressed", String(isDark));
    elements.themeToggle.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro",
    );
    elements.themeToggle.setAttribute(
      "title",
      isDark ? "Ativar modo claro" : "Ativar modo escuro",
    );

    elements.themeToggleIcon.className = isDark
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";

    setStorageValue(config.storageKeys.theme, safeTheme);
  }

  function initializeHighlightedTeams() {
    const storedTeams = getStorageValue(config.storageKeys.highlightedTeams);

    if (!storedTeams) {
      return;
    }

    storedTeams
      .split(",")
      .map((team) => team.trim().toUpperCase())
      .filter((team) => config.teams.includes(team))
      .forEach((team) => state.highlightedTeams.add(team));
  }

  function persistHighlightedTeams() {
    setStorageValue(
      config.storageKeys.highlightedTeams,
      [...state.highlightedTeams].join(","),
    );
  }

  function initializeLiveDateLabel() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedDate = formatter
      .format(now)
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim();

    setText(elements.liveDateLabel, formattedDate);
  }

  function initializeSelectors() {
    const range = getAllowedYearRange();
    const monthFragment = document.createDocumentFragment();
    const yearFragment = document.createDocumentFragment();

    config.months.forEach((month, index) => {
      monthFragment.appendChild(
        createElement("option", {
          text: month,
          attributes: {
            value: index,
          },
        }),
      );
    });

    for (let year = range.start; year <= range.end; year += 1) {
      yearFragment.appendChild(
        createElement("option", {
          text: year,
          attributes: {
            value: year,
          },
        }),
      );
    }

    elements.monthSelect.replaceChildren(monthFragment);
    elements.yearSelect.replaceChildren(yearFragment);
  }

  function renderTeamButtons() {
    const fragment = document.createDocumentFragment();

    config.teams.forEach((team) => {
      const colors = config.teamColors[team];

      const button = createElement("button", {
        className: "team-button",
        attributes: {
          type: "button",
          "aria-pressed": "false",
          "aria-label": `Destacar Equipe ${team}`,
        },
        dataset: {
          team,
        },
        styles: {
          "--team-bg": colors.bg,
          "--team-text": colors.text,
          "--team-ring": colors.ring,
        },
      });

      const dot = createElement("span", {
        className: "team-button__dot",
        attributes: {
          "aria-hidden": "true",
        },
      });

      const icon = createIcon("fa-solid fa-headset team-button__icon");

      const label = createElement("span", {
        className: "team-button__label",
        text: `Equipe ${team}`,
      });

      const badge = createElement("span", {
        className: "team-button__badge",
        text: "0 plantões",
        dataset: {
          teamBadge: team,
        },
      });

      button.append(dot, icon, label, badge);
      fragment.appendChild(button);
    });

    elements.teamButtonsContainer.replaceChildren(fragment);
  }

  function setCurrentDate(year, month, day = 1) {
    const range = getAllowedYearRange();
    const parsedYear = Number(year);
    const parsedMonth = Number(month);
    const parsedDay = Number(day);

    const safeYear = Math.min(Math.max(parsedYear, range.start), range.end);
    const safeMonth = Math.min(Math.max(parsedMonth, 0), 11);
    const safeDay = Number.isFinite(parsedDay) && parsedDay > 0 ? parsedDay : 1;

    state.currentDate = dates.createDate(safeYear, safeMonth, safeDay);
  }

  function moveMonth(amount) {
    const nextDate = dates.createDate(
      state.currentDate.getFullYear(),
      state.currentDate.getMonth() + Number(amount),
      1,
    );

    setCurrentDate(nextDate.getFullYear(), nextDate.getMonth(), 1);
    renderCalendar();
  }

  function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const today = dates.startOfDay(new Date());
    const monthLabel = dates.formatMonthYear(state.currentDate, config.months);

    const teamWorkDays = Object.fromEntries(
      config.teams.map((team) => [team, 0]),
    );

    const businessDayCounter = {
      count: 0,
    };

    elements.monthSelect.value = String(month);
    elements.yearSelect.value = String(year);

    setText(elements.currentMonthYear, monthLabel);
    setText(elements.calendarStatus, `Exibindo ${monthLabel}`);

    const firstDayOfMonth = dates.createDate(year, month, 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const daysInMonth = dates.createDate(year, month + 1, 0).getDate();
    const previousMonthLastDay = dates.createDate(year, month, 0);
    const nextMonthFirstDay = dates.createDate(year, month + 1, 1);
    const fragment = document.createDocumentFragment();

    for (let offset = firstWeekday; offset > 0; offset -= 1) {
      const date = dates.createDate(
        previousMonthLastDay.getFullYear(),
        previousMonthLastDay.getMonth(),
        previousMonthLastDay.getDate() - offset + 1,
      );

      fragment.appendChild(createCalendarCell(date, false, today, null));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = dates.createDate(year, month, day);
      const teams = scheduleService.getTeamForDate(date);

      teamWorkDays[teams.dayTeam] += 1;
      teamWorkDays[teams.nightTeam] += 1;

      fragment.appendChild(
        createCalendarCell(date, true, today, businessDayCounter),
      );
    }

    const totalCells = firstWeekday + daysInMonth;
    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;

    for (let day = 1; day <= remainingCells; day += 1) {
      const date = dates.createDate(
        nextMonthFirstDay.getFullYear(),
        nextMonthFirstDay.getMonth(),
        day,
      );

      fragment.appendChild(createCalendarCell(date, false, today, null));
    }

    elements.calendarBody.replaceChildren(fragment);

    renderStatistics(teamWorkDays);
    updateNavigationLabels();
    updateHighlights();
    hidePaymentTooltip();
  }

  function createCalendarCell(date, isCurrentMonth, today, businessDayCounter) {
    const specialDate = scheduleService.getSpecialDateForDate(date);
    const teams = scheduleService.getTeamForDate(date);

    const isToday = isCurrentMonth && dates.isSameDay(date, today);
    const isSunday = date.getDay() === 0;
    const isWeekend = dates.isWeekend(date);
    const isHoliday = scheduleService.isRealHoliday(specialDate);

    const cell = createElement("article", {
      className: buildCellClassName(
        isCurrentMonth,
        isToday,
        isSunday,
        specialDate,
      ),
      attributes: {
        "aria-label": buildCellAriaLabel(date, teams, specialDate, isToday),
        "aria-current": isToday ? "date" : null,
      },
      dataset: {
        date: dates.isoDateKey(date),
      },
    });

    const header = createElement("div", {
      className: "calendar-cell__header",
    });

    const dateBlock = createElement("div", {
      className: "calendar-cell__date",
    });

    const weekday = createElement("span", {
      className: "calendar-cell__weekday",
      text: config.weekdaysShort[date.getDay()],
    });

    const dayNumber = createElement("span", {
      className: "calendar-cell__number",
      text: date.getDate(),
    });

    dateBlock.append(weekday, dayNumber);
    header.appendChild(dateBlock);

    const badges = createElement("div", {
      className: "calendar-cell__badges",
    });

    if (isToday) {
      badges.appendChild(
        createElement("span", {
          className: "today-marker",
          text: "Hoje",
        }),
      );
    }

    if (isCurrentMonth && !isWeekend && !isHoliday && businessDayCounter) {
      businessDayCounter.count += 1;

      if (businessDayCounter.count === 5) {
        const paymentIcon = createElement("span", {
          className: "payment-icon",
          attributes: {
            role: "img",
            "aria-label": "Dia de Pagamento",
            title: "Dia de Pagamento",
          },
          dataset: {
            tooltip: "Dia de Pagamento",
          },
        });

        paymentIcon.appendChild(createIcon("fa-solid fa-sack-dollar"));
        badges.appendChild(paymentIcon);
      }
    }

    if (badges.childElementCount > 0) {
      header.appendChild(badges);
    }

    const details = createElement("div", {
      className: "calendar-cell__details",
    });

    details.append(
      createScheduleEntry("day", teams.dayTeam),
      createScheduleEntry("night", teams.nightTeam),
    );

    cell.append(header, details);

    if (specialDate) {
      cell.appendChild(createSpecialDateMarker(date, specialDate));
    }

    return cell;
  }

  function buildCellClassName(isCurrentMonth, isToday, isSunday, specialDate) {
    const classes = ["calendar-cell"];

    if (!isCurrentMonth) {
      classes.push("calendar-cell--other-month");
    }

    if (isToday) {
      classes.push("calendar-cell--today");
    }

    if (isSunday) {
      classes.push("calendar-cell--sunday");
    }

    if (specialDate) {
      classes.push(`calendar-cell--${specialDate.type}`);
    }

    return classes.join(" ");
  }

  function buildCellAriaLabel(date, teams, specialDate, isToday) {
    const parts = [
      `${config.weekdaysLong[date.getDay()]}, ${date.getDate()} de ${config.months[date.getMonth()]} de ${date.getFullYear()}`,
      `Dia: Equipe ${teams.dayTeam}`,
      `Noite: Equipe ${teams.nightTeam}`,
    ];

    if (specialDate) {
      parts.push(
        `${config.specialDateTypes[specialDate.type]}: ${specialDate.name}`,
      );
    }

    if (isToday) {
      parts.push("Hoje");
    }

    return parts.join(". ");
  }

  function createScheduleEntry(period, team) {
    const colors = config.teamColors[team];
    const isDay = period === "day";

    const entry = createElement("div", {
      className: `schedule-entry schedule-entry--${period}`,
      dataset: {
        team,
      },
      styles: {
        "--entry-bg": colors.bg,
        "--entry-text": colors.text,
        "--entry-ring": colors.ring,
      },
    });

    entry.append(
      createIcon(
        isDay
          ? "fa-solid fa-sun schedule-entry__icon"
          : "fa-solid fa-moon schedule-entry__icon",
      ),
      createElement("span", {
        className: "schedule-entry__label",
        text: isDay ? "Dia" : "Noite",
      }),
      createElement("strong", {
        className: "schedule-entry__team",
        text: team,
      }),
    );

    return entry;
  }

  function createSpecialDateMarker(date, specialDate) {
    const label = config.specialDateTypes[specialDate.type] || "Data especial";

    const button = createElement("button", {
      className: `special-date-marker special-date-marker--${specialDate.type}`,
      attributes: {
        type: "button",
        title: `${label}: ${specialDate.name}`,
        "aria-label": `Abrir detalhes de ${specialDate.name}`,
      },
      dataset: {
        dateYear: date.getFullYear(),
        dateKey: dates.dateKey(date),
      },
    });

    button.append(
      createElement("span", {
        className: "special-date-marker__name",
        text: specialDate.name,
      }),
      createIcon("fa-solid fa-circle-info special-date-marker__icon"),
    );

    return button;
  }

  function renderStatistics(teamWorkDays) {
    const total =
      Object.values(teamWorkDays).reduce((sum, value) => sum + value, 0) || 1;

    const fragment = document.createDocumentFragment();

    config.teams.forEach((team) => {
      const count = Number(teamWorkDays[team] || 0);
      const percentage = Math.round((count / total) * 100);
      const colors = config.teamColors[team];

      const card = createElement("article", {
        className: "statistic-item",
        styles: {
          "--stat-bg": colors.bg,
          "--stat-text": colors.text,
          "--stat-ring": colors.ring,
          "--stat-percent": `${percentage}%`,
        },
        attributes: {
          "aria-label": `Equipe ${team}: ${count} plantões, ${percentage}% do mês`,
        },
      });

      const cardHeader = createElement("div", {
        className: "statistic-item__header",
      });

      cardHeader.append(
        createElement("span", {
          className: "statistic-item__team",
          text: `Equipe ${team}`,
        }),
        createElement("span", {
          className: "statistic-item__count",
          text: `${count} plantões`,
        }),
      );

      const percentLabel = createElement("span", {
        className: "statistic-item__percent",
        text: `${percentage}%`,
      });

      const bar = createElement("div", {
        className: "stat-bar",
        attributes: {
          "aria-hidden": "true",
        },
      });

      const fill = createElement("div", {
        className: "stat-bar__fill",
      });

      bar.appendChild(fill);
      card.append(cardHeader, percentLabel, bar);
      fragment.appendChild(card);

      const badge = elements.teamButtonsContainer.querySelector(
        `[data-team-badge="${team}"]`,
      );

      if (badge) {
        setText(badge, `${count} plantões`);
      }
    });

    elements.statisticsContainer.replaceChildren(fragment);
  }

  function updateNavigationLabels() {
    const previousDate = dates.createDate(
      state.currentDate.getFullYear(),
      state.currentDate.getMonth() - 1,
      1,
    );

    const nextDate = dates.createDate(
      state.currentDate.getFullYear(),
      state.currentDate.getMonth() + 1,
      1,
    );

    const range = getAllowedYearRange();

    const isAtStart =
      state.currentDate.getFullYear() === range.start &&
      state.currentDate.getMonth() === 0;

    const isAtEnd =
      state.currentDate.getFullYear() === range.end &&
      state.currentDate.getMonth() === 11;

    setText(elements.prevMonthNameEl, config.months[previousDate.getMonth()]);
    setText(elements.nextMonthNameEl, config.months[nextDate.getMonth()]);

    elements.prevMonthBtn.disabled = isAtStart;
    elements.nextMonthBtn.disabled = isAtEnd;

    elements.prevMonthBtn.setAttribute("aria-disabled", String(isAtStart));
    elements.nextMonthBtn.setAttribute("aria-disabled", String(isAtEnd));
  }

  function updateHighlights() {
    elements.calendarBody.querySelectorAll(".schedule-entry").forEach((entry) => {
      const team = entry.dataset.team;

      entry.classList.toggle(
        "is-highlighted",
        state.highlightedTeams.has(team),
      );
    });

    elements.teamButtonsContainer.querySelectorAll(".team-button").forEach((button) => {
      const team = button.dataset.team;
      const isActive = state.highlightedTeams.has(team);

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute(
        "aria-label",
        isActive ? `Remover destaque da Equipe ${team}` : `Destacar Equipe ${team}`,
      );
    });
  }

  function toggleTeamHighlight(team) {
    if (!config.teams.includes(team)) {
      return;
    }

    if (state.highlightedTeams.has(team)) {
      state.highlightedTeams.delete(team);
    } else {
      state.highlightedTeams.add(team);
      animateTeamEntries(team);
    }

    persistHighlightedTeams();
    updateHighlights();
  }

  function animateTeamEntries(team) {
    elements.calendarBody
      .querySelectorAll(`.schedule-entry[data-team="${team}"]`)
      .forEach((entry) => {
        entry.classList.remove("is-pulsing");

        window.requestAnimationFrame(() => {
          entry.classList.add("is-pulsing");
          entry.addEventListener(
            "animationend",
            () => entry.classList.remove("is-pulsing"),
            {
              once: true,
            },
          );
        });
      });
  }

  function openSpecialDateModal(dateYear, dateKey) {
    const specialDate = scheduleService.getSpecialDates(Number(dateYear))[
      dateKey
    ];

    if (!specialDate) {
      return;
    }

    const typeLabel =
      config.specialDateTypes[specialDate.type] || "Data especial";

    state.lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setText(elements.modalTypeChip, typeLabel);
    elements.modalTypeChip.className = `modal-chip modal-chip--${specialDate.type}`;

    setText(elements.modalTitle, specialDate.name);
    setText(elements.modalSummary, dates.safeRandomItem(specialDate.summary));
    setText(
      elements.modalMotivation,
      `“${dates.safeRandomItem(specialDate.motivation)}”`,
    );

    elements.modal.classList.add("is-open");
    elements.modal.setAttribute("aria-hidden", "false");
    elements.body.classList.add("has-modal-open");

    elements.modalContent.focus({
      preventScroll: true,
    });

    if (specialDate.name === "Ano Novo") {
      state.fireworksController.launch();
    } else {
      state.fireworksController.stop();
    }
  }

  function closeSpecialDateModal() {
    if (!elements.modal.classList.contains("is-open")) {
      return;
    }

    elements.modal.classList.remove("is-open");
    elements.modal.setAttribute("aria-hidden", "true");
    elements.body.classList.remove("has-modal-open");

    state.fireworksController.stop();

    if (state.lastFocusedElement) {
      state.lastFocusedElement.focus({
        preventScroll: true,
      });
    }

    state.lastFocusedElement = null;
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || !elements.modal.classList.contains("is-open")) {
      return;
    }

    const focusableElements = elements.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const focusable = Array.from(focusableElements).filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true",
    );

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showPaymentTooltip(target) {
    if (!target || !target.dataset.tooltip) {
      return;
    }

    if (state.activeTooltipTarget === target) {
      return;
    }

    hidePaymentTooltip();

    state.activeTooltipTarget = target;

    setText(elements.paymentTooltip, target.dataset.tooltip);
    elements.paymentTooltip.classList.add("is-visible");

    updateTooltipPosition();
  }

  function updateTooltipPosition() {
    if (!state.activeTooltipTarget) {
      return;
    }

    const rect = state.activeTooltipTarget.getBoundingClientRect();

    elements.paymentTooltip.style.left = `${rect.left + rect.width / 2}px`;
    elements.paymentTooltip.style.top = `${rect.top}px`;

    state.tooltipFrameId = window.requestAnimationFrame(updateTooltipPosition);
  }

  function hidePaymentTooltip() {
    if (state.tooltipFrameId !== null) {
      window.cancelAnimationFrame(state.tooltipFrameId);
      state.tooltipFrameId = null;
    }

    state.activeTooltipTarget = null;
    elements.paymentTooltip.classList.remove("is-visible");
  }

  function bindEvents() {
    elements.prevMonthBtn.addEventListener("click", () => moveMonth(-1));
    elements.nextMonthBtn.addEventListener("click", () => moveMonth(1));

    elements.todayButton.addEventListener("click", () => {
      const today = new Date();

      setCurrentDate(today.getFullYear(), today.getMonth(), 1);
      renderCalendar();
    });

    elements.monthSelect.addEventListener("change", () => {
      setCurrentDate(elements.yearSelect.value, elements.monthSelect.value, 1);
      renderCalendar();
    });

    elements.yearSelect.addEventListener("change", () => {
      setCurrentDate(elements.yearSelect.value, elements.monthSelect.value, 1);
      renderCalendar();
    });

    elements.themeToggle.addEventListener("click", () => {
      const currentTheme =
        elements.documentElement.dataset.theme === "dark" ? "dark" : "light";

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
    });

    elements.teamButtonsContainer.addEventListener("click", (event) => {
      const button = getClosestElement(event, ".team-button");

      if (!button) {
        return;
      }

      toggleTeamHighlight(button.dataset.team);
    });

    elements.calendarBody.addEventListener("click", (event) => {
      const marker = getClosestElement(event, ".special-date-marker");

      if (!marker) {
        return;
      }

      openSpecialDateModal(marker.dataset.dateYear, marker.dataset.dateKey);
    });

    elements.calendarBody.addEventListener("pointerover", (event) => {
      const paymentTarget = getClosestElement(event, ".payment-icon");

      if (paymentTarget) {
        showPaymentTooltip(paymentTarget);
      }
    });

    elements.calendarBody.addEventListener("pointerout", (event) => {
      const paymentTarget = getClosestElement(event, ".payment-icon");

      if (!paymentTarget) {
        return;
      }

      if (
        event.relatedTarget instanceof Node &&
        paymentTarget.contains(event.relatedTarget)
      ) {
        return;
      }

      hidePaymentTooltip();
    });

    elements.modalCloseBtn.addEventListener("click", closeSpecialDateModal);

    elements.modal.addEventListener("click", (event) => {
      if (event.target === elements.modal) {
        closeSpecialDateModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSpecialDateModal();
      }

      trapModalFocus(event);
    });

    window.addEventListener(
      "scroll",
      () => {
        hidePaymentTooltip();
      },
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      () => {
        hidePaymentTooltip();
      },
      {
        passive: true,
      },
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.fireworksController) {
        state.fireworksController.stop();
      }
    });
  }

  function init() {
    initializeElements();

    state.fireworksController = namespace.createFireworksController(
      elements.fireworksCanvas,
    );

    initializeTheme();
    initializeLiveDateLabel();
    initializeSelectors();
    initializeHighlightedTeams();
    renderTeamButtons();

    setCurrentDate(
      state.currentDate.getFullYear(),
      state.currentDate.getMonth(),
      1,
    );

    bindEvents();
    renderCalendar();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
