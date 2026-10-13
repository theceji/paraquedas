# Roadmap — Paraquedas do Trader Indisciplinado

> Estrutura atual: site em `../public/`, documentação nesta pasta, imagens de apoio em `../referencias/` e versões anteriores em `../arquivo/versoes/`. Os caminhos de fontes nos registros abaixo são relativos ao site; nomes antigos de pastas permanecem como registro histórico. Publique somente o conteúdo de `public/`.

> Estado atual (07/10/2026): entrada preservada; Gerenciamento unificado com orçamento obrigatório, contratos, diário e cartão. Paraquedas redireciona. Consulte GUIA.md; as seções antigas são histórico, e a seção final registra a implementação vigente.

> Nome anterior: "Paraquedas do CDI" (renomeado pelo autor em 06/10/2026).

> Documento autoexplicativo. Qualquer pessoa (ou IA) deve conseguir entender o projeto do zero lendo apenas este arquivo.
> Histórico de alterações: `HISTORICO.md`. Dados e premissas numéricas: `dados.md`.

## 1. O que é

Material educativo para iniciantes em day trade (B3, minicontrato de índice WIN) que explica um plano de gestão de risco chamado **Paraquedas do Trader Indisciplinado**:

- O patrimônio fica aplicado em renda fixa atrelada ao CDI (ex.: CDB 100% CDI, liquidez diária).
- Só o **rendimento líquido do mês** vira o **orçamento de risco** (o máximo que se pode perder no mês).
- O orçamento é dividido em **stops diários**. Se perder todos os dias, o patrimônio fica no zero a zero.

Autor da ideia: GabMon (trader, Belo Horizonte). Público-alvo do material: **iniciantes em geral**, linguagem leiga.

## 2. Regras do plano (definições confirmadas pelo autor)

| # | Regra | Origem |
|---|---|---|
| R1 | Orçamento mensal = rendimento líquido do CDI (+ complemento opcional do bolso) | Autor |
| R2 | Capital pequeno: complementar o rendimento (ex.: R$ 450 + R$ 550 = R$ 1.000) | Autor |
| R3 | Sem patrimônio: definir um valor fixo mensal para risco (ex.: R$ 1.000) e diluir em stops diários | Autor |
| R4 | Stop diário ideal: R$ 100 a R$ 200. Dias = orçamento ÷ stop (ex.: R$ 450 → 3 dias de R$ 150) | Autor |
| R5 | Máximo de 20 dias por mês; acima disso o stop diário sobe (orçamento ÷ 20) | Claude (proposta aceita) |
| R6 | Mês positivo: **50% do lucro** reforça o orçamento do mês seguinte, 50% vai para o patrimônio | Autor escolheu 50% |
| R7 | Mês negativo: a perda consome primeiro a base (rendimento → complemento), depois o reforço | Claude (modelo da simulação) |
| R8 | Desalavancagem: nocional de 1 WIN (pontos × R$ 0,20) ÷ capital de risco; cai conforme o capital cresce | Autor confirmou a métrica |
| R9 | O complemento do bolso **não tem paraquedas** e deve aparecer com cor própria (laranja/âmbar) | Claude (aceito) |
| R10 | Simulação de 12 meses é hipotética e realista (7 positivos, 5 negativos), com selo "não é promessa de retorno" | Claude (aceito) |
| R11 | Regras de ouro: bateu o stop desliga; stop não acumula; nunca dobrar para recuperar; anotar cada trade | Claude |

## 3. Premissas de mercado (atualizar quando mudarem)

- Selic 13,75% a.a. (Copom de 16/09/2026); CDI ≈ 13,65% a.a. → ≈ 1,07% bruto ao mês. Próximo Copom: 04/11/2026.
- IR do CDB: tabela regressiva 22,5% → 15% (após 720 dias).
- Ibovespa futuro ≈ 190 mil pontos (set/2026) → nocional de 1 WIN ≈ R$ 38 mil.

