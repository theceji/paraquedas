# Guia — Paraquedas do Trader Indisciplinado

Regras financeiras documentadas em 07/10/2026, preservadas na entrega multilíngue de 13/10/2026. Consulte [INTERNACIONALIZACAO.md](INTERNACIONALIZACAO.md) para build, idiomas e rotas; [CHANGELOG.md](CHANGELOG.md) para o estado da entrega. A documentação histórica não substitui as regras abaixo.

## Fluxo

A entrada em `public/index.html` foi preservada, incluindo reprodução automática da animação, fechamento do paraquedas após o pouso e botão Rever. O gerenciamento está em `public/gerenciamento.html`. A antiga rota `paraquedas.html` redireciona ao gerenciamento unificado.

Na primeira utilização, duas etapas modais coletam as respostas:

1. **Suas obrigações:** renda líquida, contas e condição da reserva. A sobra é renda menos contas; a reserva não é somada ao orçamento.
2. **Quanto vai para o risco:** aplicação e rendimento estimado, parcela da sobra, até quatro rendas extras e retirada do patrimônio.

Campos aplicáveis são obrigatórios. Zero ou “Não tenho” são respostas explícitas; campos vazios não viram zero. Próxima valida a etapa. Voltar preserva o preenchimento. Não há Pular. Voltar ao início abandona o preenchimento sem concluir o gerenciamento. Depois de confirmar, Suas respostas mostra um resumo de renda, contas, reserva e valor destinado ao risco. Visualizar todos os parâmetros expande as respostas; Editar parâmetros abre os formulários preenchidos e permite cancelar a revisão.

Dados reconhecidos da versão anterior preenchem as perguntas, mas precisam de confirmação. Sem orçamento positivo, a tela explica a condição e não dimensiona operações nem emite cartão.

## Cálculos e limites

- Orçamento = parcela da sobra + rendimento mensal estimado líquido + parcelas das outras rendas + retirada do patrimônio.
- Rendimento = patrimônio × ((1 + CDI anual / 100)^(1/12) − 1) × (1 − IR / 100). CDI e IR são informados pelo usuário. É uma simplificação, sem projeção tributária do trade.
- Uma operação por dia: stop financeiro por operação = limite diário.
- Dias previstos = mínimo entre 20 e a parte inteira de orçamento ÷ stop. O stop não aumenta automaticamente.
- Contratos = parte inteira de stop financeiro ÷ (stop em pontos × valor do ponto).
- WIN: R$ 0,20 por ponto, incrementos de 5 pontos. WDO: R$ 10,00 por ponto, incrementos de 0,5 ponto.
- Perda prevista = contratos × pontos × valor do ponto. Metas mínima 2:1 e preferida 3:1 usam o stop financeiro informado. A tabela não participa da definição das metas.

Exemplo: orçamento R$ 3.000 e stop financeiro R$ 350 → oito dias, alvos R$ 700 / R$ 1.050. A tabela mostra, entre outras possibilidades, 17 WIN com stop de 100 pontos (R$ 340) e 5 WIN com stop de 350 pontos (R$ 350). Nenhuma linha é selecionável.

WIN segue 100, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1500, 1700, 2000, 2100 e 2500 pontos. WDO segue 7, 10, 12, 15, 17 e 25. Cada tabela para na primeira linha com zero contratos. Se a lista terminar com contratos, adiciona-se somente o primeiro stop sem contrato, respeitando o incremento do ativo. Com R$ 350, WIN termina em 2000 e WDO em 35,5. A tabela é uma referência do stop financeiro mesmo quando o orçamento estiver indisponível; não libera operações.

A cotação **não altera o número de contratos pelo stop**. Ela calcula o nocional de 1 WIN (pontos × R$ 0,20) e as razões de exposição sobre o orçamento informado. Isso não representa a margem exigida pela corretora.

O orçamento é o limite mensal único. O primeiro dia em que a perda acumulada atinge esse limite permanece marcado mesmo com ganhos posteriores. Saldo insuficiente para outro stop completo impede a emissão e exibe o alerta de encerramento; a tabela de referência permanece consultável. Perdas maiores que o stop diário e registros posteriores ao limite são sinalizados. Custos e diferenças de execução não estão incluídos.

As especificações de WIN foram conferidas na [B3](https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/futuro-mini-de-ibovespa.htm). Este material é educativo.

## Diário e cenários

A abertura padrão é **Mensal · 20 dias**, no modo simulado, com orçamento hipotético de 20 vezes o stop financeiro. Se o stop ainda não foi informado, usa R$ 350 exclusivamente como exemplo identificado. Esse cenário não altera o orçamento confirmado. **Meu cenário calculado** usa o orçamento e a quantidade de dias do operador.

**Meus resultados** é o diário e sempre usa o período calculado do operador. **Cenário simulado** usa entradas independentes, com percentual de acerto, payoff e ordem sorteada. Trocar os modos não substitui os resultados próprios. Limpar oferece Desfazer enquanto a página estiver aberta.

O diário exibe exatamente os dias previstos. Se uma revisão reduzir esse número, os lançamentos excedentes permanecem em “Lançamentos preservados fora do período atual” e **continuam contando no saldo e nos alertas**. Aumentar novamente os dias permite editá-los. Cenários param quando o orçamento acaba ou não comporta outro stop completo; não liberam operações bloqueadas pelo diário real.

A hipótese de 12 meses é um exemplo separado, com sequência fixa de percentuais. Trata as fontes como recorrentes, não projeta consumo de patrimônio finito e não é previsão de retorno.

