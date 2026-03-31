const getSpecialDatesData = () => {
  return {
    // --- JANEIRO (0) ---
    "0-1": {
      type: "national-holiday",
      name: "Ano Novo",
      summary: [
        "Confraternização Universal que marca o início de um novo ciclo.",
        "Feriado Nacional que simboliza a paz e a união entre os povos.",
        "O primeiro dia do ano civil, tempo para renovação e esperança."
      ],
      motivation: [
        "Que este novo ano traga 365 novas oportunidades de ser feliz.",
        "Um novo capítulo começa hoje. Escreva uma linda história!",
        "Renove suas energias e acredite no poder dos recomeços."
      ]
    },
    "0-25": {
      type: "municipal-holiday",
      name: "Aniversário de São Paulo",
      summary: [
        "Celebração da fundação do Colégio de São Paulo de Piratininga em 1554.",
        "Feriado Municipal em homenagem à maior metrópole do Brasil.",
        "Dia de valorizar a diversidade, a cultura e o trabalho do povo paulistano."
      ],
      motivation: [
        "Parabéns, São Paulo! Cidade que acolhe sonhos e constrói futuros.",
        "Non ducor, duco (Não sou conduzido, conduzo). Viva a força de SP!",
        "Que o progresso da nossa cidade seja sempre humano e inclusivo."
      ]
    },

    // --- ABRIL (3) ---
    "3-21": {
      type: "national-holiday",
      name: "Tiradentes",
      summary: [
        "Homenagem a Joaquim José da Silva Xavier, mártir da Inconfidência Mineira.",
        "Data que relembra a luta pela liberdade e independência do Brasil.",
        "Feriado Nacional de grande importância cívica e histórica."
      ],
      motivation: [
        "A liberdade é o nosso bem maior. Honre a história!",
        "Que o ideal de justiça e liberdade guie sempre nossos passos.",
        "Sejamos cidadãos conscientes e defensores da nossa pátria."
      ]
    },

    // --- MAIO (4) ---
    "4-1": {
      type: "national-holiday",
      name: "Dia do Trabalho",
      summary: [
        "Dia Internacional dos Trabalhadores.",
        "Celebração das conquistas históricas e direitos da classe trabalhadora.",
        "Momento de reflexão sobre a dignidade e o valor de todas as profissões."
      ],
      motivation: [
        "O trabalho dignifica e constrói nações. Parabéns!",
        "Que seu esforço seja sempre reconhecido e valorizado.",
        "Nenhum sucesso é alcançado sem dedicação. Orgulhe-se do seu ofício."
      ]
    },

    // --- JULHO (6) ---
    "6-9": {
      type: "state-holiday",
      name: "Revolução Constitucionalista",
      summary: [
        "Data Magna do Estado de São Paulo.",
        "Homenagem aos heróis de 1932 que lutaram pela Constituição e Democracia.",
        "Feriado Estadual que exalta o orgulho e a bravura paulista."
      ],
      motivation: [
        "Pelo Brasil, tudo! A lei e a ordem acima de tudo.",
        "Honramos o passado para fortalecer o nosso futuro democrático.",
        "São Paulo nunca foge à luta. Respeito aos nossos heróis!"
      ]
    },

    // --- SETEMBRO (8) ---
    "8-7": {
      type: "national-holiday",
      name: "Independência do Brasil",
      summary: [
        "Dia da Pátria: Celebração do Grito do Ipiranga em 1822.",
        "Marco da soberania nacional e do rompimento dos laços com Portugal.",
        "Data cívica que celebra o nascimento do Brasil como nação."
      ],
      motivation: [
        "Independência ou Morte! Que o amor pelo Brasil nos una.",
        "Brava gente brasileira! Orgulho de pertencer a esta nação.",
        "Construir um país livre e justo é dever de todos nós."
      ]
    },

    // --- OUTUBRO (9) ---
    "9-12": {
      type: "national-holiday",
      name: "Nossa Sra. Aparecida",
      summary: [
        "Dia da Padroeira do Brasil e Dia das Crianças.",
        "Feriado Nacional marcado por grande devoção religiosa e festividades.",
        "Celebração da fé, da esperança e da proteção materna."
      ],
      motivation: [
        "Que a Padroeira do Brasil cubra nossa nação de bênçãos.",
        "Fé na vida e esperança no coração. Tudo vai dar certo!",
        "A pureza das crianças nos ensina a ver o mundo com mais amor."
      ]
    },

    // --- NOVEMBRO (10) ---
    "10-2": {
      type: "national-holiday",
      name: "Finados",
      summary: [
        "Dia de Finados: Data de respeito e memória aos que já partiram.",
        "Momento de reflexão sobre a vida e homenagem aos entes queridos.",
        "Um dia de silêncio, oração e saudade."
      ],
      motivation: [
        "A saudade é o amor que fica. Guarde as boas lembranças.",
        "Aqueles que amamos vivem eternamente em nossos corações.",
        "Que a paz e o consolo alcancem a todos neste dia de memória."
      ]
    },
    "10-15": {
      type: "national-holiday",
      name: "Proclamação da República",
      summary: [
        "Comemoração da instauração do regime republicano em 1889.",
        "Fim da monarquia e início da República Federativa do Brasil.",
        "Data para celebrar a cidadania, a democracia e as instituições."
      ],
      motivation: [
        "Ordem e Progresso. Que a República seja de todos e para todos.",
        "Viva a democracia! Participar é construir o país que queremos.",
        "A força da nação reside na união do seu povo."
      ]
    },
    "10-20": {
      type: "national-holiday",
      name: "Consciência Negra",
      summary: [
        "Dia Nacional de Zumbi e da Consciência Negra.",
        "Data dedicada à reflexão sobre a inserção do negro na sociedade brasileira.",
        "Luta contra o racismo e valorização da cultura e herança afro-brasileira."
      ],
      motivation: [
        "Respeito não tem cor, tem consciência. Diga não ao racismo!",
        "A diversidade é a nossa maior riqueza. Celebre a cultura negra.",
        "Que a luta por igualdade e justiça seja um compromisso diário."
      ]
    },

    // --- DEZEMBRO (11) ---
    "11-15": {
      type: "commemorative",
      name: "Aniversário da PMESP",
      summary: [
        "Fundação da Polícia Militar do Estado de São Paulo (1831).",
        "Homenagem à Força Pública e aos seus integrantes.",
        "Reconhecimento aos serviços prestados na proteção da sociedade."
      ],
      motivation: [
        "Lealdade e Constância. Parabéns aos guerreiros da PMESP!",
        "Servir e Proteger: uma missão de honra e sacrifício.",
        "Nossa gratidão a quem arrisca a vida pela nossa segurança."
      ]
    },
    "11-25": {
      type: "national-holiday",
      name: "Natal",
      summary: [
        "Celebração cristã do nascimento de Jesus.",
        "Festa universal de paz, amor, união familiar e fraternidade.",
        "Tempo de renovação, generosidade, troca de presentes e esperança."
      ],
      motivation: [
        "Que a luz do Natal ilumine seu lar e traga paz ao mundo.",
        "O melhor presente é a união da família e o amor no coração.",
        "Feliz Natal! Que a esperança renasça em cada um de nós."
      ]
    }
  };
};