## 4. Entregas (o autor pediu as 3 para decidir qual usar)

| Entrega | Formato | Onde |
|---|---|---|
| Carrossel | 8 telas 1080×1350 (Instagram 4:5), canvas de design editável | Artifact "Paraquedas do Trader Indisciplinado — Carrossel" |
| Infográfico | 1 imagem vertical 1080×4700, canvas de design editável | Artifact "Paraquedas do Trader Indisciplinado — Infográfico" |
| Página interativa | HTML único com calculadora e simulação | `pagina-interativa.html`, publicado como Artifact |

Identidade visual (comum às três): fundo azul-céu claro, tinta azul-marinho, verde = rendimento/protegido, âmbar = complemento do bolso, vermelho = perdas. Fontes Archivo (títulos) e Figtree (texto).

## 5. Página interativa — especificação

- Entradas: patrimônio, CDI % a.a., IR do CDB, complemento do bolso, stop diário, pontos do índice, % do lucro reinvestido.
- Saídas: rendimento líquido, orçamento, dias de operação (grade de 20 pregões), pontos de WIN por stop, alavancagem.
- Simulação de 12 meses com sequência fixa de resultados (% do orçamento): +40, −60, +80, −30, +50, −100, +60, +50, −40, +90, −30, +70.
- Sem armazenamento, sem rede; tudo calculado no navegador. Tema claro/escuro.

## 6. Hospedagem (definida e implementada em 06/10/2026)

Pasta `site/` pronta para a raiz do repositório:
`index.html` (Paraquedas), `gerenciamento.html`, `assets/style.css` (tokens e componentes compartilhados, tema claro/escuro), `assets/paraquedas.js`, `assets/gerenciamento.js` (expõe `window.__gerenciamentoCalcular` para testes), `assets/favicon.svg`, `assets/og-cover.png` (1200×630), `.nojekyll`, `README.md` (passo a passo de publicação).
Pendente do autor: trocar `SEU-USUARIO.github.io/SEU-REPOSITORIO` nas tags Open Graph das duas páginas.
Verificado: cálculos do Gerenciamento batem com a planilha (contratos WIN/WDO, saldos, % da meta); páginas sem rolagem lateral a 390px.

- Destino: GitHub Pages, endereço padrão `usuario.github.io/repositorio`.
- Envio: Claude entrega os arquivos; o autor cria o repositório e faz o upload/push.
- Prévia de link: tags Open Graph + imagem de capa 1200×630.
- Conteúdo do site: **em aberto**. O autor vai pedir uma nova modularização antes; não iniciar o site até lá.
- Requisito técnico: a página interativa precisa virar `index.html` completo (doctype, `lang="pt-BR"`, meta viewport), pois hoje depende da moldura do Artifact.

## 7. Módulo "Gerenciamento" (definido em 06/10/2026, ainda não iniciado)

Origem: planilha "Planilha de Gerenciamento - Borba Gold.xlsx" enviada pelo autor. Ela tem 12 abas mensais idênticas (Janeiro…Dezembro), mais "Inicio" (imagem de capa) e "Regras" (instruções). No site vira **uma única folha de simulação**, sem meses, sem acumulação e sem persistência (recarregou, volta ao exemplo).

Decisões do autor:
- Layout **horizontal**, diferente da página Paraquedas (que continua em coluna única de 980px). Página larga até 1360px (`body.page-wide`). Ordem: 1) 4 regras de disciplina em faixa no topo; 2) três colunas: controle de meta | seus limites | contratos WIN e WDO lado a lado; 3) diário de 20 dias à esquerda e, à direita, coluna fixa ao rolar com indicadores, alerta, barras e rosca. Abaixo de 1150px vira 2 colunas; abaixo de 980px a simulação empilha; abaixo de 640px tudo em uma coluna.
- Página própria no mesmo site (menu com 2 páginas: Paraquedas e Gerenciamento), independente da calculadora do Paraquedas.
- Marca: "Paraquedas do Trader Indisciplinado" (não usar "Borba Gold"), mesma identidade visual.
- Linhas de lançamento: média de dias úteis de um mês → **20 linhas** ("Dia 1…20" no lugar de "Data"). Os resultados do diário continuam sem persistência; só os limites (capital, meta, risco, drawdown, stops) vão para o cartão.
- Corrigir os problemas de cálculo da planilha (abaixo).

