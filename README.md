# Escala de Serviço - COPOM SP

Sistema estático, moderno e responsivo para consulta da escala operacional das equipes do **COPOM SP — Centro de Operações da Polícia Militar**.

O projeto foi reorganizado com foco em simplicidade, confiabilidade e manutenção, utilizando **HTML5, Bootstrap 5, CSS próprio apenas quando necessário e JavaScript puro**, sem backend e sem dependência de framework JavaScript.

A aplicação pode ser publicada diretamente em serviços de hospedagem estática, como GitHub Pages.

---

## Objetivo

Disponibilizar um painel operacional simples, rápido e confiável para consulta da escala de serviço das equipes do COPOM, preservando integralmente:

- sequência oficial das equipes;
- plantões diurnos;
- plantões noturnos;
- navegação entre meses e anos;
- feriados nacionais, estaduais e municipais;
- datas comemorativas;
- datas móveis;
- destaque visual de uma ou mais equipes;
- contagem mensal de plantões por equipe;
- marcação do dia atual;
- identificação do quinto dia útil;
- indicação visual do dia de pagamento;
- modal informativo para datas especiais;
- animação especial de Ano Novo;
- tema claro e escuro;
- persistência das preferências no navegador;
- responsividade para desktop, notebook, tablet e celular.

---

## Tecnologias utilizadas

- HTML5 semântico;
- Bootstrap 5.3.3;
- CSS3;
- JavaScript puro;
- Font Awesome 6;
- Google Fonts — Inter;
- LocalStorage;
- GitHub Pages ou qualquer outra hospedagem estática.

O Bootstrap é utilizado principalmente para componentes e comportamentos já consolidados, como:

- botões;
- formulários;
- modal;
- tooltip;
- utilitários de layout;
- responsividade;
- integração com tema claro/escuro.

O CSS próprio permanece responsável apenas pelos elementos específicos da identidade e funcionamento visual do calendário.

---

## Estrutura do projeto

```txt
copom-escala/
├── index.html
├── README.md
│
├── assets/
│   └── calendario-ico.png
│
├── css/
│   └── styles.css
│
└── js/
    ├── app.js
    ├── config.js
    ├── date-utils.js
    ├── fireworks.js
    ├── schedule-service.js
    └── special-dates.js
```

> O arquivo legado `specialDates.js` não faz mais parte da arquitetura atual. A única fonte de datas especiais deve ser `js/special-dates.js`.

---

# Arquitetura

A aplicação foi dividida em módulos com responsabilidades bem definidas.

```txt
config.js
   ↓
date-utils.js
   ↓
special-dates.js
   ↓
schedule-service.js
   ↓
app.js

fireworks.js
   ↓
app.js
```

A regra operacional da escala não deve ser implementada diretamente na interface.

O `app.js` deve consumir as informações produzidas pelo `schedule-service.js`.

---

## `index.html`

Arquivo principal da aplicação.

Responsável por:

- estrutura semântica da página;
- carregamento do Bootstrap;
- carregamento do Font Awesome;
- carregamento da fonte Inter;
- carregamento do CSS da aplicação;
- carregamento dos módulos JavaScript;
- cabeçalho;
- botão de alternância de tema;
- área de destaque das equipes;
- navegação entre meses;
- seleção de mês e ano;
- estrutura do calendário;
- legenda;
- modal de datas especiais;
- canvas utilizado nos fogos de Ano Novo;
- rodapé.

Não contém regra operacional da escala.

---

## `css/styles.css`

Arquivo responsável pelos estilos específicos da aplicação.

Contém principalmente:

- identidade visual;
- variáveis dos temas;
- tema claro;
- tema escuro;
- calendário mensal;
- células do calendário;
- indicação do dia atual;
- estilos das equipes;
- destaque das equipes;
- datas especiais;
- legenda;
- modal;
- animações;
- adaptações para tablet e celular;
- suporte a `prefers-reduced-motion`.

Sempre que Bootstrap resolver adequadamente um problema de layout ou interface, deve-se preferir Bootstrap em vez de duplicar a mesma responsabilidade em CSS próprio.

---

## `js/config.js`

Arquivo central de configuração.

Contém:

