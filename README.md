# Escala de Serviço - COPOM

Sistema estático, moderno e responsivo para consulta da escala operacional das equipes do COPOM — Centro de Operações da Polícia Militar.

O projeto foi reestruturado do zero utilizando **HTML, CSS e JavaScript puro**, sem frameworks, sem dependências pesadas e sem gambiarras. A arquitetura foi separada em múltiplos arquivos para facilitar manutenção, leitura, evolução e publicação em hospedagens estáticas como GitHub Pages.

---

## Objetivo

Fornecer um painel operacional simples, rápido e confiável para consulta da escala de serviço das equipes, preservando integralmente:

* sequência exata das equipes;
* plantões diurnos;
* plantões noturnos;
* feriados nacionais, estaduais e municipais;
* datas comemorativas;
* destaque visual por equipe;
* resumo mensal;
* tema claro e escuro;
* marcação do dia atual;
* indicação do quinto dia útil;
* modal informativo das datas especiais.

---

## Tecnologias utilizadas

* HTML5 semântico;
* CSS3 moderno;
* JavaScript puro;
* Font Awesome para ícones;
* Google Fonts;
* LocalStorage para persistência de preferências;
* GitHub Pages ou qualquer hospedagem estática.

---

## Estrutura do projeto

```txt
copom-escala-refatorado/
├── index.html
├── README.md
├── assets/
│   └── copom-calendar.svg
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── config.js
    ├── date-utils.js
    ├── fireworks.js
    ├── schedule-service.js
    └── special-dates.js
```

---

## Arquivos principais

### `index.html`

Arquivo principal da aplicação.

Responsável pela estrutura semântica da página, carregamento dos estilos, scripts, modal, cabeçalho, painel de equipes, calendário, legenda e resumo mensal.

### `css/styles.css`

Arquivo central de estilos.

Contém:

* design responsivo;
* tema claro;
* tema escuro;
* layout institucional;
* estilos do calendário;
* estilos dos botões das equipes;
* modal;
* legenda;
* estatísticas;
* acessibilidade visual;
* ajustes para mobile.

### `js/config.js`

Arquivo de configuração global.

Contém constantes da aplicação, como:

* nomes dos meses;
* dias da semana;
* cores das equipes;
* sequência da escala;
* data-base;
* tipos de datas especiais;
* intervalo de anos disponíveis.

### `js/date-utils.js`

Arquivo utilitário para manipulação de datas.

Responsável por funções auxiliares, como:

* normalizar datas;
* comparar datas;
* formatar datas;
* calcular diferença entre dias;
* obter informações do mês.

### `js/special-dates.js`

Arquivo responsável pelos feriados e datas comemorativas.

Contém:

* feriados fixos;
* datas comemorativas fixas;
* cálculo de feriados móveis;
* cálculo da Páscoa;
* Carnaval;
* Sexta-feira Santa;
* Corpus Christi;
* Dia das Mães;
* Dia dos Pais.

### `js/schedule-service.js`

Arquivo responsável pela regra da escala.

Contém a lógica que calcula, para qualquer data:

* equipe do plantão diurno;
* equipe do plantão noturno;
* quinto dia útil;
* contagem mensal de plantões por equipe.

### `js/fireworks.js`

Arquivo responsável pela animação de fogos de artifício.

A animação é utilizada apenas no modal da data de Ano Novo.

### `js/app.js`

Arquivo principal da aplicação.

Responsável por:

* inicializar a interface;
* renderizar o calendário;
* renderizar os botões das equipes;
* renderizar estatísticas;
* controlar tema claro/escuro;
* abrir e fechar modal;
* controlar destaque de equipes;
* persistir preferências no navegador;
* tratar eventos de clique e teclado.

---

## Funcionalidades preservadas

A refatoração manteve as funcionalidades essenciais do projeto original.

### Escala das equipes

A escala continua baseada na mesma data-base:

```txt
01/01/2025
```

Sequência do plantão diurno:

```txt
A, B, A, E, B
```

Sequência do plantão noturno:

```txt
E, C, D, C, D
```

Essa regra é cíclica e permite calcular corretamente as equipes em qualquer data futura ou passada dentro do intervalo configurado.

---

## Feriados e datas especiais

O sistema mantém suporte a:

* feriados nacionais;
* feriados estaduais;
* feriados municipais;
* datas comemorativas;
* pontos facultativos;
* datas móveis calculadas dinamicamente.

Tipos de datas especiais:

```txt
national-holiday
state-holiday
municipal-holiday
commemorative
```