Lógica da planilha (fonte da verdade, com as correções):
| Item | Fórmula |
|---|---|
| Entradas | Capital inicial (10.000), Meta % (5%), Risco por trade % (1%), Drawdown % (5%) |
| Risco por trade R$ | capital × risco% |
| Drawdown R$ | capital × drawdown% (limite = valor negativo) |
| Contratos WIN | ARREDONDAR.PARA.BAIXO(risco R$ ÷ (pts × 0,20)); stops padrão 250, 300, 350, 400, 450, 500 pts; financeiro = pts × 0,20 × contratos |
| Contratos WDO | ARREDONDAR.PARA.BAIXO(risco R$ ÷ (pts × 10)); stops padrão 10, 11, 11,5, 12, 15, 20 pts; financeiro = pts × 10 × contratos |
| Gain/Loss | lucro > 0 → Gain; < 0 → Loss; = 0 ou vazio → "-" |
| Percentual do dia | **corrigido:** lucro ÷ capital inicial (a planilha misturava com saldo anterior) |
| Saldo | saldo anterior + lucro (primeira linha parte do capital inicial) |
| % da meta atingido | **rótulo corrigido** (planilha dizia "% que falta"): ((saldo − capital) ÷ capital) ÷ meta% |
| Alerta | soma dos lucros ≤ −drawdown R$ → "ALERTA" |
| Gráficos | barras do lucro por dia; pizza Gain × Loss **corrigida:** proporção sobre as operações feitas (planilha dividia por 24 fixo) |
| Descartado | senha visível em G1; coluna "Ativo" citada nas Regras mas inexistente |

### Ajustes de 06/10/2026 (tarde)
- **Tema:** botão sol/lua no menu (`assets/tema.js`, carregado no `<head>`). Sem escolha salva, segue o tema do sistema; sem suporte, abre claro. A escolha fica em `localStorage` (`paraquedas-tema`).
- **Regras de disciplina:** 4 cartões coloridos com ícone (verde, azul, vermelho, âmbar), frase "A disciplina é o fermento das suas finanças".
- **Contratos:** cabeçalho "Stop (pts)"; etiqueta do ativo (WIN azul, WDO âmbar); área de cálculo com fundo `--calc-bg` (2 tons mais escuro que o painel no claro, 2 mais claro no escuro).
- **Cenários de acerto** (substituem "Carregar exemplo"): acertos 25, 30, 35, 45, 50, 75, 80% + "Meus resultados"; payoff 2:1, **misto 2 e 3 (padrão)** ou 3:1. Regra: 1 operação por dia, perda = risco por operação, gain = payoff × risco (no misto alterna 3x e 2x). Gains = arredondar(20 × acerto). Ordem dos dias sorteada (botão "Sortear outra ordem"). Quadro "Onde a disciplina vira lucro" mostra o resultado de cada acerto e o empate (100 ÷ (1 + payoff médio)). Aviso fixo: é um norte, não uma promessa; na prática é muito difícil manter gains de 2 a 3x o stop.
  - Conferido (capital 10.000, risco 1%): misto 25% −200, 30% +100, 35% +500, 45% +1.200, 80% +3.600; 2:1 35% +100 (empate 33,3%); 3:1 25% = 0; 2:1 25% −500 aciona o alerta.
- **Animação (página Paraquedas):** no topo, o paraquedas desce com um bloco de dinheiro e pousa sobre uma pilha de 5 blocos; o velame se fecha. Repete ao tocar na cena. Com "reduzir movimento" do sistema, mostra direto a cena final.