- ano mínimo disponível;
- quantidade de anos futuros disponíveis;
- nomes dos meses;
- nomes dos dias da semana;
- equipes existentes;
- cores das equipes;
- data-base da escala;
- sequência do plantão diurno;
- sequência do plantão noturno;
- tipos de datas especiais;
- chaves utilizadas no LocalStorage.

A configuração é congelada para evitar alterações acidentais durante a execução.

---

## `js/date-utils.js`

Módulo responsável pelas operações genéricas relacionadas a datas.

Entre suas responsabilidades estão:

- criação segura de datas;
- normalização para início do dia;
- comparação entre datas;
- cálculo da diferença de dias;
- identificação de finais de semana;
- geração de chaves de data;
- formatação de datas;
- obtenção da quantidade de dias do mês;
- operações de adição de dias e meses;
- cálculo do segundo domingo do mês;
- cálculo da Páscoa.

O cálculo da diferença entre dias utiliza componentes UTC para evitar erros relacionados a horário de verão e diferenças de timezone.

---

## `js/special-dates.js`

Repositório oficial das datas especiais utilizadas pela aplicação.

Contém:

- feriados nacionais;
- feriados estaduais;
- feriados municipais;
- datas comemorativas;
- datas móveis;
- validação dos registros;
- cache por ano.

Também calcula dinamicamente datas como:

- Carnaval;
- Quarta-feira de Cinzas;
- Sexta-feira Santa;
- Corpus Christi;
- Dia das Mães;
- Dia dos Pais.

Os registros possuem:

```txt
type
name
summary
motivation
```

Os tipos atualmente suportados são:

```txt
national-holiday
state-holiday
municipal-holiday
commemorative
```

---

## `js/schedule-service.js`

É a **fonte central da regra operacional da escala**.

Esse arquivo não deve conter código de interface.

É responsável por:

- calcular a equipe do plantão diurno;
- calcular a equipe do plantão noturno;
- consultar datas especiais;
- identificar feriados reais;
- identificar dias úteis;
- calcular o quinto dia útil;
- gerar a escala completa de um mês;
- calcular dados mensais da escala.

A interface deve consumir esses resultados em vez de duplicar as regras dentro do `app.js`.

---

## `js/fireworks.js`

Responsável exclusivamente pela animação de fogos utilizada no Ano Novo.

O módulo:

- utiliza Canvas;
- controla partículas;
- controla fogos;
- gerencia `requestAnimationFrame`;
- limpa timers e eventos corretamente;
- responde a redimensionamentos da tela;
- respeita `prefers-reduced-motion`.

A animação é executada apenas quando o modal referente ao **Ano Novo** é aberto.

---

## `js/app.js`

Camada responsável pela interface da aplicação.

Suas principais responsabilidades são:

- inicializar os elementos da página;
- inicializar componentes Bootstrap;
- carregar a preferência de tema;
- renderizar os botões das equipes;
- preencher os seletores de mês e ano;
- renderizar o calendário;
- atualizar os contadores de plantões;
- controlar os destaques das equipes;
- persistir equipes selecionadas;
- alternar entre tema claro e escuro;
- abrir o modal de datas especiais;
- inicializar os tooltips;
- coordenar a animação de Ano Novo;
- tratar eventos da interface.

O `app.js` não deve recriar regras operacionais que já existam no `schedule-service.js`.

---

# Regra da escala

A escala utiliza como data-base:

```txt
01/01/2025
```

## Plantão diurno

Sequência:

```txt
A → B → A → E → B
```

## Plantão noturno

Sequência:

```txt
E → C → D → C → D
```

As duas sequências são cíclicas.

O cálculo utiliza a diferença em dias entre a data consultada e a data-base.

Por isso, alterações na data-base ou nas sequências podem modificar toda a escala futura e passada.

---

# Regressão conhecida

Algumas datas podem ser utilizadas para verificar rapidamente se a sequência continua correta.

Para agosto de 2026:

```txt
01/08/2026 → Dia A / Noite D
02/08/2026 → Dia E / Noite C
03/08/2026 → Dia B / Noite D
04/08/2026 → Dia A / Noite E
05/08/2026 → Dia B / Noite C
06/08/2026 → Dia A / Noite D
07/08/2026 → Dia E / Noite C
08/08/2026 → Dia B / Noite D
09/08/2026 → Dia A / Noite E
10/08/2026 → Dia B / Noite C
11/08/2026 → Dia A / Noite D
12/08/2026 → Dia E / Noite C
13/08/2026 → Dia B / Noite D
14/08/2026 → Dia A / Noite E
```