## Armazenamento

- `localStorage`, chave `paraquedas-gerenciamento-v2`: respostas e stop financeiro, por até 30 dias sem atualização; mudança de mês exige reconfirmar respostas.
- `sessionStorage`, chave `paraquedas-diario-v2`: resultados do mês na sessão da aba; sobrevivem à navegação e recarga. Fechar a sessão pode descartá-los; não é um arquivo permanente nem sincronizado.
- `sessionStorage`, chave `paraquedas-cotacao-v1`: referência manual nesta aba.
- Dados antigos em `paraquedas-plano` são apenas lidos para migração e não sobrescritos.
- Nenhuma resposta financeira é enviada ao coletor ou ao GitHub. Armazenamento bloqueado mantém os cálculos durante a página aberta e exibe uma mensagem sobre a limitação.

## Ocultar valores

O botão no topo mascara valores monetários, quantidades de contratos, a razão sobre o orçamento, entradas financeiras e gráficos. A preferência permanece na sessão da aba e não apaga os dados. O formulário de edição também tem Mostrar valores; revele-os para editar e confirmar. A emissão do cartão exige valores visíveis para evitar abrir uma prévia financeira enquanto a página está ocultada.

## Cartão

Emissão somente no Gerenciamento, a partir do mesmo modelo usado na tela. O PNG de 1080 × 1350 mostra orçamento, stop, dias, saldo, alvos e as duas tabelas completas até zero contratos. Não há operação selecionada. A altura das linhas se ajusta à quantidade de stops para manter todo o cartão em uma única imagem/página. Fundo branco, fundos suaves e textos escuros. Não inclui dados ocultos para reimportação; essa possibilidade fica para evolução futura.

A prévia é um diálogo sobre fundo escurecido. Download inicia o salvamento e fecha a janela; Fechar ou Escape também encerram a prévia, com retorno do foco ao botão gerador. O navegador controla o destino do arquivo.

## Referência automática de mercado

`node scripts/atualizar-cotacao.mjs` atualiza `public/cotacao.json`:

1. Consulta Yahoo Finance (`^BVSP`). É Ibovespa à vista, identificado como aproximação para o WIN, sem prometer uma diferença fixa em relação ao futuro.
2. Se falhar, consulta a curva de WIN na brapi, escolhendo o contrato vigente de vencimento mais próximo com ajuste válido. A reserva é identificada como ajuste de fim de dia, não intradiário. A [documentação brapi](https://brapi.dev/docs/futuros/curva-de-vencimentos) descreve esse endpoint e o acesso a WIN sem token.
3. Valida preço, instrumento e data. Não substitui arquivo por referência mais antiga. Se tudo falhar, mantém o último arquivo válido e sua data original.

O navegador lê somente esse JSON no próprio site, com prazo de oito segundos. Exibe fonte, data e aviso de referência antiga após 36 horas. Ausência de JSON válido deixa a exposição indisponível e permite informar pontos manualmente; não inventa uma cotação padrão. Atualização malsucedida preserva a referência que já estava na tela. O botão Atualizar referência relê o JSON; não executa o robô no servidor.

`BRAPI_TOKEN` é opcional e só entra como GitHub Secret/variável do coletor. Nunca coloque token em `public/`. O endpoint Yahoo pode mudar ou limitar consultas; a reserva e a entrada manual cobrem indisponibilidades.

## Prévia local

Na raiz do projeto, com Node.js 22+:

```powershell
node scripts/servir.mjs
```

Abra `http://127.0.0.1:8080`. Só `public/` é servido. Ctrl+C encerra. Use HTTP para validar JSON e armazenamento; abrir o HTML diretamente como arquivo não reproduz essas condições.

## Publicação com automação

O workflow `.github/workflows/atualizar-cotacao.yml` foi preparado localmente; não está ativado remotamente por esta entrega.

1. Envie ao repositório a estrutura `public/`, `scripts/`, `tests/` e `.github/workflows/`, preservando esses nomes na raiz. Documentação e arquivos históricos não integram o artefato do site.
2. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**, conforme a [documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
3. Permita a gravação do bot na branch padrão para salvar `public/cotacao.json`. Se houver proteção da branch, ajuste o fluxo às regras do repositório. A configuração de push contempla `main`/`master`; adapte se a branch tiver outro nome.
4. Opcionalmente configure o Secret `BRAPI_TOKEN`; WIN está disponível sem token conforme a documentação consultada.
5. Execute **Cotação e publicação do site** em Actions e confira o deployment. Depois verifique a origem/data da referência e o download do cartão no endereço publicado.

A agenda solicita consultas às 11:17, 14:17 e 17:17 de segunda a sexta, horário de São Paulo. O agendamento pode atrasar e não identifica feriados. Grava commit apenas quando a referência muda e publica o artefato de `public/` no próprio workflow, sem depender de outro workflow disparado pelo commit do bot. Falha na coleta mantém a publicação com o arquivo anterior.

## Publicação manual

Envie **somente o conteúdo de `public/`** à raiz servida: HTML, `cotacao.json`, `assets/`, `LICENSE` e `.nojekyll`. Esse modo não instala o robô; para atualizar a cotação, execute o coletor localmente e envie o JSON novo.

Não publique `docs/`, `referencias/`, `arquivo/`, `tests/` ou `scripts/` como páginas. Se o endereço mudar, ajuste tags Open Graph e a URL impressa no cartão. Preserve as duas cópias da licença MIT.