### Ajustes de 06/10/2026 (fim da tarde)
- **Animações desvinculadas do sistema (decisão do autor):** o site **não** usa `prefers-reduced-motion`. A animação do paraquedas sempre toca ao abrir (início após 0,4s, queda de 3,2s) e ao tocar na cena. Motivo: com "Efeitos de animação" desligado no Windows, a animação sumia em todos os navegadores.
- **Abas grandes:** os links do menu superior foram removidos (fica só a marca e o botão de tema). Na base do topo das duas páginas há duas abas grandes com ícone, título e descrição. A aba da página atual tem a cor do fundo e "encaixa" no conteúdo; a outra é verde, com sombra, botão "Abrir →" e um leve movimento de chamada.

- **Cabeçalho idêntico nas duas páginas** (para a troca de página não "pular"): menu, topo e abas usam a mesma largura (980px) e a mesma altura de topo (300px acima de 1100px; 340px entre 641 e 1100px; no celular, área de texto com no mínimo 300px). O Gerenciamento ganhou uma ilustração do mesmo tamanho da animação (barras de gain/loss subindo até um alvo). Só o conteúdo abaixo das abas do Gerenciamento é largo (1360px). Conferido: as abas ficam na mesma posição nas duas páginas em 15 larguras, de 320 a 1440px.
- **Transição entre páginas:** `@view-transition { navigation: auto }` com o menu fixo (`view-transition-name: topbar`); em navegadores sem suporte, a troca é normal.

## 7b. Paraquedas para qualquer renda + orientação de obrigações (definido e implementado em 06/10/2026)

Motivo: o paraquedas não é só o CDI. Para cada pessoa, a renda pode ser aluguel, salário, pró-labore, dividendos, freela etc. O site também precisa orientar quem arrisca antes de cumprir as obrigações, sem poluir a página.

Conceito: **verde = renda nova do mês destinada ao risco (qualquer fonte, valor líquido); âmbar = saque do que já estava guardado.** O patrimônio só fica no zero a zero se o risco sair da renda do mês, e da sobra no caso de salário.

Decisões do autor:
- Formulário do Paraquedas em **3 passos, todos visíveis, um abaixo do outro**:
  1. **Suas obrigações:** renda líquida do mês, contas do mês → sobra; reserva de emergência com 3 opções (Não tenho / Tenho parte / Tenho completa = 6 meses ou mais de contas). Link "Por que isso importa?" recolhível.
  2. **Quanto vai para o risco:** começa com "Rendimento de aplicação" (campos atuais: patrimônio, CDI, IR); botão "+ Adicionar outra renda" (aluguel, salário/pró-labore, dividendos, renda extra, outra), cada fonte com valor líquido e % destinado; mais o saque do patrimônio (âmbar).
  3. **Seu paraquedas:** semáforo + orçamento, dias, pontos WIN e alavancagem (como hoje).
- Faixa visual compacta "Contas → Reserva → Investir → Risco" ("o trade é o último degrau").
- **Semáforo:** vermelho = contas > renda ou orçamento de risco > sobra; âmbar = reserva incompleta/inexistente ou uso de saque do patrimônio; verde = obrigações cobertas e risco só com a sobra. No vermelho, **o cálculo continua visível** com o aviso (não bloqueia).
- Dicas curtas por campo (líquido, sem 13º, renda irregular pelo menor valor, aluguel após IPTU/condomínio/administração).
- Topo da página: "Arrisque só parte da renda que entra no mês. O que já está guardado nunca entra no jogo."