Esses valores são úteis como teste de regressão após qualquer alteração relacionada à lógica da escala.

---

# Contagem mensal de plantões

Cada dia possui dois plantões:

```txt
1 plantão diurno
1 plantão noturno
```

Os botões das equipes exibem a quantidade de plantões daquela equipe no mês atualmente selecionado.

Exemplo:

```txt
Equipe A — 13 plantões
Equipe B — 12 plantões
```

Esses valores são calculados dinamicamente.

Eles não devem ser inseridos manualmente no HTML.

---

# Quinto dia útil

O sistema identifica dinamicamente o quinto dia útil de cada mês.

São considerados não úteis:

- sábado;
- domingo;
- feriado nacional;
- feriado estadual;
- feriado municipal.

Datas classificadas apenas como comemorativas não interrompem a contagem.

Quando o quinto dia útil é encontrado, a interface exibe o indicador de:

```txt
Dia de Pagamento
```

O ícone utiliza Tooltip do Bootstrap para fornecer informação adicional ao usuário.

---

# Feriados e datas especiais

As datas especiais podem ser fixas ou calculadas dinamicamente.

O sistema diferencia:

### Feriado Nacional

```txt
national-holiday
```

### Feriado Estadual

```txt
state-holiday
```

### Feriado Municipal

```txt
municipal-holiday
```

### Data Comemorativa

```txt
commemorative
```

Feriados reais interferem no cálculo de dias úteis.

Datas comemorativas são informativas e não alteram automaticamente o cálculo do quinto dia útil.

---

# Modal de datas especiais

Ao selecionar uma data especial, é aberto um **Bootstrap Modal**.

O modal apresenta:

- classificação da data;
- nome;
- resumo;
- mensagem;
- botão de fechamento.

O Bootstrap é responsável por:

- backdrop;
- tecla `Escape`;
- gerenciamento de foco;
- acessibilidade básica do modal;
- fechamento pelo botão apropriado.

No caso específico do Ano Novo, o modal também aciona a animação de fogos.

---

# Tema claro e escuro

A aplicação possui:

```txt
dark
light
```

O **modo escuro é o padrão da aplicação**.

No cabeçalho existe apenas um botão de alternância.

Quando a interface está em modo escuro, o botão oferece a mudança para modo claro.

Quando a interface está em modo claro, o botão oferece a mudança para modo escuro.

Não existe mais um painel separado de Configurações apenas para alterar a aparência.

A preferência selecionada é persistida no navegador utilizando:

```txt
copom-scale-theme
```

Se nenhuma preferência tiver sido armazenada anteriormente, a aplicação inicia em:

```txt
dark
```

Depois que o usuário escolhe um tema, essa escolha é mantida nas próximas visitas.

O tema também é sincronizado com:

```html
data-bs-theme
```

para que os componentes Bootstrap acompanhem corretamente a aparência selecionada.

---

# Destaque das equipes

O usuário pode selecionar uma ou várias equipes simultaneamente.

Exemplo:

```txt
Equipe A
Equipe B
```

As ocorrências dessas equipes são destacadas diretamente no calendário.

A seleção permanece ao:

- mudar de mês;
- mudar de ano;
- atualizar a página.

A preferência é salva utilizando:

```txt
copom-highlighted-teams
```

---

# Responsividade

A aplicação possui comportamentos diferentes conforme o espaço disponível.

## Desktop

O calendário utiliza grade mensal de sete colunas:

```txt
Dom Seg Ter Qua Qui Sex Sáb
```

As cinco equipes são exibidas na mesma linha quando existe espaço suficiente.

## Telas reduzidas

Quando a janela do navegador é reduzida, inclusive em computadores, os botões das equipes deixam de depender de rolagem horizontal.

Eles são reorganizados em um grid de duas colunas.

Exemplo:

```txt
Equipe A    Equipe B
Equipe C    Equipe D
Equipe E
```

Assim todas as equipes permanecem visíveis e acessíveis.

## Mobile

Em telas menores, o calendário deixa de tentar comprimir sete colunas.