Cada data pode conter:

* nome;
* tipo;
* resumo;
* mensagem motivacional.

Essas informações são exibidas no modal ao clicar na data especial.

---

## Quinto dia útil

O sistema identifica o quinto dia útil do mês.

A contagem considera como não úteis:

* sábados;
* domingos;
* feriados nacionais;
* feriados estaduais;
* feriados municipais.

Datas comemorativas não bloqueiam a contagem, salvo se forem configuradas futuramente como feriado real.

---

## Tema claro e escuro

O projeto possui tema claro e tema escuro.

A preferência do usuário é salva no navegador usando `localStorage`.

Chave utilizada:

```txt
copom-scale-theme
```

Valores possíveis:

```txt
light
dark
```

---

## Destaque por equipe

O usuário pode selecionar uma ou mais equipes para destacar visualmente no calendário.

A seleção também é persistida no navegador.

Chave utilizada:

```txt
copom-highlighted-teams
```

---

## Responsividade

O layout foi pensado para funcionar corretamente em:

* desktop;
* notebook;
* tablet;
* celular.

No desktop, o calendário mantém formato de grade mensal.

No mobile, a interface é adaptada para melhor leitura e navegação por cards de dias.

---

## Acessibilidade

O projeto inclui melhorias de acessibilidade, como:

* HTML semântico;
* botões reais para navegação;
* `aria-label` em controles importantes;
* `aria-live` para atualizações dinâmicas;
* modal com `role="dialog"`;
* modal com `aria-modal="true"`;
* fechamento do modal com tecla `Escape`;
* link de pular direto para o calendário;
* foco visual com `:focus-visible`;
* suporte a usuários com redução de movimento ativada.

---

## Publicação

Como o projeto é totalmente estático, basta publicar os arquivos em qualquer hospedagem que sirva HTML, CSS e JavaScript.

Exemplos:

* GitHub Pages;
* Netlify;
* Vercel;
* Cloudflare Pages;
* hospedagem tradicional;
* servidor interno.

---

## Publicação no GitHub Pages

Para publicar no GitHub Pages:

1. Envie todos os arquivos para o repositório.
2. Acesse as configurações do repositório.
3. Vá em `Pages`.
4. Selecione a branch desejada.
5. Selecione a pasta raiz.
6. Salve.
7. Aguarde a URL pública ser gerada.

---

## Como executar localmente

Por ser um projeto estático, é possível abrir o `index.html` diretamente no navegador.

Porém, para evitar problemas com carregamento de arquivos locais, recomenda-se usar um servidor local simples.

Com Python:

```bash
python -m http.server 8000
```

Depois acesse:

```txt
http://localhost:8000
```

---

## Boas práticas aplicadas

A refatoração foi feita seguindo princípios de qualidade:

* separação de responsabilidades;
* código modular;
* ausência de gambiarras;
* nomes claros;
* HTML semântico;
* CSS organizado;
* JavaScript sem dependência de framework;
* lógica de escala isolada;
* dados de feriados isolados;
* renderização dinâmica controlada;
* persistência local segura;
* interface responsiva;
* foco em manutenção futura.

---

## Itens removidos da versão anterior

O contador externo de visitas foi removido.

Motivo:

* não faz parte da funcionalidade operacional da escala;
* carrega recurso de terceiro;
* prejudica aparência institucional;
* pode impactar privacidade;
* não agrega valor funcional ao painel.

Caso seja necessário registrar acessos futuramente, o ideal é implementar uma solução própria ou utilizar métricas do ambiente de hospedagem.

---

## Cuidados importantes

Não altere a sequência da escala sem validar o impacto operacional.

Os arquivos mais sensíveis são:

```txt
js/config.js
js/schedule-service.js
js/special-dates.js
```

Alterações nesses arquivos podem impactar diretamente:

* equipe exibida por dia;
* plantão diurno;
* plantão noturno;
* feriados;
* quinto dia útil;
* estatísticas mensais.

---

## Próximas melhorias possíveis

Melhorias futuras recomendadas:

* exportação da escala em PDF;
* botão de impressão;
* exportação para calendário `.ics`;
* modo painel/TV;
* busca por equipe;
* filtro para exibir somente uma equipe;
* histórico de alterações;
* tela administrativa para editar feriados;
* cadastro visual de exceções na escala;
* integração futura com backend, se necessário.

---

## Status

Projeto refatorado e pronto para publicação estática.

Funcionalidades originais preservadas.

Arquitetura preparada para evolução futura.