Implementação (`index.html` seção 1, `assets/paraquedas.js`):
- Passo 1: `renda` (líquida, sem rendimento de aplicação), `contas`, `reserva` (nao | parte | completa) → `sobra = renda − contas`.
- Passo 2: rendimento de aplicação (`pat`, `cdi`, `ir`, como antes) + `pctSobra` (% da sobra, padrão 30%) + até 4 rendas extras (aluguel, dividendos, renda extra, pró-labore, outra; valor líquido + % para o risco; cada tipo com dica própria) + `saque` (âmbar).
- Verde = rendimento + % da sobra + rendas extras. Âmbar = saque. Simulação de 12 meses usa verde e âmbar no lugar de "rendimento" e "complemento".
- Semáforo implementado: vermelho se sobra < 0 ou se há saque sem reserva; âmbar se a reserva não está completa ou há saque; verde nos demais casos. Mensagens curtas, uma por motivo.
- Exemplo padrão: renda 6.000, contas 4.800 (sobra 1.200), reserva completa, R$ 50 mil no CDI (R$ 456) + 30% da sobra (R$ 360) = R$ 816 → 8 dias de R$ 100, sinal verde.
- "Ajustes da operação" (stop diário e pontos do índice) ficam num bloco separado no fim do formulário.

## 7c. Cartão do plano de trade (implementado em 06/10/2026)

- Botão **"Gerar meu cartão do plano"** nas duas páginas (Paraquedas: fim do painel "Seu paraquedas"; Gerenciamento: fim do painel "Seus limites"). Gera prévia e botão "Baixar imagem (PNG)", arquivo `plano-de-trade-AAAA-MM.png`, 1080×1350, fundo claro.
- **Dados das duas páginas:** cada página grava seus últimos números em `localStorage` (chave `paraquedas-plano`, campos `pq` e `ger`, cada um com `ts`). **Expiram sozinhos após 30 dias** sem atualização. **Não há link para apagar** (decisão do autor: pode afastar usuários). Os resultados do diário de 20 dias não são gravados.
- Conteúdo: cabeçalho com marca e mês; semáforo do Paraquedas; "Meu mês" (orçamento, stop diário, dias); "Minha operação" (risco por operação, "até N stops por dia" = stop diário ÷ risco, meta, drawdown); tabela "Quantos contratos operar" WIN/WDO com os stops do Gerenciamento, calculada pelo risco por operação (ou pelo stop diário se o Gerenciamento ainda não foi usado); alerta se risco por operação > stop diário; 4 regras; rodapé com a frase do fermento, endereço do site e data. Parte faltante aparece como "Complete na página X".
- Código: `assets/cartao.js` (`PlanoCartao.salvar`, `PlanoCartao.ligar`, desenho em canvas, sem bibliotecas).
- **Futuro (não agora):** carregar o cartão de volta no site para mostrar evolução, erros e acertos; campo de nome. Pendente decisão do autor: gravar os números do plano dentro do PNG (metadados invisíveis) para viabilizar isso.

### Ajustes do Paraquedas e do cartão (06/10/2026, fim da tarde)
- **Régua da sobra:** em reais, de R$ 0 até a sobra calculada no passo 1 (`valSobra`), com balão "R$ X · Y%" sobre o botão e as pontas "R$ 0" e "R$ sobra". A régua guarda a **fração** (`fracSobra`, padrão 30%): se a sobra mudar, o percentual se mantém. Sem sobra, a régua fica desativada.
- **Dinheiro retirado do patrimônio para o day trade** (antes "saque"): sempre visível (decisão do autor: sem clique para abrir), em cartão vermelho com ícone de alerta e o texto "Má decisão: se perder, seu patrimônio encolhe de verdade. Deixe em zero." Barra do orçamento e composição em vermelho, com o rótulo "má decisão".
- **Ajustes da operação** foram para dentro do passo 3, acima do orçamento. O stop diário passou a ser um campo numérico **sem teto fixo** (mínimo R$ 10). Se o Gerenciamento já foi usado, o stop vem do **risco por operação** de lá; se a pessoa digitar outro valor, aparece "Usar o do Gerenciamento (R$ X)". Se o stop passar do orçamento do mês, o cálculo usa o orçamento (1 dia) e o campo avisa.
- O painel do passo 3 deixou de ficar fixo ao rolar, porque ficou mais alto que a tela.
- **Cartão:** as 4 regras de ouro da página Paraquedas (Bateu o stop, desliga; Stop não acumula; Nunca dobre para recuperar; Anote cada trade), com título e explicação, em 2×2. Quando o risco por operação passa do stop diário, o valor do risco aparece em vermelho com "maior que o stop diário!", no lugar da faixa de alerta separada.