Cada dia passa a ser apresentado em formato vertical, priorizando:

```txt
DIA DA SEMANA
NÚMERO

Dia    Equipe
Noite  Equipe
```

Datas especiais permanecem visíveis logo abaixo das informações do plantão.

Essa adaptação melhora significativamente a leitura em celulares e janelas reduzidas.

---

# Dia atual

Quando o mês atual está sendo exibido, o dia corrente recebe destaque visual próprio.

A identificação utiliza:

```html
aria-current="date"
```

e também uma indicação textual:

```txt
Hoje
```

Essa indicação é independente dos destaques das equipes.

---

# Navegação

O usuário pode navegar utilizando:

- mês anterior;
- próximo mês;
- botão `Hoje`;
- seletor de mês;
- seletor de ano.

Os limites disponíveis são definidos em:

```js
config.minYear;
config.yearRangeAhead;
```

Os botões anterior e próximo são desabilitados automaticamente quando o usuário alcança o limite configurado.

---

# Persistência local

O projeto utiliza `localStorage` apenas para preferências da interface.

## Tema

```txt
copom-scale-theme
```

## Equipes destacadas

```txt
copom-highlighted-teams
```

Nenhum dado pessoal ou sensível é armazenado pela aplicação.

Caso o navegador bloqueie `localStorage`, a aplicação continua funcionando, apenas sem persistência entre sessões.

---

# Acessibilidade

A aplicação inclui recursos de acessibilidade como:

- HTML semântico;
- link para pular diretamente ao calendário;
- botões reais para ações;
- `aria-label`;
- `aria-pressed`;
- `aria-current`;
- `aria-live`;
- títulos acessíveis para navegação;
- suporte à navegação por teclado;
- Bootstrap Modal com gerenciamento de foco;
- Tooltip acessível por foco;
- foco visual utilizando `:focus-visible`;
- suporte a `prefers-reduced-motion`.

Quando o usuário solicita redução de movimento, animações são minimizadas e os fogos não são executados.

---

# Dependências externas

Atualmente a aplicação utiliza recursos externos para:

- Bootstrap 5;
- Font Awesome;
- Google Fonts;
- contador de visitas exibido no rodapé.

Como o sistema é estático, essas dependências são carregadas diretamente pelo navegador.

Caso o sistema seja futuramente utilizado em ambiente interno com restrições de acesso à internet, recomenda-se hospedar localmente os recursos necessários.

---

# Contador de visitas

A versão atual ainda utiliza um contador externo no rodapé.

Esse recurso **não participa da regra operacional da escala**.

Caso requisitos de privacidade, disponibilidade ou ambiente interno sejam mais rigorosos, recomenda-se removê-lo ou substituí-lo por uma solução controlada pela própria infraestrutura.

Não se deve utilizar o contador como dependência funcional da aplicação.

---

# Como executar localmente

Embora alguns navegadores consigam abrir diretamente o `index.html`, recomenda-se utilizar um pequeno servidor HTTP local.

Com Python:

```bash
python -m http.server 8000
```

Depois acesse:

```txt
http://localhost:8000
```

---

# Publicação

O projeto não depende de backend.

Pode ser publicado em:

- GitHub Pages;
- Cloudflare Pages;
- Netlify;
- Vercel;
- servidor Apache;
- Nginx;
- servidor HTTP interno;
- qualquer hospedagem capaz de servir arquivos estáticos.

---

# GitHub Pages

Para publicação no GitHub Pages:

1. Envie os arquivos para o repositório.
2. Abra `Settings`.
3. Acesse `Pages`.
4. Em `Build and deployment`, escolha a origem desejada.
5. Se utilizar publicação pela branch, escolha a branch correspondente.
6. Selecione a pasta raiz quando aplicável.
7. Salve.
8. Aguarde o GitHub disponibilizar a URL.

Como os caminhos utilizados pela aplicação são relativos:

```txt
./css/styles.css
./js/app.js
./assets/calendario-ico.png
```

a aplicação é compatível com publicação em subdiretórios do GitHub Pages.

---

# Cuidados importantes

## Não alterar a sequência sem validação

Os arquivos mais sensíveis são:

```txt
js/config.js
js/schedule-service.js
js/special-dates.js
```

