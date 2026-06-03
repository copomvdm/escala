(function registerScheduleService(window) {
  "use strict";

  const namespace = (window.COPOMScale = window.COPOMScale || {});
  const config = namespace.config;
  const dates = namespace.dateUtils;

  if (!config || !dates) {
    throw new Error(
      "schedule-service.js requer config.js e date-utils.js carregados previamente."
    );
  }

  const REAL_HOLIDAY_TYPES = Object.freeze([
    "national-holiday",
    "state-holiday",
    "municipal-holiday",
  ]);

  const REAL_HOLIDAY_TYPES_SET = new Set(REAL_HOLIDAY_TYPES);

  function getSpecialDatesRepository() {
    if (
      !namespace.specialDatesRepository ||
      typeof namespace.specialDatesRepository.getSpecialDates !== "function"
    ) {
      throw new Error("special-dates.js não foi carregado corretamente.");
    }

    return namespace.specialDatesRepository;
  }

  function toInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number)) {
      throw new TypeError(`${fieldName} precisa ser um número inteiro.`);
    }

    return number;
  }

  function assertValidTeam(team) {
    if (!config.teams.includes(team)) {
      throw new Error(
        `Equipe inválida encontrada na configuração da escala: ${team}`
      );
    }
  }

  function assertValidSequence(sequence, sequenceName) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      throw new Error(
        `A sequência ${sequenceName} precisa conter ao menos uma equipe.`
      );
    }

    sequence.forEach(assertValidTeam);
  }

  function validateScheduleConfiguration() {
    if (!config.schedule || !config.schedule.baseDate) {
      throw new Error("A configuração da escala precisa conter uma data-base.");
    }

    const base = config.schedule.baseDate;

    dates.createDate(base.year, base.month, base.day);

    assertValidSequence(config.schedule.daySequence, "daySequence");
    assertValidSequence(config.schedule.nightSequence, "nightSequence");
  }

  function getBaseDate() {
    const base = config.schedule.baseDate;

    return dates.createDate(base.year, base.month, base.day);
  }

  function getSequenceIndex(diffDays, sequenceLength) {
    return ((diffDays % sequenceLength) + sequenceLength) % sequenceLength;
  }

  function createEmptyTeamCounter() {
    return Object.fromEntries(config.teams.map((team) => [team, 0]));
  }

  function getTeamForDate(targetDate) {
    const safeDate = dates.startOfDay(targetDate);
    const baseDate = getBaseDate();
    const diffDays = dates.differenceInCalendarDays(baseDate, safeDate);

    const dayIndex = getSequenceIndex(
      diffDays,
      config.schedule.daySequence.length
    );

    const nightIndex = getSequenceIndex(
      diffDays,
      config.schedule.nightSequence.length
    );

    return Object.freeze({
      dayTeam: config.schedule.daySequence[dayIndex],
      nightTeam: config.schedule.nightSequence[nightIndex],
    });
  }

  function getSpecialDates(year) {
    const safeYear = toInteger(year, "Ano");

    return getSpecialDatesRepository().getSpecialDates(safeYear);
  }

  function getSpecialDateForDate(targetDate) {
    const safeDate = dates.startOfDay(targetDate);
    const specialDates = getSpecialDates(safeDate.getFullYear());

    return specialDates[dates.dateKey(safeDate)] || null;
  }

  function isRealHoliday(specialDate) {
    return Boolean(
      specialDate &&
        typeof specialDate.type === "string" &&
        REAL_HOLIDAY_TYPES_SET.has(specialDate.type)
    );
  }

  function isBusinessDay(targetDate) {
    const safeDate = dates.startOfDay(targetDate);
    const specialDate = getSpecialDateForDate(safeDate);

    return !dates.isWeekend(safeDate) && !isRealHoliday(specialDate);
  }

  function getFifthBusinessDay(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");
    const daysInMonth = dates.getDaysInMonth(safeYear, safeMonth);

    let businessDayCount = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = dates.createDate(safeYear, safeMonth, day);

      if (!isBusinessDay(currentDate)) {
        continue;
      }

      businessDayCount += 1;

      if (businessDayCount === 5) {
        return currentDate;
      }
    }

    return null;
  }

  function isFifthBusinessDay(targetDate) {
    const safeDate = dates.startOfDay(targetDate);

    const fifthBusinessDay = getFifthBusinessDay(
      safeDate.getFullYear(),
      safeDate.getMonth()
    );

    return Boolean(fifthBusinessDay && dates.isSameDay(safeDate, fifthBusinessDay));
  }

  function getMonthlyTeamWorkDays(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");
    const daysInMonth = dates.getDaysInMonth(safeYear, safeMonth);
    const workDays = createEmptyTeamCounter();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = dates.createDate(safeYear, safeMonth, day);
      const teams = getTeamForDate(currentDate);

      workDays[teams.dayTeam] += 1;
      workDays[teams.nightTeam] += 1;
    }

    return Object.freeze(workDays);
  }

  function getMonthSchedule(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");
    const daysInMonth = dates.getDaysInMonth(safeYear, safeMonth);
    const fifthBusinessDay = getFifthBusinessDay(safeYear, safeMonth);
    const schedule = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = dates.createDate(safeYear, safeMonth, day);
      const teams = getTeamForDate(currentDate);
      const specialDate = getSpecialDateForDate(currentDate);
      const isWeekend = dates.isWeekend(currentDate);
      const isHoliday = isRealHoliday(specialDate);

      schedule.push(
        Object.freeze({
          date: currentDate,
          isoDate: dates.isoDateKey(currentDate),
          dayTeam: teams.dayTeam,
          nightTeam: teams.nightTeam,
          specialDate,
          isWeekend,
          isBusinessDay: !isWeekend && !isHoliday,
          isFifthBusinessDay: Boolean(
            fifthBusinessDay && dates.isSameDay(currentDate, fifthBusinessDay)
          ),
        })
      );
    }

    return Object.freeze(schedule);
  }

  validateScheduleConfiguration();

  namespace.scheduleService = Object.freeze({
    getTeamForDate,
    getSpecialDates,
    getSpecialDateForDate,
    isRealHoliday,
    isBusinessDay,
    getFifthBusinessDay,
    isFifthBusinessDay,
    getMonthlyTeamWorkDays,
    getMonthSchedule,
  });
})(window);
