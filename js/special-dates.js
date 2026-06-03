(function registerSpecialDatesRepository(window) {
  "use strict";

  const namespace = (window.COPOMScale = window.COPOMScale || {});
  const dates = namespace.dateUtils;

  if (!dates) {
    throw new Error("special-dates.js requer date-utils.js carregado previamente.");
  }

  const specialDatesCache = new Map();

  const VALID_SPECIAL_DATE_TYPES = Object.freeze([
    "national-holiday",
    "state-holiday",
    "municipal-holiday",
    "commemorative",
  ]);

  const VALID_SPECIAL_DATE_TYPES_SET = new Set(VALID_SPECIAL_DATE_TYPES);

  function toInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number)) {
      throw new TypeError(`${fieldName} precisa ser um número inteiro.`);
    }

    return number;
  }

  function assertValidSpecialDateType(type) {
    if (!VALID_SPECIAL_DATE_TYPES_SET.has(type)) {
      throw new Error(`Tipo de data especial inválido: ${type}`);
    }
  }

  function normalizeTextList(value, fieldName) {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0);
    }

    const normalizedValue = String(value ?? "").trim();

    if (normalizedValue.length === 0) {
      throw new Error(`O campo ${fieldName} precisa conter ao menos um texto válido.`);
    }

    return [normalizedValue];
  }

  function createSpecialDate(type, name, summary, motivation) {
    assertValidSpecialDateType(type);

    const safeName = String(name ?? "").trim();

    if (safeName.length === 0) {
      throw new Error("A data especial precisa ter um nome válido.");
    }

    const safeSummary = normalizeTextList(summary, "summary");
    const safeMotivation = normalizeTextList(motivation, "motivation");

    if (safeSummary.length === 0) {
      throw new Error(`A data especial "${safeName}" precisa ter ao menos um resumo.`);
    }

    if (safeMotivation.length === 0) {
      throw new Error(`A data especial "${safeName}" precisa ter ao menos uma mensagem.`);
    }

    return {
      type,
      name: safeName,
      summary: safeSummary,
      motivation: safeMotivation,
    };
  }

  function createFixedSpecialDates() {
    return {
      "0-1": createSpecialDate(
        "national-holiday",
        "Ano Novo",
        [
          "Confraternização Universal que marca o início de um novo ciclo.",
          "Feriado Nacional que simboliza a paz e a união entre os povos.",
          "O primeiro dia do ano civil, tempo para renovação e esperança.",
        ],
        [
          "Que este novo ano traga 365 novas oportunidades de ser feliz.",
          "Um novo capítulo começa hoje. Escreva uma linda história!",
          "Renove suas energias e acredite no poder dos recomeços.",
        ]
      ),

      "0-25": createSpecialDate(
        "municipal-holiday",
        "Aniversário de São Paulo",
        [
          "Celebração da fundação do Colégio de São Paulo de Piratininga em 1554.",
          "Feriado Municipal em homenagem à maior metrópole do Brasil.",
          "Dia de valorizar a diversidade, a cultura e o trabalho do povo paulistano.",
        ],
        [
          "Parabéns, São Paulo! Cidade que acolhe sonhos e constrói futuros.",
          "Non ducor, duco. Não sou conduzido, conduzo.",
          "Que o progresso da nossa cidade seja sempre humano e inclusivo.",
        ]
      ),

      "3-21": createSpecialDate(
        "national-holiday",
        "Tiradentes",
        [
          "Homenagem a Joaquim José da Silva Xavier, mártir da Inconfidência Mineira.",
          "Data que relembra a luta pela liberdade e independência do Brasil.",
          "Feriado Nacional de grande importância cívica e histórica.",
        ],
        [
          "A liberdade é o nosso bem maior. Honre a história.",
          "Que o ideal de justiça e liberdade guie sempre nossos passos.",
          "Sejamos cidadãos conscientes e defensores da nossa pátria.",
        ]
      ),

      "4-1": createSpecialDate(
        "national-holiday",
        "Dia do Trabalho",
        [
          "Dia Internacional dos Trabalhadores.",
          "Celebração das conquistas históricas e dos direitos da classe trabalhadora.",
          "Momento de reflexão sobre a dignidade e o valor de todas as profissões.",
        ],
        [
          "O trabalho dignifica e constrói nações. Parabéns!",
          "Que seu esforço seja sempre reconhecido e valorizado.",
          "Nenhum sucesso é alcançado sem dedicação. Orgulhe-se do seu ofício.",
        ]
      ),

      "6-9": createSpecialDate(
        "state-holiday",
        "Revolução Constitucionalista",
        [
          "Data Magna do Estado de São Paulo.",
          "Homenagem aos heróis de 1932 que lutaram pela Constituição e pela democracia.",
          "Feriado Estadual que exalta o orgulho e a bravura paulista.",
        ],
        [
          "Pelo Brasil, tudo! A lei e a ordem acima de tudo.",
          "Honramos o passado para fortalecer o nosso futuro democrático.",
          "São Paulo nunca foge à luta. Respeito aos nossos heróis!",
        ]
      ),

      "8-7": createSpecialDate(
        "national-holiday",
        "Independência do Brasil",
        [
          "Dia da Pátria: celebração do Grito do Ipiranga em 1822.",
          "Marco da soberania nacional e do rompimento dos laços com Portugal.",
          "Data cívica que celebra o nascimento do Brasil como nação independente.",
        ],
        [
          "Independência ou morte! Que o amor pelo Brasil nos una.",
          "Brava gente brasileira! Orgulho de pertencer a esta nação.",
          "Construir um país livre e justo é dever de todos nós.",
        ]
      ),

      "9-12": createSpecialDate(
        "national-holiday",
        "Nossa Senhora Aparecida",
        [
          "Dia da Padroeira do Brasil e Dia das Crianças.",
          "Feriado Nacional marcado por grande devoção religiosa e festividades.",
          "Celebração da fé, da esperança e da proteção materna.",
        ],
        [
          "Que a Padroeira do Brasil cubra nossa nação de bênçãos.",
          "Fé na vida e esperança no coração. Tudo vai dar certo.",
          "A pureza das crianças nos ensina a ver o mundo com mais amor.",
        ]
      ),

      "10-2": createSpecialDate(
        "national-holiday",
        "Finados",
        [
          "Dia de respeito e memória aos que já partiram.",
          "Momento de reflexão sobre a vida e homenagem aos entes queridos.",
          "Um dia de silêncio, oração e saudade.",
        ],
        [
          "A saudade é o amor que fica. Guarde as boas lembranças.",
          "Aqueles que amamos vivem eternamente em nossos corações.",
          "Que a paz e o consolo alcancem a todos neste dia de memória.",
        ]
      ),

      "10-15": createSpecialDate(
        "national-holiday",
        "Proclamação da República",
        [
          "Comemoração da instauração do regime republicano em 1889.",
          "Fim da monarquia e início da República Federativa do Brasil.",
          "Data para celebrar a cidadania, a democracia e as instituições.",
        ],
        [
          "Ordem e progresso. Que a República seja de todos e para todos.",
          "Viva a democracia! Participar é construir o país que queremos.",
          "A força da nação reside na união do seu povo.",
        ]
      ),

      "10-20": createSpecialDate(
        "national-holiday",
        "Consciência Negra",
        [
          "Dia Nacional de Zumbi e da Consciência Negra.",
          "Data dedicada à reflexão sobre a inserção do negro na sociedade brasileira.",
          "Luta contra o racismo e valorização da cultura e herança afro-brasileira.",
        ],
        [
          "Respeito não tem cor, tem consciência. Diga não ao racismo.",
          "A diversidade é a nossa maior riqueza. Celebre a cultura negra.",
          "Que a luta por igualdade e justiça seja um compromisso diário.",
        ]
      ),

      "11-15": createSpecialDate(
        "commemorative",
        "Aniversário da PMESP",
        [
          "Fundação da Polícia Militar do Estado de São Paulo em 1831.",
          "Homenagem à Força Pública e aos seus integrantes.",
          "Reconhecimento aos serviços prestados na proteção da sociedade.",
        ],
        [
          "Lealdade e constância. Parabéns aos integrantes da PMESP.",
          "Servir e proteger: uma missão de honra e responsabilidade.",
          "Nossa gratidão a quem dedica sua vida à segurança da sociedade.",
        ]
      ),

      "11-25": createSpecialDate(
        "national-holiday",
        "Natal",
        [
          "Celebração cristã do nascimento de Jesus.",
          "Festa universal de paz, amor, união familiar e fraternidade.",
          "Tempo de renovação, generosidade e esperança.",
        ],
        [
          "Que a luz do Natal ilumine seu lar e traga paz ao mundo.",
          "O melhor presente é a união da família e o amor no coração.",
          "Feliz Natal! Que a esperança renasça em cada um de nós.",
        ]
      ),
    };
  }

  function addSpecialDate(repository, date, specialDate) {
    if (!repository || typeof repository !== "object") {
      throw new TypeError("O repositório de datas especiais precisa ser um objeto.");
    }

    const key = dates.dateKey(date);

    repository[key] = createSpecialDate(
      specialDate.type,
      specialDate.name,
      specialDate.summary,
      specialDate.motivation
    );
  }

  function addMovableSpecialDates(repository, year) {
    const safeYear = toInteger(year, "Ano");
    const easter = dates.calculateEasterDate(safeYear);

    const goodFriday = dates.addDays(easter, -2);
    const carnivalMonday = dates.addDays(easter, -48);
    const carnivalTuesday = dates.addDays(easter, -47);
    const ashWednesday = dates.addDays(easter, -46);
    const corpusChristi = dates.addDays(easter, 60);

    const mothersDay = dates.getSecondSunday(safeYear, 4);
    const fathersDay = dates.getSecondSunday(safeYear, 7);

    addSpecialDate(repository, goodFriday, {
      type: "national-holiday",
      name: "Sexta-feira Santa",
      summary: [
        "Feriado religioso que relembra a crucificação e morte de Jesus Cristo.",
        "Data de reflexão, silêncio e penitência para os cristãos.",
        "Um dos momentos mais importantes do calendário cristão.",
      ],
      motivation: [
        "Momento de pausa para renovar a fé e a esperança.",
        "Que o silêncio deste dia traga paz ao coração.",
        "Independente da crença, um dia para exercitar compaixão e respeito.",
      ],
    });

    addSpecialDate(repository, corpusChristi, {
      type: "national-holiday",
      name: "Corpus Christi",
      summary: [
        "Celebração do mistério da Eucaristia, o sacramento do corpo e do sangue de Cristo.",
        "Tradicionalmente marcado por procissões e tapetes coloridos nas ruas.",
        "Data de grande importância no calendário cristão e civil.",
      ],
      motivation: [
        "Dia de celebrar a fé, a comunhão e a tradição.",
        "Aproveite o descanso para estar com a família.",
        "Que a tradição e a cultura tragam cor aos nossos dias.",
      ],
    });

    addSpecialDate(repository, carnivalMonday, {
      type: "commemorative",
      name: "Carnaval (Segunda)",
      summary: [
        "Ponto facultativo tradicional que antecede a terça-feira de Carnaval.",
        "Dia de blocos, festas e grande movimentação popular.",
        "Data com impacto na rotina de serviços, trânsito e policiamento.",
      ],
      motivation: [
        "Alegria e descontração para recarregar as energias.",
        "Celebre a cultura brasileira com responsabilidade.",
        "Aproveite o momento de folga com segurança.",
      ],
    });

    addSpecialDate(repository, carnivalTuesday, {
      type: "commemorative",
      name: "Carnaval (Terça)",
      summary: [
        "Ponto alto das festividades de Carnaval.",
        "Embora não seja feriado nacional oficial, é amplamente tratado como folga em muitos locais.",
        "Data de grande impacto operacional no policiamento e nos serviços de emergência.",
      ],
      motivation: [
        "Que a alegria do Carnaval contagie o restante do ano.",
        "Diversão com segurança é a melhor combinação.",
        "Um dia para celebrar a vida e a identidade cultural brasileira.",
      ],
    });

    addSpecialDate(repository, ashWednesday, {
      type: "commemorative",
      name: "Quarta-feira de Cinzas",
      summary: [
        "Marca o fim do Carnaval e o início da Quaresma.",
        "Em muitos locais, o expediente tem início após o meio-dia.",
        "Data de retorno gradual à normalidade após os dias de festa.",
      ],
      motivation: [
        "Hora de retomar o foco e os objetivos do ano.",
        "Que o reinício das atividades seja leve e produtivo.",
        "Um bom retorno ao trabalho a todos.",
      ],
    });

    addSpecialDate(repository, mothersDay, {
      type: "commemorative",
      name: "Dia das Mães",
      summary: [
        "Celebrado no segundo domingo de maio, homenageia as mães.",
        "Data dedicada ao reconhecimento do amor, cuidado e presença materna.",
      ],
      motivation: [
        "Mãe: princípio de tudo e sinônimo de amor infinito.",
        "Que todas as mães sejam lembradas com respeito, carinho e gratidão.",
      ],
    });

    addSpecialDate(repository, fathersDay, {
      type: "commemorative",
      name: "Dia dos Pais",
      summary: [
        "Celebrado no segundo domingo de agosto, homenageia os pais.",
        "Data dedicada ao reconhecimento da presença, proteção e orientação paterna.",
      ],
      motivation: [
        "Pai é aquele que cuida, ama, orienta e protege.",
        "Que todos os pais sejam homenageados com gratidão e respeito.",
      ],
    });
  }

  function freezeSpecialDate(specialDate) {
    Object.freeze(specialDate.summary);
    Object.freeze(specialDate.motivation);

    return Object.freeze(specialDate);
  }

  function freezeSpecialDates(repository) {
    Object.values(repository).forEach((specialDate) => {
      freezeSpecialDate(specialDate);
    });

    return Object.freeze(repository);
  }

  function getSpecialDates(year) {
    const safeYear = toInteger(year, "Ano");

    if (safeYear < 1583) {
      throw new RangeError("Ano inválido informado para consulta de datas especiais.");
    }

    if (specialDatesCache.has(safeYear)) {
      return specialDatesCache.get(safeYear);
    }

    const repository = createFixedSpecialDates();

    addMovableSpecialDates(repository, safeYear);

    const frozenRepository = freezeSpecialDates(repository);

    specialDatesCache.set(safeYear, frozenRepository);

    return frozenRepository;
  }

  namespace.specialDatesRepository = Object.freeze({
    getSpecialDates,
  });
})(window);