Alterações nesses arquivos podem modificar diretamente:

- equipe do plantão diurno;
- equipe do plantão noturno;
- sequência histórica da escala;
- quinto dia útil;
- datas especiais;
- feriados;
- indicação de pagamento.

---

## Não duplicar regra operacional no `app.js`

O `app.js` é a camada de interface.

Regras como:

```txt
qual equipe trabalha hoje?
qual é o quinto dia útil?
esta data é feriado?
qual é a escala completa do mês?
```

devem permanecer no:

```txt
js/schedule-service.js
```

---

## Não manter duas fontes de datas especiais

Deve existir somente:

```txt
js/special-dates.js
```

Arquivos antigos como:

```txt
specialDates.js
```

não devem permanecer no projeto.

Isso evita divergências entre duas listas diferentes de feriados.

---

# Testes recomendados

Após alterações relevantes, valide pelo menos:

### Navegação

- mês anterior;
- próximo mês;
- Hoje;
- seleção manual de mês;
- seleção manual de ano;
- limite mínimo de ano;
- limite máximo de ano.

### Escala

Compare datas conhecidas da regressão de agosto de 2026.

### Equipes

- selecionar uma equipe;
- selecionar múltiplas equipes;
- remover seleção;
- trocar de mês com equipe selecionada;
- recarregar a página.

### Tema

- iniciar sem preferência salva;
- confirmar que Dark é o padrão;
- alternar para Light;
- recarregar;
- confirmar persistência;
- alternar novamente para Dark.

### Datas especiais

- abrir modal;
- fechar pelo botão;
- fechar com `Escape`;
- conferir feriado nacional;
- conferir feriado estadual;
- conferir feriado municipal;
- conferir data comemorativa.

### Dia de pagamento

- confirmar o quinto dia útil;
- validar mês iniciado em final de semana;
- validar mês com feriado nos primeiros dias;
- testar tooltip com mouse;
- testar tooltip por teclado.

### Responsividade

Testar pelo menos:

```txt
1920 px
1366 px
1024 px
768 px
500 px
390 px
320 px
```

Também teste redimensionando manualmente uma janela desktop, pois esse é um cenário real de utilização do sistema.

---

# Boas práticas adotadas

O projeto procura manter:

- separação de responsabilidades;
- código modular;
- configuração centralizada;
- regra operacional isolada;
- HTML semântico;
- Bootstrap utilizado quando apropriado;
- CSS próprio apenas quando necessário;
- JavaScript puro e modular por responsabilidade;
- ausência de lógica duplicada;
- ausência de valores operacionais hardcoded na interface;
- persistência defensiva;
- tratamento de datas consistente;
- interface responsiva;
- acessibilidade;
- suporte a redução de movimento;
- facilidade de publicação estática.

---

# Melhorias futuras possíveis

Melhorias que podem ser avaliadas futuramente:

- impressão otimizada da escala;
- exportação em PDF;
- exportação `.ics`;
- modo painel/TV;
- compartilhamento direto de determinado mês;
- testes automatizados para a sequência da escala;
- testes automatizados das datas especiais;
- testes automatizados do quinto dia útil;
- suporte a exceções operacionais controladas;
- versionamento das alterações da escala;
- funcionamento totalmente offline;
- instalação como PWA;
- substituição das dependências CDN por arquivos locais;
- remoção ou substituição do contador externo;
- backend administrativo, apenas se houver necessidade real.

---

# Status

**Projeto estático, responsivo e preparado para publicação.**

Estado atual:

```txt
✓ escala diurna preservada
✓ escala noturna preservada
✓ regra centralizada no schedule-service
✓ datas especiais isoladas
✓ quinto dia útil calculado dinamicamente
✓ destaque múltiplo de equipes
✓ contagem mensal de plantões
✓ persistência das equipes
✓ modo Dark como padrão
✓ alternância direta Dark / Light
✓ persistência do tema
✓ Bootstrap Modal
✓ Bootstrap Tooltip
✓ calendário desktop
✓ calendário mobile
✓ grid responsivo das equipes
✓ acessibilidade básica
✓ suporte a redução de movimento
✓ compatível com hospedagem estática
```

A prioridade em futuras alterações deve ser **preservar a lógica operacional antes de qualquer mudança visual**.