## 8. Pendências / próximos passos

- [ ] Autor escolher o formato final (carrossel, infográfico ou página).
- [ ] Definir marca/assinatura nas peças (ex.: SRG ou @ do autor) — ainda não pedido.
- [ ] Atualizar premissas após o Copom de 04/11/2026.

## 2026-10-06 — Revisão de usabilidade aprovada

- Restauração dos campos do plano antes do primeiro cálculo, incluindo rendas extras e stops personalizados; distinção entre exemplo e plano, com confirmação para substituir pelo exemplo.
- Limite diário separado do risco por operação e importação explícita. Máximo de 20 dias sem elevar automaticamente o limite diário informado.
- Campo em reais sincronizado com a régua, com precisão de centavos; orçamento zero e incompatibilidade entre limites deixam o cartão sem contratos.
- Alerta mantém o primeiro limite de perda atingido; cenários encerram nesse ponto e lançamentos manuais posteriores são sinalizados. Comparação de cenários identificada como teórica.
- Desfazer a última substituição ou limpeza de resultados próprios; diário continua temporário.
- Cabeçalho móvel compacto, acesso direto ao plano, regras recolhíveis, resumo antes do diário e detalhes por linha no celular.
- Textos menos ambíguos, contraste das abas corrigido, controle de movimento com ilustração estática e respeito à preferência inicial do sistema.

Estas decisões substituem as descrições anteriores sobre importação automática do stop, aumento automático do limite diário, ausência de restauração e animações sempre ativas. Persistência de um diário completo continua fora deste escopo.

## 2026-10-06 — Entrada gratuita, gerenciamento e cartão

- Entrada independente em `public/index.html`, ocupando a tela no desktop e no celular, com composição inspirada em https://ghostly.tools/ e CTA “Definir minha meta — grátis”. A calculadora foi para `public/paraquedas.html`.
- Nova animação: a curva do capital para no limite definido quando o paraquedas abre. Proteção depende de respeitar o limite; sem mensagem de recuperação automática ou garantia de ganhos.
- Fluxo principal: Gerenciamento → refinamento opcional no Paraquedas → cartão no Gerenciamento. Dados já informados aparecem no resumo entre ferramentas e continuam salvos por 30 dias.
- Quatro regras sempre abertas, cartões compactos, cores discretas e ícones deslocados como marca-d’água.
- Removido “plano” dos textos visíveis. Gratuidade, ausência de cadastro e de assinatura explícitas.
- Emissão exclusiva no Gerenciamento. Prévia em modal com fundo escurecido, foco de teclado e fechamento por download, botão Fechar, Escape ou clique fora.
- PNG com fundo branco, fundos suaves e textos coloridos escuros para impressão.
- Licença MIT na raiz e em `public/LICENSE`; documentação continua fora da publicação.
- Validada navegação, integração dos dados, modal, download real de PNG, movimento reduzido e ausência de rolagem lateral em 320, 390, 768 e 1440 px, nos temas claro e escuro. Revisão visual de entrada, regras e cartão. Foram 113 verificações no navegador, incluindo orçamento ausente, limite diário zero, limites incompatíveis e repetição da animação.

Estas decisões substituem as descrições anteriores de entrada no Paraquedas, animação de dinheiro caindo, regras recolhíveis e emissão em duas páginas.

## 2026-10-06 — Animação combinada

