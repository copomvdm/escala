(function registerDateUtils(window) {
  "use strict";

  window.COPOMScale = window.COPOMScale || {};

  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

  function assertValidDate(date, functionName) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError(`Data inválida informada para ${functionName}.`);
    }
  }

  function toInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number)) {
      throw new TypeError(`${fieldName} precisa ser um número inteiro.`);
    }

    return number;
  }

  function createDate(year, month, day) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");
    const safeDay = toInteger(day, "Dia");

    const date = new Date(safeYear, safeMonth, safeDay);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  function startOfDay(date) {
    assertValidDate(date, "startOfDay");

    return createDate(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function normalizeDate(date) {
    return startOfDay(date).getTime();
  }

  function differenceInCalendarDays(startDate, endDate) {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    const startUtc = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    const endUtc = Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

    return Math.round((endUtc - startUtc) / MILLISECONDS_PER_DAY);
  }

  function isSameDay(firstDate, secondDate) {
    return normalizeDate(firstDate) === normalizeDate(secondDate);
  }

  function isWeekend(date) {
    const dayOfWeek = startOfDay(date).getDay();

    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  function dateKey(date) {
    const safeDate = startOfDay(date);

    return `${safeDate.getMonth()}-${safeDate.getDate()}`;
  }

  function isoDateKey(date) {
    const safeDate = startOfDay(date);
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, "0");
    const day = String(safeDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatMonthYear(date, months) {
    const safeDate = startOfDay(date);

    const monthName =
      Array.isArray(months) && months[safeDate.getMonth()]
        ? months[safeDate.getMonth()]
        : safeDate.toLocaleDateString("pt-BR", {
            month: "long",
          });

    return `${monthName} de ${safeDate.getFullYear()}`;
  }

  function formatFullDate(date, config) {
    const safeDate = startOfDay(date);

    const weekdaysLong =
      config && Array.isArray(config.weekdaysLong)
        ? config.weekdaysLong
        : [];

    const months =
      config && Array.isArray(config.months)
        ? config.months
        : [];

    const weekday =
      weekdaysLong[safeDate.getDay()] ||
      safeDate.toLocaleDateString("pt-BR", {
        weekday: "long",
      });

    const month =
      months[safeDate.getMonth()] ||
      safeDate.toLocaleDateString("pt-BR", {
        month: "long",
      });

    return `${weekday}, ${safeDate.getDate()} de ${month} de ${safeDate.getFullYear()}`;
  }

  function getDaysInMonth(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");

    return createDate(safeYear, safeMonth + 1, 0).getDate();
  }

  function getMonthMetadata(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");

    const firstDay = createDate(safeYear, safeMonth, 1);
    const lastDay = createDate(safeYear, safeMonth + 1, 0);

    return Object.freeze({
      year: firstDay.getFullYear(),
      month: firstDay.getMonth(),
      firstDay,
      lastDay,
      firstWeekday: firstDay.getDay(),
      daysInMonth: lastDay.getDate(),
    });
  }

  function addDays(date, amount) {
    const safeDate = startOfDay(date);
    const safeAmount = toInteger(amount, "Quantidade de dias");

    return createDate(
      safeDate.getFullYear(),
      safeDate.getMonth(),
      safeDate.getDate() + safeAmount
    );
  }

  function addMonths(date, amount) {
    const safeDate = startOfDay(date);
    const safeAmount = toInteger(amount, "Quantidade de meses");

    return createDate(
      safeDate.getFullYear(),
      safeDate.getMonth() + safeAmount,
      1
    );
  }

  function getSecondSunday(year, month) {
    const safeYear = toInteger(year, "Ano");
    const safeMonth = toInteger(month, "Mês");

    const firstDayOfMonth = createDate(safeYear, safeMonth, 1);
    const firstSundayOffset = (7 - firstDayOfMonth.getDay()) % 7;

    return createDate(safeYear, safeMonth, 1 + firstSundayOffset + 7);
  }

  function calculateEasterDate(year) {
    const y = toInteger(year, "Ano");

    if (y < 1583) {
      throw new RangeError(
        "O cálculo da Páscoa requer um ano válido a partir de 1583."
      );
    }

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

    return createDate(y, month, day);
  }

  function safeRandomItem(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "";
      }

      const index = Math.floor(Math.random() * value.length);

      return String(value[index] ?? "");
    }

    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }

  window.COPOMScale.dateUtils = Object.freeze({
    MILLISECONDS_PER_DAY,
    createDate,
    startOfDay,
    normalizeDate,
    differenceInCalendarDays,
    isSameDay,
    isWeekend,
    dateKey,
    isoDateKey,
    formatMonthYear,
    formatFullDate,
    getDaysInMonth,
    getMonthMetadata,
    addDays,
    addMonths,
    getSecondSunday,
    calculateEasterDate,
    safeRandomItem,
  });
})(window);
