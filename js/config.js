(function registerConfig(window) {
  "use strict";

  window.COPOMScale = window.COPOMScale || {};

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
      return value;
    }

    Object.values(value).forEach((nestedValue) => {
      if (nestedValue && typeof nestedValue === "object") {
        deepFreeze(nestedValue);
      }
    });

    return Object.freeze(value);
  }

  const config = {
    minYear: 2025,
    yearRangeAhead: 2,

    months: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],

    weekdaysShort: [
      "Dom",
      "Seg",
      "Ter",
      "Qua",
      "Qui",
      "Sex",
      "Sáb",
    ],

    weekdaysLong: [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ],

    teams: [
      "A",
      "B",
      "C",
      "D",
      "E",
    ],

    teamColors: {
      A: {
        bg: "#ecfdf5",
        text: "#047857",
        ring: "#34d399",
      },
      B: {
        bg: "#eff6ff",
        text: "#2563eb",
        ring: "#60a5fa",
      },
      C: {
        bg: "#f5f3ff",
        text: "#7c3aed",
        ring: "#a78bfa",
      },
      D: {
        bg: "#fff7ed",
        text: "#c2410c",
        ring: "#fb923c",
      },
      E: {
        bg: "#fefce8",
        text: "#a16207",
        ring: "#facc15",
      },
    },

    schedule: {
      baseDate: {
        year: 2025,
        month: 0,
        day: 1,
      },

      daySequence: [
        "A",
        "B",
        "A",
        "E",
        "B",
      ],

      nightSequence: [
        "E",
        "C",
        "D",
        "C",
        "D",
      ],
    },

    specialDateTypes: {
      "national-holiday": "Feriado Nacional",
      "state-holiday": "Feriado Estadual",
      "municipal-holiday": "Feriado Municipal",
      "commemorative": "Data Comemorativa / Ponto Facultativo",
    },

    storageKeys: {
      theme: "copom-scale-theme",
      highlightedTeams: "copom-highlighted-teams",
    },
  };

  window.COPOMScale.config = deepFreeze(config);
})(window);