- Pacote de dinheiro com paraquedas aberto desde o início acompanha a trajetória de queda do preço até pousar no chão do stop.
- Após o pouso, a queda continua em pontilhado vermelho; o pacote permanece no limite.
- Removido o botão de pausa das três páginas e desconsiderada a antiga preferência de pausa salva. Mantido Rever a animação. A preferência de movimento reduzido do sistema exibe a cena completa, com reprodução explícita disponível.
- Esta revisão substitui a animação em que o paraquedas só abria ao chegar ao limite.

## 2026-10-06 — Correção da reprodução automática

- A animação principal agora começa ao concluir o carregamento da página, independentemente da preferência de movimento reduzido do sistema. Removida a condição que mostrava diretamente a cena final.
- Rever a animação continua disponível. Esta decisão substitui a descrição anterior de cena estática inicial para movimento reduzido.

## 2026-10-06 — Fechamento após o pouso

- O paraquedas permanece aberto durante a descida e se recolhe sobre o dinheiro após tocar o chão. O pacote permanece parado e a queda pontilhada continua. Rever reinicia com o paraquedas aberto; reprodução automática preservada.

## 2026-10-07 — Gerenciamento unificado implementado

- Entrada e animação preservadas; unificação restrita às ferramentas. Rota Paraquedas redireciona ao Gerenciamento.
- Duas etapas obrigatórias para obrigações e fontes de risco, sem Pular. Revisão e migração com confirmação.
- Tabela WIN/WDO preservada, seleção de linha e alvos 2:1 / 3:1 da perda efetiva. Um stop financeiro, uma operação por dia e limite mensal igual ao orçamento.
- Simulação dos dias previstos (até 20), separada do diário. Diário e referência manual preservados na sessão da aba; perdas fora dos dias reduzidos continuam contando no saldo.
- Cartão emitido exclusivamente pelo mesmo modelo da página, com prévia modal e PNG de fundo claro.
- Cotação em JSON: Yahoo à vista como aproximação, brapi/ajuste WIN como reserva, data visível, fallback manual e preservação do último valor. Workflow de coleta/publicação preparado, ainda sem ativação remota.
- Removido da publicação o JavaScript antigo do Paraquedas, preservado no arquivo PQS#13. Documentos, scripts, testes e imagens de validação ficam fora de public.
- Validação: 14 testes de cálculo/cotação e 57 verificações no Edge; temas claro/escuro em 320, 390, 768 e 1440 px. Conferidos por SHA-256 os 15 arquivos de PQS#13, a home e os arquivos compartilhados preservados.
- Os quatro achados das avaliações anteriores foram corrigidos; evidências em VALIDACAO.md. A documentação vigente é GUIA.md.

Estas decisões substituem o refinamento opcional em uma segunda ferramenta, o diário descartado na navegação e a meta editável independente do stop. Permanecem fora da entrega a reimportação do PNG e a ativação remota do workflow.

## 2026-10-07 — Tabela informativa e comparação mensal

- Removida toda seleção de operação da tabela, estado salvo, metas, simulação, exposição e cartão. Metas agora usam apenas o stop financeiro.
- WIN inicia em 100 pontos e segue a sequência definida pelo autor; WDO usa 7, 10, 12, 15, 17 e 25. Exibição até a primeira linha zero; após o fim da sequência, acrescenta somente o primeiro stop sem contrato, conforme confirmação do autor.
- Botão Ocultar/Mostrar valores, com preferência de sessão e aplicação às entradas financeiras, resumo, tabelas e gráficos.
- Simulação abre em Mensal · 20 dias, com orçamento hipotético de 20 stops; alternativa Meu cenário calculado preserva o orçamento do operador e o diário separado.
- PNG de uma única página, sem Operação selecionada, com altura de linhas ajustada para mostrar as tabelas completas e as quatro regras.
- Esta decisão substitui a seleção pela linha e os alvos calculados sobre a perda efetiva de uma linha.
