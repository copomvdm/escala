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
            'commemorative': 'Data Comemorativa',
        }
    };

    const getSpecialDates = (year) => {
        if (specialDatesCache[year]) {
            return specialDatesCache[year];
        }

        // Carrega as datas fixas do arquivo specialDates.js
        const dates = getSpecialDatesData();

        // --- CALCULA DATAS DINÂMICAS (MÓVEIS) ---
        const easter = ((y) => {
            const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(y, month, day);
        })(year);

        const getDateOffset = (baseDate, offsetDays) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + offsetDays);
            return d;
        };

        const getSecondSunday = (targetMonth) => {
            const date = new Date(year, targetMonth, 1);
            let sundayCount = 0;
            while (sundayCount < 2) {
                if (date.getDay() === 0) sundayCount++;
                if (sundayCount < 2) date.setDate(date.getDate() + 1);
            }
            return date;
        };

        const goodFriday = getDateOffset(easter, -2);
        const carnivalMonday = getDateOffset(easter, -48);
        const carnivalTuesday = getDateOffset(easter, -47);
        const ashWednesday = getDateOffset(easter, -46);
        const corpusChristi = getDateOffset(easter, 60);
        const mothersDay = getSecondSunday(4);
        const fathersDay = getSecondSunday(7);

        // --- ADICIONA AS DATAS MÓVEIS AO OBJETO DE DATAS (COM MÚLTIPLAS MENSAGENS) ---
        dates[`${goodFriday.getMonth()}-${goodFriday.getDate()}`] = {
            type: 'national-holiday',
            name: 'Sexta-feira Santa',
            summary: [
                'Dia de profundo significado para os cristãos, que relembram a paixão e a crucificação de Jesus Cristo.',
                'Data central da Semana Santa, que convida à reflexão sobre o sacrifício e o amor incondicional.',
                'Momento de introspecção e fé, que antecede a celebração da ressurreição na Páscoa.',
                'Dia de silêncio, jejum e oração, em respeito à morte de Jesus na cruz.',
                'Também conhecida como "Sexta-feira da Paixão", marca o ápice do sofrimento de Cristo.',
                'Neste dia, a Igreja não celebra a missa, mas sim a solene Ação Litúrgica da Paixão do Senhor.',
                'A Via-Sacra é uma das principais práticas deste dia, meditando o caminho de Cristo até o Calvário.',
                'Celebração que nos lembra do amor de Deus, que entregou seu Filho para a salvação da humanidade.',
                'Um dia para contemplar a cruz, não como símbolo de derrota, mas de amor extremo.',
                'As igrejas se cobrem de luto, os sinos não tocam e o altar fica despojado.',
                'Momento de meditar sobre as Sete Palavras de Jesus na Cruz, suas últimas lições.',
                'Data que nos convida a refletir sobre nossos próprios sofrimentos à luz do sacrifício de Cristo.',
                'A adoração à Santa Cruz é um dos ritos centrais da celebração deste dia.',
                'Um feriado de recolhimento, onde os fiéis são convidados a uma profunda jornada interior.',
                'Dia que compõe o Tríduo Pascal, o coração do ano litúrgico cristão.',
                'A Paixão de Cristo é narrada em todas as igrejas, relembrando os eventos de sua condenação e morte.',
                'Tradições populares, como a Procissão do Senhor Morto, marcam a noite deste dia.',
                'Um dia para refletir sobre o perdão, exemplificado por Cristo ao perdoar seus algozes.',
                'A Sexta-feira Santa é um convite ao silêncio para escutar a voz de Deus.',
                'Celebração da misericórdia divina, que se revela plenamente na cruz.',
                'Data que nos recorda da fragilidade humana e da força do amor divino.',
                'Momento para praticar a caridade e a penitência como formas de união ao sofrimento de Cristo.',
                'Um dia que aponta para a esperança da Ressurreição, a vitória da vida sobre a morte.',
                'A escuridão e o silêncio deste dia preparam os corações para a luz da Vigília Pascal.',
                'Data que nos ensina sobre a obediência e a entrega total à vontade de Deus.',
                'A cruz se torna o trono de um Rei que reina pelo amor e pelo serviço.',
                'Dia de profundo respeito e solenidade em todo o mundo cristão.',
                'A morte de Cristo na cruz é o gesto de reconciliação entre Deus e a humanidade.',
                'Um momento para pedir perdão por nossas falhas e renovar nosso compromisso com o bem.',
                'Celebração que nos mostra que, mesmo na dor mais profunda, Deus está presente.',
                'Data para meditar sobre o véu do templo que se rasgou, simbolizando o novo acesso a Deus.',
                'Um dia para se solidarizar com todos os que sofrem no mundo.',
                'A Sexta-feira Santa nos ensina que o amor verdadeiro envolve sacrifício e doação.',
                'Momento de contemplar as chagas de Cristo como fonte de cura e salvação.',
                'Neste dia, a Igreja se une em oração universal por todas as necessidades da humanidade.',
                'A ausência da Eucaristia neste dia simboliza o vazio deixado pela morte do Senhor.',
                'Um dia para lembrar que a história não termina na sexta-feira; a esperança do domingo está viva.',
                'Celebração que nos convida a tomar nossa cruz e seguir Jesus no caminho do amor.',
                'Data que nos inspira a morrer para o pecado e para o egoísmo.',
                'Momento de profunda gratidão pelo dom da redenção conquistado na cruz.',
                'Um dia em que o silêncio fala mais alto que qualquer palavra.',
                'A cruz, antes símbolo de maldição, é transformada em sinal de vitória e esperança.',
                'Data para refletir sobre a solidão e o abandono sentidos por Cristo na cruz.',
                'Um dia para estar aos pés da cruz, junto com Maria, a mãe de Jesus.',
                'A Sexta-feira Santa é a antessala da maior festa cristã: a Páscoa da Ressurreição.',
                'Celebração do amor que vai até as últimas consequências, sem pedir nada em troca.',
                'Momento de despojar-se do supérfluo e focar no essencial: a relação com Deus.',
                'Um dia que nos desafia a encontrar sentido no sofrimento e na perda.',
                'A Paixão de Cristo revela a profundidade do mal e a força ainda maior do amor de Deus.',
                'Data que une os cristãos de todo o mundo na mesma memória e na mesma esperança.'
            ],
            motivation: [
                'Que a reflexão deste dia nos traga um entendimento mais profundo sobre o amor e o perdão.',
                'O silêncio de hoje nos prepara para a alegria do amanhã. Que a paz e a reflexão estejam com todos.',
                'Que o exemplo de superação e fé de Cristo inspire nossos corações a sermos mais fortes.',
                'Na cruz, encontramos a maior prova de amor. Que este amor transforme sua vida.',
                'Que o silêncio desta Sexta-feira Santa acalme sua alma e renove sua esperança.',
                'Lembre-se: a história não acaba na cruz. O domingo de Páscoa virá!',
                'Que a contemplação do sacrifício de Cristo nos inspire a sermos mais compassivos e solidários.',
                'É no vazio do silêncio que encontramos as respostas mais profundas. Tenha um dia de reflexão.',
                'Que a força que Jesus demonstrou na cruz seja sua inspiração para superar qualquer desafio.',
                'O perdão é a lição mais poderosa da cruz. Pratique-o em sua vida.',
                'Que a esperança da ressurreição ilumine a escuridão e a dor deste dia.',
                'O amor suporta tudo. Que a lembrança do sacrifício de Cristo fortaleça seus laços.',
                'Abrace o silêncio de hoje e permita que ele cure e tranquilize seu coração.',
                'Nenhuma dor é em vão quando unida à cruz de Cristo. Encontre sentido em suas lutas.',
                'Que este dia de penitência seja um caminho para uma vida mais plena e mais leve.',
                'A cruz não é o fim, mas o começo da nossa maior esperança. Creia na vitória da vida!',
                'Que a meditação sobre a Paixão de Cristo nos ensine a amar sem medidas.',
                'Que a serenidade e a paz desta Sexta-feira Santa acompanhem você e sua família.',
                'Em cada sofrimento, lembre-se que Cristo já o viveu por nós. Você não está sozinho.',
                'Hoje é dia de olhar para dentro, de se perdoar e de se preparar para o novo.',
                'Que o gesto de amor de Cristo na cruz inspire seus gestos de amor no dia a dia.',
                'A verdadeira força se revela na capacidade de suportar e de perdoar. Seja forte!',
                'Que a reflexão de hoje nos ajude a valorizar mais a vida e as pessoas que amamos.',
                'Deixe que o silêncio de hoje fale ao seu coração e traga as respostas que você busca.',
                'A esperança é a luz que brilha mesmo na mais escura das noites. Feliz Páscoa se aproxima!',
                'Que a entrega total de Cristo nos inspire a viver com mais propósito e doação.',
                'É preciso morrer para o velho homem para que o novo possa nascer. Renove-se!',
                'Que a sua fé seja maior que a sua dor. O amor de Deus é o seu sustento.',
                'O caminho da cruz nos leva à glória da ressurreição. Continue sua jornada com fé.',
                'Que a paz que emana da cruz de Cristo preencha todos os espaços do seu coração.',
                'Use este dia para se desconectar do barulho do mundo e se reconectar com sua essência.',
                'O maior ato de coragem foi um ato de amor. Que ele nos inspire a sermos corajosos.',
                'Que a gratidão pelo dom da vida e da salvação seja sua oração neste dia.',
                'A Sexta-feira Santa nos ensina a encontrar luz mesmo em meio às sombras.',
                'Que o perdão que Cristo ofereceu na cruz seja um exemplo para nossas relações.',
                'Hoje, a semente é lançada à terra. Em breve, ela florescerá em vida nova. Tenha esperança!',
                'Que a contemplação da dor de Cristo nos torne mais sensíveis à dor do nosso próximo.',
                'Que a sua oração hoje seja um abraço de consolo no coração de Jesus.',
                'Depois da tempestade da Paixão, virá a calmaria radiante da Ressurreição.',
                'Que este dia de recolhimento sirva para fortalecer seu espírito e sua fé.',
                'A cruz é a ponte entre a dor e a glória. Atravesse-a com confiança.',
                'Que o exemplo de humildade de Cristo nos ensine a servir com mais amor.',
                'O amor venceu. Essa é a mensagem final da Sexta-feira Santa. Acredite nisso.',
                'Que a bênção que desce da cruz de Cristo recaia sobre você e sua família.',
                'Hoje é um dia para curar feridas, perdoar dívidas e recomeçar no amor.',
                'Que o silêncio e a oração de hoje preparem seu coração para a explosão de alegria da Páscoa.',
                'Mesmo no sofrimento, há um propósito maior. Confie no plano de Deus.',
                'Que a imagem do Cristo crucificado nos lembre do preço da nossa liberdade e do tamanho do amor de Deus.',
                'Este é um dia de passagem. Da dor para a cura, da morte para a vida. Prepare-se!',
                'Que a paz, a reflexão e a esperança sejam suas companheiras nesta Sexta-feira da Paixão.'
            ]
        };
        dates[`${carnivalMonday.getMonth()}-${carnivalMonday.getDate()}`] = {
            type: 'national-holiday',
            name: 'Carnaval (Segunda)',
            summary: [
                'A folia atinge seu pico na segunda-feira, um dos dias mais intensos do Carnaval brasileiro.',
                'Dia de megablocos de rua que arrastam multidões por avenidas em diversas cidades.',
                'Noite de gala no Sambódromo, com a segunda parte dos desfiles das escolas de samba do Grupo Especial.',
                'A energia contagiante dos trios elétricos de Salvador vive um de seus momentos mais fortes.',
                'Data em que a criatividade dos foliões com suas fantasias está em plena efervescência.',
                'Considerado por muitos o melhor dia para a folia de rua, com uma vasta programação de blocos.',
                'A celebração continua a todo vapor, servindo como um grande aquecimento para o dia final.',
                'Dia em que a cultura popular brasileira se manifesta com força total na música, na dança e na arte.',
                'A segunda-feira de Carnaval é sinônimo de festa sem hora para acabar.',
                'Momento de celebração da diversidade, com blocos temáticos para todos os gostos e públicos.',
                'A competição no Sambódromo se acirra, com as últimas escolas buscando o título de campeã.',
                'As ruas se transformam em rios de gente, todos unidos pelo ritmo e pela alegria do Carnaval.',
                'Um dia de liberdade de expressão, onde a sátira e a alegria caminham juntas.',
                'A tradição dos bailes de Carnaval também marca a noite de segunda, com festas sofisticadas.',
                'Data que antecede o clímax da festa, mantendo a energia e a expectativa em alta.',
                'O som das baterias dos blocos e das escolas de samba ecoa por todo o país.',
                'Dia em que o folião testa seus limites de energia e alegria, preparando-se para a reta final.',
                'A segunda-feira é um pilar da maior festa democrática do mundo, celebrada pelo povo.',
                'Momento em que as tradições carnavalescas regionais, como o frevo e o maracatu, brilham.',
                'Um dia inteiro dedicado à celebração, da manhã até a madrugada seguinte.',
                'As cidades turísticas atingem sua capacidade máxima de foliões neste dia.',
                'O espetáculo visual das alegorias e fantasias no Sambódromo encanta o Brasil e o mundo.',
                'Dia de viver intensamente a cultura do Carnaval de rua, com suas marchinhas e sambas.',
                'A segunda-feira consolida o Carnaval como um patrimônio cultural imaterial do Brasil.',
                'Festa que movimenta a economia criativa, dos artistas aos vendedores ambulantes.',
                'Um dia para se fantasiar, cantar e dançar, esquecendo as preocupações do cotidiano.',
                'A penúltima noite de desfiles é crucial para definir a escola de samba campeã.',
                'Data em que a festa já tem história para contar, mas ainda muita folia pela frente.',
                'A alegria coletiva das ruas é a principal marca da segunda-feira de Carnaval.',
                'Um dia que celebra a resiliência e a capacidade do povo brasileiro de fazer festa.',
                'A programação cultural é intensa, com shows e eventos espalhados por todo o território.',
                'Momento de experimentar as diversas facetas do Carnaval brasileiro em um só dia.',
                'A segunda-feira é a prova de que a energia do folião parece ser inesgotável.',
                'Dia em que os encontros acontecem, amizades são feitas e amores de Carnaval florescem.',
                'A festa popular em sua forma mais pura, com o povo como protagonista principal.',
                'O brilho do glitter e a cor dos confetes dominam a paisagem urbana.',
                'Um dia de catarse coletiva, uma pausa na rotina para a celebração da vida.',
                'A batida do surdo e o som da cuíca ditam o ritmo da nação nesta segunda-feira.',
                'Data que reforça a identidade cultural brasileira através de sua festa mais famosa.',
                'O auge da celebração, onde a alegria é a única regra a ser seguida.',
                'Dia em que a rua se torna o palco mais democrático para a expressão artística.',
                'A segunda-feira de Carnaval é um capítulo vibrante na história da festa popular.',
                'Momento de imersão total na atmosfera carnavalesca, de corpo e alma.',
                'Data que mostra a força do Carnaval como evento que une diferentes gerações.',
                'A expectativa para a apuração das notas do desfile começa a crescer neste dia.',
                'Um dia para celebrar a liberdade de ser quem você quiser, sem julgamentos.',
                'A festa continua com o mesmo fôlego do primeiro dia, ou até mais.',
                'A segunda-feira é o coração pulsante da semana de Carnaval.',
                'Dia de fazer parte de um mar de gente feliz, cantando em uníssono.',
                'A celebração da cultura afro-brasileira é um dos pilares da festa neste dia.'
            ],
            motivation: [
                'Mergulhe na folia! Que a alegria contagiante do Carnaval inspire momentos inesquecíveis.',
                'A vida é uma festa! Aproveite cada serpentina, cada confete e cada sorriso. Bom Carnaval!',
                'Que a energia vibrante desta festa popular renove seu ânimo e traga muita felicidade.',
                'A festa está no auge! Dance, cante e celebre como se não houvesse amanhã.',
                'Ainda há muita folia pela frente! Haja fôlego e disposição para não perder nada.',
                'Vista sua melhor fantasia: a de ser feliz! Brilhe muito nesta segunda de Carnaval.',
                'Esqueça os problemas, vista seu sorriso e caia na gandaia. A alegria é contagiante!',
                'Que o ritmo da bateria dos blocos embale seu coração e te encha de energia positiva.',
                'Aproveite cada segundo! O Carnaval passa rápido, mas as boas memórias duram para sempre.',
                'Seja quem você quiser ser. A magia do Carnaval está na liberdade de expressão!',
                'A felicidade está nos bloquinhos, nos desfiles, nos encontros. Viva o agora!',
                'Deixe a música te levar e a alegria te guiar. Uma ótima e animada segunda-feira!',
                'Recarregue suas energias com a positividade do Carnaval. Leve essa vibe para o resto do ano!',
                'Não economize no glitter nem nos sorrisos. Hoje o dia é todo seu!',
                'Que a batida do surdo marque o compasso de um dia incrivelmente feliz para você.',
                'A rua te chama! Vá ser feliz, pular e celebrar a vida com seus amigos.',
                'Crie histórias, colecione momentos. O Carnaval é o cenário perfeito para isso.',
                'Que a criatividade e a irreverência do Carnaval te inspirem a ver a vida com mais leveza.',
                'Ainda dá tempo de curtir muito. A festa só acaba quando termina!',
                'Junte sua turma, escolha seu bloco e vá fazer parte da maior festa do planeta.',
                'Que a sua única preocupação de hoje seja qual música cantar a seguir.',
                'Permita-se viver a catarse do Carnaval. É um banho de alegria para a alma!',
                'Aproveite a energia coletiva para elevar sua própria vibração. A união faz a festa!',
                'O Carnaval é a prova de que a felicidade pode ser simples e contagiante.',
                'Dance até os pés doerem e o coração ficar leve. Você merece essa alegria!',
                'Que a magia do Sambódromo te encante e te mostre a força da nossa cultura.',
                'Sorria para um estranho, cante com a multidão. O espírito do Carnaval é a união.',
                'A segunda-feira é o teste de resistência do folião. Mostre que você tem samba no pé!',
                'Que as cores do Carnaval pintem a sua vida com mais otimismo e alegria.',
                'Ainda não cansou? Ótimo! A folia te espera de braços abertos.',
                'Viva a cultura popular! Sinta o orgulho de fazer parte desta celebração tão brasileira.',
                'Que cada passo de dança seja um passo em direção à felicidade plena.',
                'Aproveite a pausa na rotina para se reconectar com a sua essência mais alegre.',
                'Que a sua fantasia mais bonita seja a sua energia contagiante.',
                'O Carnaval é um estado de espírito. Mantenha essa alegria viva o ano todo.',
                'Não tenha medo de ser feliz. Hoje, a alegria é a sua única obrigação.',
                'Faça desta segunda-feira um dia lendário. Crie memórias que te façam sorrir depois.',
                'A trilha sonora de hoje é o samba, o axé, o frevo. Deixe seu corpo responder!',
                'Que a intensidade deste dia te lembre de viver cada momento da vida ao máximo.',
                'A folia é o melhor remédio para a alma. Aproveite sua dose de hoje!',
                'Abra os braços para a diversidade e celebre o encontro de todas as tribos.',
                'Que a sua segunda de Carnaval seja tão espetacular quanto um desfile de campeã.',
                'Não deixe para amanhã a folia que você pode pular hoje!',
                'A energia que você emana no Carnaval volta em dobro para você. Espalhe alegria!',
                'Ainda tem muita história pra contar e muito chão pra pular. Vamos com tudo!',
                'Que a irreverência do Carnaval te inspire a quebrar a rotina e a ousar mais.',
                'Hoje, a rua é o seu salão de festas. Divirta-se como nunca!',
                'Faça do confete a sua chuva de bênçãos e da serpentina o seu abraço.',
                'O Carnaval te convida a ser o protagonista da sua própria festa. Aceite o convite!',
                'Que a alegria desta segunda-feira seja o combustível para uma semana inteira de bom humor.'
            ]
        };
        dates[`${carnivalTuesday.getMonth()}-${carnivalTuesday.getDate()}`] = {
            type: 'national-holiday',
            name: 'Carnaval (Terça)',
            summary: [
                'O ápice e a despedida da folia, marcando o último dia oficial de festa antes da Quaresma.',
                'Conhecida como "Terça-feira Gorda", é a data que precede a Quarta-feira de Cinzas.',
                'Dia do "grand finale", onde os foliões aproveitam as últimas horas de celebração intensa.',
                'Tradicionalmente, um dia com desfiles de encerramento, como o das escolas de samba campeãs.',
                'As ruas ainda pulsam com os últimos blocos, em um clima de celebração e nostalgia.',
                'Momento em que a festa atinge seu clímax de energia, com um sentimento de "tudo ou nada".',
                'O último dia para usar a fantasia, se cobrir de glitter e dançar ao som das marchinhas.',
                'A despedida oficial do reinado de Momo, que entrega a chave da cidade de volta.',
                'Em muitos lugares, é o dia de apoteose dos desfiles, com a apresentação das agremiações vencedoras.',
                'A energia da festa se mistura com uma leve melancolia pelo fim da maior celebração do ano.',
                'Data que encerra um ciclo de festividades, que muitas vezes começa no pré-Carnaval.',
                'O último dia de excessos permitidos antes do período de recolhimento e penitência da Quaresma.',
                'Os "guerreiros da folia" dão seu último suspiro de alegria nas ruas e nos salões.',
                'Dia de celebrar com ainda mais intensidade, sabendo que a festa está chegando ao fim.',
                'A terça-feira de Carnaval é um marco no calendário cultural e social do Brasil.',
                'As baterias dos blocos e escolas de samba tocam com um vigor de despedida.',
                'Fim da maior festa popular do planeta, um evento que une milhões de pessoas.',
                'O último dia para viver a magia, a liberdade e a irreverência do espírito carnavalesco.',
                'Data em que os foliões começam a colecionar as memórias e a sentir saudades.',
                'Encerramento de um período de grande expressão da cultura e da identidade brasileira.',
                'Os últimos confetes são jogados, as últimas serpentinas são lançadas.',
                'Dia de aproveitar os últimos momentos de trios elétricos em Salvador e frevo em Olinda.',
                'A celebração se despede, deixando um rastro de alegria e a promessa de retorno no próximo ano.',
                'O último dia de uma pausa na rotina, uma válvula de escape coletiva.',
                'A festa termina, mas a energia e a inspiração cultural permanecem.',
                'Momento em que a cidade, transformada em palco, começa a se preparar para voltar ao normal.',
                'O encerramento oficial da folia, aguardado com ansiedade pela Quarta-feira de Cinzas.',
                'Data final para os encontros, as paqueras e as novas amizades típicas do Carnaval.',
                'A terça-feira é a coroação de dias de festa, música e dança.',
                'O último dia de trabalho para muitos artistas, músicos e trabalhadores do Carnaval.',
                'A atmosfera é de celebração máxima, aproveitando cada instante final.',
                'Fim do feriado prolongado, com um misto de cansaço e felicidade nos rostos dos foliões.',
                'As fantasias mais criativas têm sua última chance de brilhar nas ruas.',
                'O adeus à folia é celebrado com a mesma intensidade da abertura da festa.',
                'Dia de extravasar pela última vez antes de guardar as fantasias para o ano seguinte.',
                'A terça-feira de Carnaval fecha com chave de ouro a maior manifestação cultural do país.',
                'O último dia para se deixar levar pelo ritmo contagiante da festa popular.',
                'Um dia que já nasce com clima de saudade e promessas para o futuro.',
                'A festa acaba, mas o legado de alegria e união que ela promove fica.',
                'Data limite para viver a experiência completa do Carnaval brasileiro.',
                'O encerramento do espetáculo, quando as cortinas da folia se fecham.',
                'Dia de aproveitar os últimos raios de sol e as últimas batidas do tambor.',
                'A terça-feira é a última página de um livro intenso e colorido chamado Carnaval.',
                'Momento de agradecer pelos dias de festa e pela oportunidade de celebrar a vida.',
                'O fim da festa é também o início da contagem regressiva para o próximo Carnaval.',
                'A última chance de se perder na multidão e se encontrar na alegria coletiva.',
                'Data que simboliza o fim de um sonho coletivo, que se renova a cada ano.',
                'O último dia da "ilusão" carnavalesca antes do retorno à realidade.',
                'A terça-feira de Carnaval é a apoteose da alegria popular brasileira.',
                'Encerramento de um período de catarse, onde o povo é o rei da festa.'
            ],
            motivation: [
                'Aproveite até o último confete! Que a lembrança da festa nos traga sorrisos e alegria.',
                'Que a energia de hoje dure o ano inteiro! Um ótimo encerramento de Carnaval para todos.',
                'Despeça-se da folia com o coração leve e as energias renovadas. Até o próximo Carnaval!',
                'É o último dia! Não guarde energia, deixe tudo na avenida e nos blocos.',
                'Faça desta terça-feira a melhor memória do seu Carnaval. Viva intensamente!',
                'O Carnaval acaba, mas a alegria que ele nos dá pode durar para sempre. Guarde-a no coração.',
                'Quem disse que acabou? Enquanto houver música e um folião de pé, a festa continua!',
                'Use até a última gota de glitter e o último pingo de energia. Hoje pode!',
                'Um brinde aos sobreviventes da folia! Que a nossa despedida seja em grande estilo.',
                'Já com saudades? Isso é sinal de que valeu a pena! Ótima reta final de festa.',
                'Dance o último samba, cante a última marchinha e dê o último sorriso. Faça valer!',
                'Que a bateria do seu coração continue no ritmo do Carnaval o resto do ano.',
                'Obrigado, Carnaval! Por mais um ano de festas e alegrias. Nos vemos em breve!',
                'Feche este ciclo com chave de ouro e com as melhores companhias.',
                'Não pense no amanhã. O hoje ainda é Carnaval e pede passagem!',
                'Que as boas energias desta festa te acompanhem em todos os seus dias. Até 2026!',
                'Aproveite para criar aquela última história inesquecível para contar.',
                'A despedida é só um "até logo". O espírito carnavalesco vive em nós.',
                'Parabéns, folião! Você chegou ao final com muita história e samba no pé.',
                'Que a irreverência e a liberdade de hoje te inspirem a ser mais leve e feliz.',
                'Ainda dá tempo de ser o rei ou a rainha do seu próprio bloco. Coroe-se de alegria!',
                'Que o cansaço seja apenas um detalhe perto da imensidão da alegria de hoje.',
                'Recarregue a alma com os últimos momentos de pura felicidade carnavalesca.',
                'A festa se despede, mas deixa em nós a certeza de que a vida merece ser celebrada.',
                'Vamos fazer um encerramento tão épico que a saudade não vai nem ter tempo de chegar.',
                'Junte os amigos para a última rodada de folia. A união faz a festa até o fim!',
                'Que a sua fantasia de hoje seja a de uma pessoa imensamente feliz. E que ela dure!',
                'Guarde as lembranças, as músicas e as risadas. Elas serão seu combustível.',
                'Obrigado por tudo, Carnaval! Você foi incrível. Hora do último show!',
                'Aproveite a apoteose! Hoje, a avenida da vida é toda sua.',
                'Que a leveza do Carnaval te ajude a encarar a rotina com um novo olhar.',
                'Não deixe a peteca cair agora! A festa pede bis e você é o protagonista.',
                'Um último brinde à alegria, à amizade e à maior festa do mundo!',
                'Sorria! A melhor foto do seu Carnaval ainda pode ser a de hoje.',
                'Que a sua despedida seja tão colorida e vibrante quanto toda a festa.',
                'Cansado? Imagina! Isso é só o aquecimento para o próximo Carnaval.',
                'O importante é terminar a festa com o coração grato e cheio de boas histórias.',
                'Que a magia deste último dia te inspire a realizar grandes coisas.',
                'Ainda dá tempo de encontrar seu amor de Carnaval. Ou de celebrar o amor próprio na pista!',
                'A folia está no fim, mas a sua capacidade de ser feliz, não. Lembre-se disso!',
                'Para o folião de verdade, a terça-feira não é o fim, é o auge!',
                'Deixe sua marca nesta despedida: uma marca de pura alegria e energia contagiante.',
                'Que a corneta soe uma última vez, anunciando a apoteose da sua felicidade.',
                'A saudade já bate? Dance com ela! É a prova de que tudo foi maravilhoso.',
                'Faça as pazes com a quarta-feira. Mas só depois de curtir muito a terça!',
                'Hoje é o dia de gastar o resto da voz cantando seus hinos de Carnaval.',
                'Celebre a vida, celebre a cultura, celebre o fim de mais um Carnaval histórico.',
                'Que o último dia de festa te dê o impulso necessário para um ano incrível.',
                'A cortina se fecha, mas o espetáculo da sua vida continua. Faça ser grandioso!',
                'Despeça-se com um sorriso no rosto e a certeza do dever de folião cumprido!'
            ]
        };
        dates[`${ashWednesday.getMonth()}-${ashWednesday.getDate()}`] = {
            type: 'commemorative',
            name: 'Quarta-feira de Cinzas',
            summary: [
                'Início da Quaresma para os cristãos, um período de 40 dias de preparação para a Páscoa.',
                'Dia que simboliza a mortalidade humana e o arrependimento, convidando à conversão.',
                'Marca o fim oficial do Carnaval e o começo de um tempo de reflexão e penitência.',
                'Celebração em que os fiéis recebem a imposição de cinzas na testa, em forma de cruz.',
                'As cinzas utilizadas são, tradicionalmente, feitas dos ramos abençoados no Domingo de Ramos do ano anterior.',
                'Um dia de jejum e abstinência, especialmente de carne, para os católicos.',
                'A data convida a uma profunda reflexão sobre a frase: "Lembra-te que és pó, e ao pó hás de voltar".',
                'Momento de reconhecer nossa fragilidade e a necessidade de conversão e mudança de vida.',
                'O início de uma jornada espiritual que visa a purificação da mente e do coração.',
                'A Quarta-feira de Cinzas abre o tempo litúrgico da Quaresma, focado na oração, jejum e caridade.',
                'Dia que representa um ponto de virada, saindo da euforia da festa para o silêncio da reflexão.',
                'As cinzas simbolizam a condição de pecador, mas também a esperança no perdão de Deus.',
                'Um convite a "rasgar o coração, e não as vestes", buscando uma conversão sincera.',
                'Data que nos lembra da brevidade da vida e da importância de vivermos com propósito.',
                'O gesto de receber as cinzas é um ato público de humildade e desejo de mudança.',
                'A Quaresma, iniciada hoje, é um "deserto espiritual" para nos encontrarmos com Deus.',
                'Um dia para refletir sobre o que precisa "virar cinzas" em nossa vida para que o novo possa nascer.',
                'Marca o começo da contagem regressiva de 40 dias para a celebração da Páscoa.',
                'O silêncio e a sobriedade deste dia contrastam diretamente com a folia dos dias anteriores.',
                'Um momento para fazer um balanço da própria vida e traçar metas de crescimento espiritual.',
                'A cor litúrgica deste dia é o roxo, que simboliza a penitência e a contrição.',
                'Data que nos convida a intensificar as práticas de oração pessoal e comunitária.',
                'O jejum praticado neste dia visa o autocontrole e a solidariedade com os que passam fome.',
                'Um dia para iniciar um processo de "limpeza interior", abandonando maus hábitos.',
                'A Quaresma é vista como um tempo favorável para a reconciliação com Deus e com os irmãos.',
                'A imposição das cinzas é um rito que nos une como comunidade em busca de santidade.',
                'Data que nos recorda que a verdadeira alegria não está nos excessos, mas na paz interior.',
                'Início de um período para praticar a esmola e a caridade de forma mais intensa.',
                'Um dia para "se converter e crer no Evangelho", como diz o sacerdote no rito.',
                'As cinzas nos lembram que tudo neste mundo é passageiro, exceto o amor de Deus.',
                'Momento oportuno para se aproximar do sacramento da confissão ou reconciliação.',
                'A Quarta-feira de Cinzas não é um dia de tristeza, mas de esperança na misericórdia.',
                'Um convite a simplificar a vida e a focar no que é verdadeiramente essencial.',
                'Data que abre um tempo de escuta mais atenta da Palavra de Deus.',
                'O número 40 na Bíblia simboliza um tempo de preparação para um grande acontecimento.',
                'Um dia para planejar as pequenas renúncias que faremos ao longo da Quaresma.',
                'A jornada quaresmal é uma subida em direção à montanha da Páscoa.',
                'As cinzas são um sinal externo de uma decisão interna de mudança e conversão.',
                'Momento de se despojar das "fantasias" do ego para vestir a "roupa" da humildade.',
                'Data que nos lembra que somos peregrinos nesta terra, a caminho da pátria celeste.',
                'O início de um "retiro espiritual" de 40 dias para toda a Igreja.',
                'Um dia para refletir sobre como podemos ser melhores como pessoas e como cristãos.',
                'As cinzas nos nivelam: diante de Deus, todos somos iguais em nossa pequenez e necessidade.',
                'A Quaresma é uma oportunidade de "arrumar a casa" da nossa alma.',
                'Um convite a trocar o barulho pela prece, a pressa pela calma, a crítica pelo perdão.',
                'Data que nos chama a uma responsabilidade maior sobre nossas escolhas e atitudes.',
                'O início de um caminho de transformação que culmina na alegria da Ressurreição.',
                'Um dia para confrontar nossas próprias sombras com a esperança da luz de Cristo.',
                'A penitência quaresmal tem como objetivo final nos tornar mais livres e mais amorosos.',
                'As cinzas são o ponto de partida; a Páscoa é a gloriosa linha de chegada.'
            ],
            motivation: [
                'Que este seja um tempo para repensar atitudes, perdoar e se preparar para um novo ciclo.',
                'Todo fim é um novo começo. Que a Quarta-feira de Cinzas inspire um período de renovação interior.',
                'É tempo de reflexão e transformação. Que possamos encontrar paz e propósito neste novo ciclo.',
                'Que as cinzas de hoje fertilizem o solo da sua alma para uma colheita de grandes virtudes.',
                'Aproveite os próximos 40 dias para se reconectar com sua essência e com sua fé.',
                'Um novo capítulo começa agora. Escreva uma bela história de conversão e crescimento.',
                'Que o silêncio de hoje te traga as respostas que o barulho de ontem escondeu.',
                'A jornada de 40 dias começa com um único passo. Dê o seu com coragem e esperança.',
                'É tempo de olhar para dentro, de curar feridas e de fortalecer o espírito.',
                'Que a simplicidade das cinzas te inspire a encontrar a beleza no que é essencial.',
                'Use este tempo para se desapegar do que pesa e abrir espaço para a leveza da paz.',
                'A maior transformação acontece no silêncio do coração. Permita-se silenciar.',
                'Que a sua Quaresma seja uma jornada de autoconhecimento e de aproximação com Deus.',
                'Não é sobre o que você renuncia, mas sobre o que você ganha em troca: mais amor e mais paz.',
                'Que este seja o início de uma versão melhor e mais consciente de si mesmo.',
                'Abrace a oportunidade de recomeçar. A misericórdia de Deus se renova a cada dia.',
                'Que a oração seja sua companhia, o jejum sua fortaleza e a caridade sua alegria.',
                'Transforme a penitência em um ato de amor por si mesmo e pelos outros.',
                'Que a poeira das cinzas nos lembre da humildade necessária para crescer.',
                'Desejo a você uma Quaresma de muita luz, paz e profundas transformações.',
                'O deserto quaresmal pode parecer árido, mas é nele que as mais belas flores da alma nascem.',
                'Que cada dia da Quaresma seja um degrau a mais na escada da sua evolução espiritual.',
                'Perdoar é o primeiro passo para a cura. Comece sua jornada com o coração leve.',
                'Que a sua fé seja a bússola que guia seus passos nestes 40 dias.',
                'Não tema o deserto. É nele que encontramos os oásis mais preciosos.',
                'Que este tempo de recolhimento te ajude a ouvir a voz suave da sua intuição e da sua fé.',
                'A mudança que você busca no mundo começa pela mudança que você cultiva em seu coração.',
                'Que a renúncia ao supérfluo te revele a abundância do que realmente importa.',
                'A Páscoa será ainda mais brilhante se a preparação da Quaresma for bem feita. Capriche!',
                'Que a sua jornada quaresmal seja abençoada com serenidade, força e clareza.',
                'Plante hoje as sementes da mudança que você quer colher na Páscoa.',
                'Que o jejum de palavras negativas e a dieta de pensamentos positivos sejam sua meta.',
                'Que a sobriedade deste tempo te traga uma nova perspectiva sobre a vida.',
                'Aproveite para "arrumar a casa" da alma, jogando fora o que não serve mais.',
                'Que a sua oração seja mais íntima, sua caridade mais discreta e sua fé mais forte.',
                'A Quarta-feira de Cinzas não é um ponto final, mas um ponto de partida. Avante!',
                'Que a busca pela santidade comece nas pequenas coisas do seu dia a dia.',
                'Que este período de reflexão te inspire a ser um agente de paz no mundo.',
                'A disciplina da Quaresma é um treino para a liberdade do espírito. Abrace o desafio.',
                'Que a consciência da nossa finitude nos impulsione a viver cada dia com mais amor e intensidade.',
                'A conversão é um caminho, não um ato isolado. Desfrute da jornada.',
                'Que a sua maior penitência seja a de amar mais, perdoar mais e julgar menos.',
                'Deixe que as cinzas te lembrem de focar naquilo que é eterno e verdadeiramente valioso.',
                'Que a esperança da Ressurreição seja a luz que ilumina toda a sua Quaresma.',
                'É tempo de semear a paz, a começar pelo jardim do nosso próprio coração.',
                'Que a sua força de vontade seja fortalecida pela graça de Deus nesta caminhada.',
                'Não olhe para a Quaresma como um peso, mas como um presente para sua alma.',
                'Que este tempo de deserto te prepare para florescer de uma forma que você nunca imaginou.',
                'A verdadeira conversão se reflete em mais amor, mais paciência e mais compaixão.',
                'Que a sua Quaresma seja um tempo de reencontro: consigo mesmo, com o próximo e com Deus.'
            ]
        };
        dates[`${corpusChristi.getMonth()}-${corpusChristi.getDate()}`] = {
            type: 'national-holiday',
            name: 'Corpus Christi',
            summary: [
                'Solenidade da Igreja Católica que celebra a presença real de Jesus Cristo na Eucaristia.',
                'Festa do Corpo de Cristo, marcada por missas, procissões e adoração ao Santíssimo Sacramento.',
                'Tradição que une arte e fé através da confecção de tapetes coloridos nas ruas.',
                'Manifestação pública de fé na Eucaristia, o sacramento do corpo e sangue de Cristo.',
                'Um dia para honrar a instituição da Eucaristia, realizada por Jesus na Última Ceia.',
                'Celebração que remonta ao século XIII, reforçando a importância do sacramento da comunhão.',
                'Data em que a comunidade se reúne para enfeitar as ruas e celebrar sua fé publicamente.',
                'Feriado nacional de profundo significado religioso, que celebra o mistério da transubstanciação.',
                'Dia em que o Santíssimo Sacramento sai em procissão, abençoando as cidades e os fiéis.',
                'Os tapetes de serragem, areia e flores simbolizam a humildade e a adoração do povo.',
                'Uma festa que expressa a fé do povo de que Jesus caminha ao seu lado.',
                'Momento de união da comunidade paroquial na preparação e celebração da data.',
                'A procissão de Corpus Christi é um dos maiores testemunhos públicos da fé católica.',
                'Celebração da Eucaristia como fonte de vida e centro da fé cristã.',
                'Data que nos convida a meditar sobre o amor de Cristo, que se entrega como alimento.',
                'Os desenhos nos tapetes frequentemente retratam símbolos eucarísticos, passagens bíblicas e a paz.',
                'Uma expressão cultural e religiosa que embeleza as cidades e fortalece os laços comunitários.',
                'Dia de Adoração Eucarística, onde os fiéis passam tempo em oração diante do Santíssimo.',
                'Festa que ocorre na quinta-feira seguinte ao domingo da Santíssima Trindade.',
                'Celebração do "Pão Vivo que desceu do Céu", como descrito no Evangelho.',
                'Data que reforça a Eucaristia como o ápice da vida sacramental da Igreja.',
                'Os tapetes são uma forma de arte efêmera, feita com devoção para a passagem de Cristo.',
                'Um feriado que nos lembra da importância da comunhão e da partilha na vida cristã.',
                'A solenidade de Corpus Christi celebra o amor de Deus que se faz presente e próximo.',
                'Momento em que a Igreja celebra com grande júbilo o dom da presença de Jesus na Hóstia Santa.',
                'Tradição mantida por gerações, que passa de pais para filhos o amor pela Eucaristia.',
                'Festa que destaca a centralidade da missa na vida do católico.',
                'Um dia para refletir sobre o mistério da fé e a presença real de Cristo no pão e no vinho.',
                'Celebração que nos convida a ser "sacrários vivos", levando Cristo para o mundo.',
                'A procissão simboliza a caminhada do povo de Deus, alimentado por Cristo.',
                'Data de grande mobilização nas paróquias para a organização da liturgia e dos tapetes.',
                'Um testemunho de fé que transforma as ruas em uma extensão do templo.',
                'Celebração do sacrifício de amor de Cristo e sua permanência entre nós.',
                'Festa que exalta a humildade de Deus, que se esconde na simplicidade do pão.',
                'Dia para aprofundar a compreensão sobre o significado da Santa Comunhão.',
                'A beleza dos tapetes reflete a beleza da fé e do amor dedicados a Deus.',
                'Um feriado que convida à contemplação e à gratidão pelo dom da Eucaristia.',
                'A solenidade de Corpus Christi é um convite a viver em constante comunhão com Cristo.',
                'Celebra a Eucaristia como alimento para a nossa jornada espiritual.',
                'Data que nos lembra que, na Eucaristia, a Igreja encontra sua força e sua unidade.',
                'Festa que celebra Cristo como o pastor que guia e alimenta seu rebanho.',
                'Os tapetes são um "caminho sagrado" preparado para a passagem do Rei.',
                'Um dia de festa e louvor em honra ao Santíssimo Sacramento do altar.',
                'Celebração que nos ensina sobre serviço e doação, a exemplo de Cristo.',
                'Data em que a fé sai dos templos e vai ao encontro do povo nas ruas.',
                'A tradição dos tapetes é uma catequese visual, que evangeliza através da arte.',
                'Feriado que nos recorda o mandamento do amor: "Amai-vos uns aos outros".',
                'Festa da unidade da Igreja em torno do mistério eucarístico.',
                'Celebra a aliança eterna de Deus com a humanidade, renovada em cada missa.',
                'Um dia para declarar publicamente a fé na presença viva de Cristo na Eucaristia.'
            ],
            motivation: [
                'Que o simbolismo de união e fé deste dia renove nossas forças e inspire a fraternidade.',
                'Fé que se vê, que se sente, que se celebra em comunidade. Um abençoado dia de Corpus Christi!',
                'Que a beleza e a devoção desta data fortaleçam nossa esperança e nos guiem no caminho do bem.',
                'Que o Pão da Vida, Jesus na Eucaristia, alimente sua alma e fortaleça sua jornada.',
                'Ao caminhar em procissão, que possamos caminhar juntos na construção de um mundo mais justo.',
                'Que a Eucaristia seja a força que nos une e o alimento que nos sustenta. Feliz Corpus Christi!',
                'Que a beleza dos tapetes inspire a beleza de nossas ações e de nossa fé.',
                'Neste dia de adoração, que seu coração encontre a paz que só Cristo pode dar.',
                'Que a presença de Cristo na Eucaristia renove sua fé e sua esperança em dias melhores.',
                'A Eucaristia é a maior prova de amor. Que possamos partilhar esse amor com o próximo.',
                'Que a comunhão com Cristo nos transforme em pessoas mais solidárias e compassivas.',
                'Um dia para alimentar o espírito e fortalecer a alma. Viva Corpus Christi!',
                'Que a procissão de hoje seja um reflexo de nossa caminhada diária com fé e perseverança.',
                'Que a simplicidade do pão e do vinho nos ensine a valorizar as coisas essenciais da vida.',
                'Cristo se dá a nós como alimento. Que possamos nos doar em serviço aos nossos irmãos.',
                'Que a arte e a fé, unidas nesta data, coloram a sua vida com muita esperança.',
                'Receba a bênção do Santíssimo Sacramento. Que ela traga paz e proteção para seu lar.',
                'Que a fé demonstrada nas ruas se manifeste em gestos de amor no nosso dia a dia.',
                'Ajoelhe-se diante do Santíssimo e entregue suas preces. A fé move montanhas.',
                'Que a unidade da comunidade em torno dos tapetes nos inspire a sermos mais unidos sempre.',
                'A Eucaristia é remédio para a alma. Busque neste sacramento a sua cura e sua força.',
                'Que a celebração de hoje seja um marco de renovação espiritual em sua vida.',
                'Caminhar com Cristo é a certeza de que nunca estamos sozinhos em nossa jornada.',
                'Que a Eucaristia nos dê coragem para enfrentar os desafios com fé e confiança.',
                'Que o seu coração seja um sacrário vivo, cheio da presença e do amor de Cristo.',
                'A fé é como os tapetes: com pequenos gestos, construímos algo grandioso.',
                'Que este dia de louvor e adoração encha seu coração de alegria e gratidão.',
                'Que a comunhão nos fortaleça para sermos missionários do amor e da paz.',
                'Que a solenidade de Corpus Christi nos aproxime mais do coração de Jesus.',
                'A Eucaristia é o sol da nossa vida espiritual. Deixe-se iluminar por Ele.',
                'Que o trabalho em equipe para fazer os tapetes nos ensine sobre o valor da união.',
                'Desejo que a paz de Cristo, presente na Hóstia Santa, inunde todo o seu ser.',
                'Que a fé que hoje enche as ruas transborde do seu coração para o mundo.',
                'Que a gente aprenda com a Eucaristia a ser pão que se parte e se doa pelos outros.',
                'Um dia abençoado, para refletir, rezar e se sentir mais perto de Deus.',
                'Que a sua participação nesta festa da fé renove todas as suas energias.',
                'A procissão passa, mas a presença de Cristo em nós deve permanecer. Sejamos testemunhas!',
                'Que o amor de Cristo, celebrado hoje, seja a força que nos move em direção ao bem.',
                'Hoje é dia de honrar o Rei. Que Ele reine em sua vida e em sua família.',
                'Que a bênção de Deus, que passa hoje pelas nossas ruas, entre em sua casa e em sua vida.',
                'Que a cada comunhão, nosso coração se torne mais parecido com o de Jesus.',
                'A fé em comunidade é mais forte. Celebremos juntos este grande mistério de amor.',
                'Que a hóstia consagrada nos lembre do infinito amor de Deus por cada um de nós.',
                'Que a adoração a Jesus Eucarístico nos traga discernimento e sabedoria.',
                'Desejo que a paz, a fé e a união de Corpus Christi estejam com você hoje e sempre.',
                'Que o alimento do céu nos dê forças para a caminhada na terra.',
                'Um dia para olhar para o céu com gratidão e para o próximo com mais amor.',
                'Que a solenidade de hoje reforce sua fé e sua devoção. Um santo dia para você!',
                'Que a passagem do Santíssimo Sacramento renove a esperança em seu coração.',
                'Viva o Corpo de Cristo! Que Ele seja sempre nossa luz, nossa força e nossa paz.'
            ]
        };
        dates[`${mothersDay.getMonth()}-${mothersDay.getDate()}`] = {
            type: 'commemorative',
            name: 'Dia das Mães',
            summary: [
                'Homenagem especial às mães que vestem farda, protegendo a família em casa e a sociedade nas ruas.',
                'Celebração da dupla jornada de força e ternura da mãe policial militar.',
                'Um dia para reconhecer a mulher que é escudo para a sociedade e porto seguro para os filhos.',
                'Data que celebra a mãe cuja coragem na profissão inspira a força de sua família.',
                'A mãe policial: uma guerreira que troca o peso do colete pelo abraço acolhedor dos filhos.',
                'Homenagem àquela que ensina sobre justiça com o exemplo e sobre amor com o coração.',
                'Celebração da mulher que equilibra a disciplina do quartel com a doçura do lar.',
                'Um dia para honrar a mãe que enfrenta o perigo para garantir um mundo mais seguro para seus filhos.',
                'A resiliência de uma mãe que conforta o filho após um plantão de confrontos e desafios.',
                'Data para aplaudir a leoa que defende a população e cuida de seus filhotes com a mesma garra.',
                'Reconhecimento da força de uma mãe que lida com a complexidade da vida e da morte diariamente.',
                'Celebração da mãe cujo amor é a sua ocorrência de maior importância e prioridade.',
                'Um dia para pensar nas mães que saem para o serviço sem a certeza do retorno.',
                'Homenagem à mulher que é exemplo de honra, dever e, acima de tudo, de amor materno.',
                'A mãe policial é a prova de que a farda cobre um coração que bate mais forte pelos filhos.',
                'Data para celebrar a educadora que ensina sobre leis, mas também sobre o amor incondicional.',
                'Reconhecimento da mãe que patrulha a cidade e depois fiscaliza a lição de casa.',
                'Celebração da heroína da vida real, que não usa capa, mas sim uma farda e muita coragem.',
                'Um dia para a mãe que, mesmo cansada, encontra forças para ser a fortaleza de sua família.',
                'Homenagem à mulher cuja intuição materna é uma arma poderosa, tanto em casa quanto no serviço.',
                'A mãe policial: sinônimo de força, integridade e de um amor que protege sem limites.',
                'Data para valorizar a mãe que faz do seu trabalho um legado de segurança para as futuras gerações.',
                'Reconhecimento da mãe que muitas vezes perde uma festa de família para atender um chamado.',
                'Celebração da mulher que sabe ser firme e gentil, na mesma medida e com a mesma sabedoria.',
                'Um dia para a mãe que é a personificação da ordem, do progresso e do amor.',
                'Homenagem àquela cuja canção de ninar pode ser interrompida pelo som da sirene.',
                'A mãe PM é um exemplo de cidadania e dedicação em tempo integral.',
                'Data que celebra a guardiã da lei e a rainha do lar.',
                'Reconhecimento do sacrifício silencioso da mãe que vive para servir e proteger.',
                'Celebração da mulher que tem a coragem de um exército e a ternura de um anjo.',
                'Um dia para a mãe que ensina aos filhos o verdadeiro significado de coragem e serviço.',
                'Homenagem à mãe cujo colo é o lugar mais seguro do mundo, mesmo ela vivendo no perigo.',
                'A mãe policial, uma inspiração de como conciliar a doçura com uma força inabalável.',
                'Data que celebra a mulher por trás da farda, com seus medos, sonhos e amor infinito.',
                'Reconhecimento da mãe que jurou defender a todos, mas cujo juramento mais forte é o de amar seus filhos.',
                'Celebração da líder que comanda uma equipe e guia uma família com a mesma competência.',
                'Um dia para a mãe que conhece o valor da vida como ninguém.',
                'Homenagem à mãe que é a primeira a ensinar sobre respeito à autoridade e ao próximo.',
                'A mãe da família policial militar, uma figura de resiliência e apoio constante.',
                'Data para celebrar a mãe que, ao proteger a todos, está protegendo o futuro de seus próprios filhos.',
                'Reconhecimento da mãe que, em seu dia, pode estar de plantão, velando pelo sono de outras famílias.',
                'Celebração da mulher cuja força não está na arma, mas no coração.',
                'Um dia para a mãe que é a prova de que heroínas existem e usam farda.',
                'Homenagem à mãe que faz da sua profissão uma missão e da sua família, sua vocação.',
                'A mãe policial tem um olhar treinado para o perigo e um coração treinado para o amor.',
                'Data para celebrar a mulher que impõe a ordem com a voz e acalma a alma com o abraço.',
                'Reconhecimento do desafio de ser mãe em uma profissão que exige um estado de alerta constante.',
                'Celebração da mãe que inspira seus filhos a serem cidadãos justos e corajosos.',
                'Um dia para a mãe que é a tranquilidade em meio ao caos, dentro e fora de casa.',
                'Homenagem à mulher que prova que o lugar de mãe e de policial é onde ela quiser.'
            ],
            motivation: [
                'Feliz Dia das Mães àquela que protege a sociedade nas ruas e a família em casa. Sua força é nossa inspiração!',
                'Para a mãe que veste a farda com honra e a maternidade com amor infinito. Você é nossa heroína!',
                'Que o seu dia seja de paz e descanso, longe de qualquer ocorrência. Hoje, nós cuidamos de você!',
                'Sua coragem na rua é o espelho da força que você nos dá em casa. Parabéns, mãe guerreira!',
                'Obrigado por sua dupla jornada de serviço e amor. Que você esteja sempre em segurança. Feliz dia!',
                'Para a mulher mais forte que conhecemos: a que usa distintivo no peito e amor no coração.',
                'Que a proteção que você oferece aos outros retorne em dobro para você. Feliz Dia das Mães!',
                'Você nos ensinou que a verdadeira força vem da coragem e do amor. Obrigado, mãe!',
                'Hoje, seu único chamado é para receber nosso amor e carinho. Descanse, rainha!',
                'Para a mãe que é sinônimo de segurança e de amor. Temos muito orgulho de você!',
                'Feliz dia para a mãe que é QAP 24h no amor e na proteção. Código 5 para você hoje: Perfeito!',
                'Que seu coração encontre a paz e a tranquilidade que você tanto promove no mundo. Parabéns!',
                'Você enfrenta o perigo lá fora para que tenhamos paz aqui dentro. Nossa eterna gratidão, mãe.',
                'Para a comandante do nosso batalhão de amor, todo o nosso respeito e carinho. Feliz dia!',
                'Que seu dia seja de folga dos perigos e de plantão intensivo de abraços e beijos.',
                'Mãe, sua bravura inspira e seu amor conforta. A combinação perfeita. Parabéns!',
                'Obrigado por ser nosso exemplo de dever, honra e, principalmente, de amor incondicional.',
                'Desejamos que sua maior ocorrência hoje seja uma overdose de felicidade. Feliz Dia das Mães!',
                'Para a mãe que tem a mira certa para educar e o coração gigante para amar.',
                'Que a sua força, demonstrada em cada serviço, seja recompensada com um dia de muita paz.',
                'Feliz dia para a mulher que prova que a farda mais bonita é a armadura do amor de mãe.',
                'Você é a nossa maior segurança, nosso melhor abrigo. Te amamos, mãe policial!',
                'Que hoje você possa depor a farda e vestir apenas a alegria de estar com sua família.',
                'Parabéns, mãe! Que seu legado de coragem e retidão guie sempre os nossos passos.',
                'Desejamos que seu rádio hoje só chame para boas notícias e muitas homenagens.',
                'Para a mãe que não teme o perigo, mas se derrete com um sorriso. Você é incrível!',
                'Sua disciplina nos formou, seu amor nos transformou. Obrigado por tudo, mãe.',
                'Que você possa patrulhar apenas os corredores da felicidade neste dia especial.',
                'Feliz dia para a nossa heroína, que merece todas as medalhas de honra e de amor.',
                'Obrigado por ser a guardiã da nossa família e um exemplo para a sociedade.',
                'Que a sua ronda de hoje seja em volta de uma mesa farta de amor e alegria.',
                'Parabéns para a mãe que tem porte de guerreira e alma de anjo protetor.',
                'Seu trabalho é proteger a todos, mas hoje nossa missão é proteger e mimar você.',
                'Que a paz que você tanto busca para a sociedade reine em seu coração. Feliz dia!',
                'Para a mãe que é mais corajosa que um batalhão e mais doce que qualquer mel. Te amamos!',
                'Desejamos um 10-4 para todas as suas preces e um TKS para todo o seu amor.',
                'Feliz Dia das Mães! Que a sua força continue a nos inspirar e sua presença a nos abençoar.',
                'Obrigado por nos ensinar a sermos fortes e justos. Você é a melhor mentora.',
                'Que seu dia seja tranquilo, sem chamados, apenas com o toque do nosso carinho.',
                'Parabéns, mãe! Você é a prova de que amor e coragem são a mesma coisa.',
                'Para a mulher que é referência no trabalho e pilar em casa. Sua grandeza é imensurável.',
                'Que a alegria de hoje desarme qualquer cansaço. Você merece todo o descanso do mundo.',
                'Feliz dia para a mãe que, mesmo de folga, está sempre de prontidão para nos amar.',
                'Obrigado por fazer do nosso lar a zona mais segura e amada do mundo.',
                'Que sua força seja sempre renovada e seu coração sempre protegido. Parabéns, mãe!',
                'Você é a nossa inspiração de que é possível ser firme sem nunca perder a ternura.',
                'Desejamos que sua vida seja sempre uma ocorrência de final feliz. Te amamos!',
                'Parabéns para a mãe que tem a autoridade de uma comandante e o colo mais gostoso do universo.',
                'Que a admiração que temos por você seja sua maior condecoração. Feliz Dia das Mães!',
                'Obrigado por ser nossa heroína de farda e de coração. Sua bravura e amor nos definem.'
            ]
        };
        dates[`${fathersDay.getMonth()}-${fathersDay.getDate()}`] = {
            type: 'commemorative',
            name: 'Dia dos Pais',
            summary: [
                'Homenagem ao pai que é herói em duas frentes: em casa para os filhos e nas ruas para a sociedade.',
                'Celebração do pai policial militar, cujo exemplo de coragem e honra molda o caráter dos filhos.',
                'Um dia para reconhecer o homem que veste a farda com dever e o papel de pai com um amor infinito.',
                'Data que honra o pai que, além de protetor da família, é um guardião da lei e da ordem.',
                'O pai PM: um pilar de disciplina, integridade e força que serve de guia para toda a vida.',
                'Homenagem ao pai que ensina sobre justiça e cidadania com a propriedade de quem as vive na prática.',
                'Celebração do homem cuja firmeza na profissão se transforma em porto seguro no lar.',
                'Um dia para valorizar o pai que enfrenta o perigo, pensando sempre em construir um futuro seguro para seus filhos.',
                'A figura paterna que, mesmo após um plantão exaustivo, encontra energia para ser pai e amigo.',
                'Data que celebra o sacrifício do pai que, por vezes, abre mão de momentos em família para cumprir sua missão.',
                'Reconhecimento do pai que é o primeiro exemplo de heroísmo para um filho.',
                'Celebração do homem que, por trás da farda, guarda um coração que bate mais forte pela família.',
                'Um dia dedicado ao pai que ensina que a maior autoridade é o respeito e o amor.',
                'Homenagem ao pai que compreende o valor da vida e da segurança mais do que ninguém.',
                'O pai policial: sua profissão é de risco, mas seu maior legado é de amor e proteção.',
                'Data para celebrar o pai que sabe a hora de ser comandante e a hora de ser o melhor amigo.',
                'Reconhecimento do pai cujo senso de dever para com a pátria se reflete na dedicação à família.',
                'Celebração do herói que não precisa de capa, pois sua farda já diz tudo.',
                'Um dia para o pai que, com seu exemplo, forma cidadãos de bem, justos e corajosos.',
                'Homenagem ao pai que carrega nos ombros a responsabilidade pela segurança de muitos e o amor por poucos.',
                'A figura paterna que mostra que a verdadeira força está no equilíbrio entre a razão e a emoção.',
                'Data que honra o pai que é a personificação da retidão e da integridade.',
                'Reconhecimento do pai que, ao voltar para casa, deixa o peso do mundo do lado de fora.',
                'Celebração do homem que é um livro de histórias reais sobre coragem, perdas e vitórias.',
                'Um dia para o pai que é o farol que guia a família, mesmo nas noites mais escuras de plantão.',
                'Homenagem ao pai que ensina que disciplina é uma forma de amor e cuidado.',
                'O pai PM: um exemplo de resiliência, que inspira os filhos a nunca desistirem.',
                'Data que celebra o homem cuja presença, mesmo que às vezes ausente, é sempre sentida.',
                'Reconhecimento do pai que sabe que sua maior e mais importante ocorrência é a sua família.',
                'Celebração do líder nato, que comanda com sabedoria no trabalho e em casa.',
                'Um dia para o pai que ensina sobre o valor da honra e da palavra empenhada.',
                'Homenagem ao pai que é a calma na tempestade, tanto para sua equipe quanto para seus filhos.',
                'A figura paterna que inspira um profundo sentimento de orgulho e segurança.',
                'Data para celebrar o pai que é a prova viva de que coragem é agir apesar do medo.',
                'Reconhecimento do pai que protege o sono dos cidadãos e depois lê uma história para o filho dormir.',
                'Celebração do homem que lida com o caos, mas encontra a paz no sorriso de um filho.',
                'Um dia para o pai que tem o olhar atento de um policial e o abraço acolhedor de um urso.',
                'Homenagem ao pai que faz de seu trabalho uma lição diária de civismo e dedicação.',
                'O pai policial militar é um mestre em ensinar sobre responsabilidade e consequências.',
                'Data que celebra o pai cujo maior orgulho não é o distintivo, mas sim os filhos que cria.',
                'Reconhecimento do pai que sabe que a ordem começa em casa, com amor e respeito.',
                'Celebração do homem que prometeu servir e proteger, e cumpre essa promessa em dobro.',
                'Um dia para o pai cujo legado será de coragem, honestidade e um amor que tudo supera.',
                'Homenagem ao pai que é a linha de frente contra o perigo e a retaguarda de amor da família.',
                'A figura paterna que mostra que ser forte não é não ter sentimentos, mas controlá-los.',
                'Data para celebrar o pai que é um estrategista na profissão e um sábio conselheiro na vida.',
                'Reconhecimento do homem por trás do herói, com suas lutas, sonhos e seu amor infinito.',
                'Celebração do pai que não apenas dá a vida, mas arrisca a sua pelos outros.',
                'Um dia para o pai que é o comandante da tropa mais importante de todas: a nossa família.',
                'Homenagem ao pai que é exemplo de força, não só física, mas principalmente de caráter.'
            ],
            motivation: [
                'Feliz Dia dos Pais para o nosso primeiro e maior herói. Sua coragem nos inspira todos os dias!',
                'Pai, sua farda representa honra, mas seu abraço representa nosso porto seguro. Amamos você!',
                'Para o melhor patrulheiro do mundo: o que patrulha nossos sonhos e guarda nosso coração. Parabéns!',
                'Sua força no trabalho nos orgulha, mas sua força como pai nos define. Feliz dia!',
                'Que a proteção que você dá à sociedade retorne em dobro para você. Nosso eterno obrigado, pai!',
                'Feliz dia para o homem que nos ensinou o verdadeiro significado de servir e proteger. Te amamos!',
                'Pai, seu maior distintivo de honra é o nosso amor e admiração por você. Parabéns!',
                'Desejamos que hoje sua única chamada seja para a mesa do almoço e para receber nosso carinho.',
                'Para o nosso comandante, um dia de paz, descanso merecido e muitas homenagens. Feliz Dia dos Pais!',
                'Obrigado, pai, por ser nosso exemplo de integridade, coragem e, acima de tudo, de amor.',
                'Que você esteja sempre seguro em suas rondas para que possamos estar seguros em seu amor.',
                'Feliz dia para o pai que enfrenta leões na rua e vira um ursinho em casa. Você é o melhor!',
                'Seu trabalho é um orgulho para a nação, mas você como pai é o orgulho da nossa vida.',
                'Pai, seu QRA pode ser um, mas para nós você será sempre "Herói". Parabéns!',
                'Hoje, a ordem é relaxar! Deixe que a gente cuide de você. Feliz Dia dos Pais!',
                'Para o homem que tem a bravura de um soldado e a ternura de um pai. Nossa admiração é infinita.',
                'Obrigado por cada sacrifício, por cada ausência que se tornou uma lição de dever. Te amamos.',
                'Feliz dia para o nosso eterno "Copom", sempre pronto para atender nossas chamadas de amor.',
                'Que sua vida seja sempre uma ocorrência com final feliz. Parabéns, paizão!',
                'Você é a prova de que um herói pode, sim, usar farda e contar histórias para dormir.',
                'Desejamos que sua folga seja tão boa quanto a sensação de dever cumprido. Aproveite seu dia!',
                'Pai, obrigado por ser a nossa maior segurança e inspiração. Feliz dia!',
                'Seu legado não está apenas em sua carreira, mas nos filhos que você criou. Parabéns!',
                'Que hoje você possa tirar as botas, relaxar e deixar que a gente cuide da sua proteção.',
                'Feliz dia para o pai que tem a visão de águia no trabalho e o coração de ouro em família.',
                'Obrigado por nos ensinar que a disciplina é o caminho para a liberdade. Te amamos, pai!',
                'Para o nosso sargento, capitão, major... Para o nosso PAI! Toda a nossa admiração.',
                'Que seu dia seja de paz, longe de qualquer perigo, e perto de quem mais te ama.',
                'Seu exemplo de retidão é o mapa que guia nossos passos. Obrigado, pai!',
                'Feliz dia para o homem que faz da honra sua lei e do amor, sua maior força.',
                'Pai, em QAP permanente no nosso coração. Obrigado por tudo!',
                'Desejamos que sua felicidade seja sempre prioridade em todas as ocorrências da vida.',
                'Para o pai que é firme como uma rocha e protetor como uma fortaleza. Parabéns!',
                'Obrigado por fazer do nosso lar o lugar mais seguro do mundo. Feliz Dia dos Pais!',
                'Que a sua coragem seja sempre recompensada com a nossa eterna gratidão e amor.',
                'Hoje, estamos todos em "sentido" para homenagear o melhor pai do mundo. Parabéns!',
                'Para o paizão que é TKS em tudo que faz. Obrigado por ser tão especial!',
                'Que a alegria de hoje seja sua melhor viatura para um dia incrível. Feliz dia!',
                'Pai, você é nosso herói. E heróis merecem um dia de muita paz e felicidade. Aproveite!',
                'Obrigado por nos mostrar que a maior bravura é ser um pai presente e amoroso.',
                'Que o seu dia seja 10-4, com tudo em perfeita ordem e muita alegria. Parabéns!',
                'Feliz dia para o nosso protetor, nosso amigo, nosso grande exemplo. Amamos você!',
                'Seu trabalho exige muito, mas seu amor por nós supera tudo. Obrigado, pai!',
                'Desejamos que a admiração que temos por você seja a sua maior medalha de mérito.',
                'Para o pai que tem a força de um batalhão, mas o abraço mais carinhoso de todos.',
                'Que hoje, sua única preocupação seja decidir qual o melhor pedaço do bolo. Parabéns!',
                'Pai, obrigado por ser o comandante da nossa felicidade. Sua tropa te ama!',
                'Você nos ensinou a sermos corajosos, mas seu amor nos ensinou a sermos humanos. Feliz dia!',
                'Que a paz que você garante para tantos esteja sempre presente em sua vida. Parabéns, pai!',
                'Para o mundo, um policial militar. Para nós, o mundo. Feliz Dia dos Pais!'
            ]
        };

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
        const isHoliday = specialDate && specialDate.type.includes('holiday');
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

        return `
            <div class="${cellClasses} animate-in">
                <div class="day-number-wrapper">
                    <span class="day-name">${dayName}</span>
                    <span class="day-number">${day}</span>
                    ${isToday ? '<span class="today-marker">Hoje</span>' : ''}
                    ${paymentIcon}
                </div>
                <div class="day-details">
                    <div class="schedule-entry" data-team="${dayTeam}"><i class="fas fa-sun animated-sun"></i><span>Dia: ${dayTeam}</span></div>
                    <div class="schedule-entry" data-team="${nightTeam}"><i class="fas fa-moon animated-moon"></i><span>Noite: ${nightTeam}</span></div>
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
            cells.push(createCellHTML(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i + 1), false, { count: -1 }, getSpecialDates(prevMonth.getFullYear())));
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
            cells.push(createCellHTML(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), false, { count: -1 }, getSpecialDates(nextMonth.getFullYear())));
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
            } else {
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

    // --- NOVO SISTEMA DE ANIMAÇÃO DE FOGOS DE ARTIFÍCIO ---

    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const ctx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let particles = [];
    let animationId = null;
    let launchIntervalId = null;

    function setupCanvas() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }

    // Classe para as partículas da explosão
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

    // Classe para o foguete que sobe
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
                particle.draw();
            }
        });
    }

    function stopFireworks() {
        if (launchIntervalId) {
            clearInterval(launchIntervalId); // Para de lançar novos foguetes
            launchIntervalId = null;
        }

        // Para a animação após um tempo para as partículas sumirem
        setTimeout(() => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            fireworksCanvas.style.display = 'none'; // Esconde o canvas
            fireworks = []; // Limpa os arrays para a próxima vez
            particles = [];
        }, 2000); // Espera 2s para as últimas partículas desaparecerem
    }

    function launchFireworks() {
        setupCanvas();
        fireworksCanvas.style.display = 'block';

        // Para a animação anterior se estiver rodando
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animate(); // Inicia o loop de desenho

        // Lança o primeiro foguete imediatamente
        fireworks.push(new Firework());

        // Define um intervalo para continuar lançando foguetes
        launchIntervalId = setInterval(() => {
            if (fireworks.length < 10) { // Limita a quantidade de foguetes na tela
                fireworks.push(new Firework());
            }
        }, 800); // Lança um novo foguete a cada 800ms
    }

    const init = () => {
        const startYear = new Date().getFullYear();
        const endYear = startYear + 2;
        elements.yearSelect.innerHTML = Array.from({ length: 3 }, (_, i) => startYear + i).map(y => `<option value="${y}">${y}</option>`).join('');
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

        document.querySelectorAll('.team-button').forEach(button => {
            button.setAttribute('aria-pressed', 'false');
        });

        renderCalendar();

        elements.prevMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        elements.nextMonthBtn.addEventListener("click", (e) => { e.preventDefault(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        elements.todayButton.addEventListener("click", () => { currentDate = new Date(); renderCalendar(); });
        elements.monthSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
        elements.yearSelect.addEventListener("change", () => { currentDate.setFullYear(elements.yearSelect.value, elements.monthSelect.value, 1); renderCalendar(); });
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
                    // Seleciona uma summary e uma motivation aleatoriamente
                    const randomSummary = dateInfo.summary[Math.floor(Math.random() * dateInfo.summary.length)];
                    const randomMotivation = dateInfo.motivation[Math.floor(Math.random() * dateInfo.motivation.length)];

                    // Abre o modal primeiro para que ele fique visível
                    openModal(dateInfo.name, randomSummary, randomMotivation);

                    // VERIFICA SE É ANO NOVO E DISPARA OS FOGOS APRIMORADOS
                    if (dateKey === '0-1') {
                        // Não precisa mais de atraso, a função gerencia o timing
                        launchFireworks();
                    }
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
            if (tooltipAnimationId) {
                cancelAnimationFrame(tooltipAnimationId);
                tooltipAnimationId = null;
            }
            hoveredIcon = null;
            elements.paymentTooltip.style.display = 'none';
        };

        elements.calendarBody.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                startTooltipAnimation(e.target);
            }
        });
        elements.calendarBody.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('payment-icon')) {
                stopTooltipAnimation();
            }
        });

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    };

    init();
});