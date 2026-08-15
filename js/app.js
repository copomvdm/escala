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
    !namespace.createFireworksController ||
    !window.bootstrap
  ) {
    throw new Error(
      "A aplicação não pôde iniciar porque dependências obrigatórias não foram carregadas.",
    );
  }

  const state = {
    currentDate: dates.startOfDay(new Date()),
    highlightedTeams: new Set(),
    fireworksController: null,
    specialDateModal: null,
    paymentTooltips: [],
    lastFocusedElement: null,
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
       * A aplicação permanece funcional mesmo que o navegador
       * bloqueie o armazenamento local.
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
    elements.themeColorMeta = document.querySelector(
      'meta[name="theme-color"]',
    );

    elements.calendarBody = queryRequired("#calendarBody");

    elements.monthSelect = queryRequired("#monthSelect");
    elements.yearSelect = queryRequired("#yearSelect");

    elements.prevMonthBtn = queryRequired("#prevMonth");
    elements.nextMonthBtn = queryRequired("#nextMonth");
    elements.todayButton = queryRequired("#todayButton");

    elements.prevMonthNameEl = queryRequired("#prevMonthName");
    elements.nextMonthNameEl = queryRequired("#nextMonthName");

    elements.teamButtonsContainer = queryRequired("#teamButtons");

    elements.currentMonthYear = queryRequired("#currentMonthYear");
    elements.calendarStatus = queryRequired("#calendarStatus");

    elements.themeToggleButton = queryRequired("#themeToggleButton");
    elements.themeToggleIcon = queryRequired("#themeToggleIcon");
    elements.themeToggleLabel = queryRequired("#themeToggleLabel");

    elements.modal = queryRequired("#specialDateModal");
    elements.modalTitle = queryRequired("#modalTitle");
    elements.modalSummary = queryRequired("#modalSummary");
    elements.modalMotivation = queryRequired("#modalMotivation");
    elements.modalTypeChip = queryRequired("#modalTypeChip");

    elements.fireworksCanvas = queryRequired("#fireworksCanvas");
  }

  function initializeBootstrapComponents() {
    state.specialDateModal = window.bootstrap.Modal.getOrCreateInstance(
      elements.modal,
      {
        backdrop: true,
        keyboard: true,
        focus: true,
      },
    );
  }

  function initializeTheme() {
    const storedTheme = getStorageValue(config.storageKeys.theme);

    const initialTheme =
      storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";

    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    const safeTheme = theme === "light" ? "light" : "dark";
    const isDark = safeTheme === "dark";
    const nextThemeLabel = isDark ? "Modo claro" : "Modo escuro";
    const nextThemeAction = isDark ? "Ativar modo claro" : "Ativar modo escuro";

    elements.documentElement.dataset.theme = safeTheme;
    elements.documentElement.setAttribute("data-bs-theme", safeTheme);

    if (elements.themeColorMeta) {
      elements.themeColorMeta.setAttribute(
        "content",
        isDark ? "#111827" : "#0f2f4a",
      );
    }

    elements.themeToggleIcon.className = isDark
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";

    setText(elements.themeToggleLabel, nextThemeLabel);
    elements.themeToggleButton.setAttribute("aria-label", nextThemeAction);
    elements.themeToggleButton.setAttribute("title", nextThemeAction);

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
      .forEach((team) => {
        state.highlightedTeams.add(team);
      });
  }

  function persistHighlightedTeams() {
    setStorageValue(
      config.storageKeys.highlightedTeams,
      [...state.highlightedTeams].join(","),
    );
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
        className: "btn team-button",
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
    const monthSchedule = scheduleService.getMonthSchedule(year, month);
    const teamWorkDays = getTeamWorkDaysFromSchedule(monthSchedule);

    elements.monthSelect.value = String(month);
    elements.yearSelect.value = String(year);

    setText(elements.currentMonthYear, monthLabel);
    setText(elements.calendarStatus, `Exibindo ${monthLabel}`);

    const firstDayOfMonth = dates.createDate(year, month, 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const previousMonthLastDay = dates.createDate(year, month, 0);
    const nextMonthFirstDay = dates.createDate(year, month + 1, 1);
    const fragment = document.createDocumentFragment();

    disposePaymentTooltips();

    for (let offset = firstWeekday; offset > 0; offset -= 1) {
      const date = dates.createDate(
        previousMonthLastDay.getFullYear(),
        previousMonthLastDay.getMonth(),
        previousMonthLastDay.getDate() - offset + 1,
      );

      fragment.appendChild(createCalendarCell(date, false, today));
    }

    monthSchedule.forEach((scheduleDay) => {
      fragment.appendChild(
        createCalendarCell(scheduleDay.date, true, today, scheduleDay),
      );
    });

    const totalCells = firstWeekday + monthSchedule.length;
    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;

    for (let day = 1; day <= remainingCells; day += 1) {
      const date = dates.createDate(
        nextMonthFirstDay.getFullYear(),
        nextMonthFirstDay.getMonth(),
        day,
      );

      fragment.appendChild(createCalendarCell(date, false, today));
    }

    elements.calendarBody.replaceChildren(fragment);

    updateTeamBadges(teamWorkDays);
    updateNavigationLabels();
    updateHighlights();
    initializePaymentTooltips();
  }

  function getTeamWorkDaysFromSchedule(monthSchedule) {
    const workDays = Object.fromEntries(config.teams.map((team) => [team, 0]));

    monthSchedule.forEach((scheduleDay) => {
      workDays[scheduleDay.dayTeam] += 1;
      workDays[scheduleDay.nightTeam] += 1;
    });

    return workDays;
  }

  function createCalendarCell(date, isCurrentMonth, today, scheduleDay = null) {
    const teams = scheduleDay
      ? {
          dayTeam: scheduleDay.dayTeam,
          nightTeam: scheduleDay.nightTeam,
        }
      : scheduleService.getTeamForDate(date);

    const specialDate = scheduleDay
      ? scheduleDay.specialDate
      : scheduleService.getSpecialDateForDate(date);

    const isToday = isCurrentMonth && dates.isSameDay(date, today);
    const isSunday = date.getDay() === 0;
    const isFifthBusinessDay = Boolean(
      isCurrentMonth && scheduleDay?.isFifthBusinessDay,
    );

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
        date: scheduleDay?.isoDate || dates.isoDateKey(date),
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

    if (isFifthBusinessDay) {
      const paymentIcon = createElement("span", {
        className: "payment-icon",
        attributes: {
          role: "img",
          tabindex: "0",
          "aria-label": "Dia de Pagamento",
          "data-bs-toggle": "tooltip",
          "data-bs-placement": "top",
          "data-bs-title": "Dia de Pagamento",
        },
      });

      paymentIcon.appendChild(createIcon("fa-solid fa-sack-dollar"));
      badges.appendChild(paymentIcon);
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
      const typeLabel =
        config.specialDateTypes[specialDate.type] || "Data especial";

      parts.push(`${typeLabel}: ${specialDate.name}`);
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

  function updateTeamBadges(teamWorkDays) {
    config.teams.forEach((team) => {
      const count = Number(teamWorkDays[team] || 0);

      const badge = elements.teamButtonsContainer.querySelector(
        `[data-team-badge="${team}"]`,
      );

      if (!badge) {
        return;
      }

      setText(badge, `${count} plantões`);
    });
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

    const previousMonthName = config.months[previousDate.getMonth()];
    const nextMonthName = config.months[nextDate.getMonth()];

    const previousLabel = `${previousMonthName} de ${previousDate.getFullYear()}`;

    const nextLabel = `${nextMonthName} de ${nextDate.getFullYear()}`;

    setText(elements.prevMonthNameEl, previousMonthName);
    setText(elements.nextMonthNameEl, nextMonthName);

    elements.prevMonthBtn.disabled = isAtStart;

    elements.nextMonthBtn.disabled = isAtEnd;

    elements.prevMonthBtn.setAttribute("aria-disabled", String(isAtStart));

    elements.nextMonthBtn.setAttribute("aria-disabled", String(isAtEnd));

    elements.prevMonthBtn.setAttribute(
      "aria-label",
      isAtStart
        ? "Não há mês anterior disponível"
        : `Voltar para ${previousLabel}`,
    );

    elements.nextMonthBtn.setAttribute(
      "aria-label",
      isAtEnd ? "Não há próximo mês disponível" : `Avançar para ${nextLabel}`,
    );
  }

  function updateHighlights() {
    elements.calendarBody
      .querySelectorAll(".schedule-entry")
      .forEach((entry) => {
        const team = entry.dataset.team;

        entry.classList.toggle(
          "is-highlighted",
          state.highlightedTeams.has(team),
        );
      });

    elements.teamButtonsContainer
      .querySelectorAll(".team-button")
      .forEach((button) => {
        const team = button.dataset.team;

        const isActive = state.highlightedTeams.has(team);

        button.classList.toggle("is-active", isActive);

        button.setAttribute("aria-pressed", String(isActive));

        button.setAttribute(
          "aria-label",
          isActive
            ? `Remover destaque da Equipe ${team}`
            : `Destacar Equipe ${team}`,
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
            () => {
              entry.classList.remove("is-pulsing");
            },
            {
              once: true,
            },
          );
        });
      });
  }

  function initializePaymentTooltips() {
    state.paymentTooltips = Array.from(
      elements.calendarBody.querySelectorAll('[data-bs-toggle="tooltip"]'),
    ).map(
      (element) =>
        new window.bootstrap.Tooltip(element, {
          trigger: "hover focus",
          container: "body",
        }),
    );
  }

  function disposePaymentTooltips() {
    state.paymentTooltips.forEach((tooltip) => {
      tooltip.dispose();
    });

    state.paymentTooltips = [];
  }

  function openSpecialDateModal(dateYear, dateKey) {
    const specialDates = scheduleService.getSpecialDates(Number(dateYear));

    const specialDate = specialDates?.[dateKey];

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

    elements.modal.dataset.specialDateName = specialDate.name;

    state.specialDateModal.show();
  }

  function handleModalShown() {
    if (elements.modal.dataset.specialDateName === "Ano Novo") {
      state.fireworksController.launch();
      return;
    }

    state.fireworksController.stop();
  }

  function handleModalHidden() {
    state.fireworksController.stop();

    delete elements.modal.dataset.specialDateName;

    if (
      state.lastFocusedElement &&
      document.contains(state.lastFocusedElement)
    ) {
      state.lastFocusedElement.focus({
        preventScroll: true,
      });
    }

    state.lastFocusedElement = null;
  }

  function goToCurrentMonth() {
    const today = new Date();

    setCurrentDate(today.getFullYear(), today.getMonth(), 1);

    renderCalendar();
  }

  function handleMonthChange() {
    setCurrentDate(elements.yearSelect.value, elements.monthSelect.value, 1);

    renderCalendar();
  }

  function handleYearChange() {
    setCurrentDate(elements.yearSelect.value, elements.monthSelect.value, 1);

    renderCalendar();
  }

  function bindEvents() {
    elements.prevMonthBtn.addEventListener("click", () => {
      moveMonth(-1);
    });

    elements.nextMonthBtn.addEventListener("click", () => {
      moveMonth(1);
    });

    elements.todayButton.addEventListener("click", goToCurrentMonth);

    elements.monthSelect.addEventListener("change", handleMonthChange);

    elements.yearSelect.addEventListener("change", handleYearChange);

    elements.themeToggleButton.addEventListener("click", () => {
      const currentTheme =
        elements.documentElement.dataset.theme === "light" ? "light" : "dark";

      applyTheme(currentTheme === "dark" ? "light" : "dark");
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

    elements.modal.addEventListener("shown.bs.modal", handleModalShown);

    elements.modal.addEventListener("hidden.bs.modal", handleModalHidden);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.fireworksController) {
        state.fireworksController.stop();
      }
    });
  }

  function initializeCurrentDate() {
    setCurrentDate(
      state.currentDate.getFullYear(),
      state.currentDate.getMonth(),
      1,
    );
  }

  function init() {
    initializeElements();
    initializeBootstrapComponents();

    state.fireworksController = namespace.createFireworksController(
      elements.fireworksCanvas,
    );

    initializeTheme();
    initializeSelectors();
    initializeHighlightedTeams();
    renderTeamButtons();
    initializeCurrentDate();

    bindEvents();
    renderCalendar();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
