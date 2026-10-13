# Folha estática — coleta em modais e gerenciamento unificado

> Registro histórico. A implementação aprovada foi concluída em 07/10/2026; o estado atual e a resolução dos achados constam em [VALIDACAO.md](../VALIDACAO.md).

06/10/2026 · Revisão 02 · Somente proposta visual; implementação em `public/` não alterada.

[HTML estático](../../referencias/propostas/gerenciamento-modal-v2.html) · [Imagem da folha completa](../../referencias/propostas/gerenciamento-modal-v2.png) · [Imagem no celular](../../referencias/propostas/gerenciamento-modal-v2-mobile.png).

## Versão preservada

A pasta `public/` foi copiada integralmente para `arquivo/versoes/PQS#13`. Os 15 arquivos foram comparados por SHA-256. A versão é uma cópia do site atual, anterior a qualquer implementação desta proposta. A pasta PQS#12 já existente foi preservada.

## Mudanças representadas

- Tela modal 1: Suas obrigações, incluindo renda líquida, contas, reserva, sobra e explicação. Ações Próxima e Pular.
- Tela modal 2: Quanto vai para o risco, incluindo aplicação/CDI/IR, parcela da sobra, outras rendas e retirada do patrimônio. Ações Voltar, Pular e Próxima.
- Após responder: resumo Seu Paraquedas no próprio Gerenciamento, com a opção de rever respostas.
- Sem os quadros Ajustes da operação e Controle de meta. O stop financeiro permanece como entrada essencial, apresentado em uma faixa junto dos alvos e dias calculados.
- Tabela Contratos por tamanho de stop preservada como componente, com WIN e WDO, seis stops por ativo, quantidade e perda financeira. Não é uma imagem rasterizada: mantém a estrutura para voltar a ser editável na implementação. No celular, as duas tabelas se empilham para evitar rolagem horizontal.
- Alvos por operação: mínimo 2:1 e recomendado 3:1, conforme a nomenclatura solicitada. O termo recomendado identifica a preferência do modelo, não garantia de resultado ou recomendação personalizada.
- Simulação dos dias previstos substitui Simulação/Diário de 20 dias. A folha usa exatamente seis linhas.
- A entrada em tela cheia e a animação atuais seriam mantidas. A folha concentra a visualização nos modais e no painel que muda.
- Os controles da folha são deliberadamente estáticos. Não há scripts, persistência nem consulta de cotação.

## Números do exemplo e premissas propostas

| Item | Valor/decisão ilustrada |
|---|---|
| Renda líquida | R$ 10.000 |
| Contas | R$ 7.000 |
| Sobra | R$ 3.000 |
| Parcela da sobra destinada | R$ 1.500 |
| Renda extra ainda não incluída na renda inicial | R$ 1.500, com 100% destinado |
| Rendimento de aplicações / saque | R$ 0 / R$ 0 |
| Orçamento | R$ 3.000 |
| Stop financeiro por operação | R$ 500 |
| Hipótese necessária para os dias | Uma operação por dia; limite diário igual a R$ 500 |
| Dias previstos | min(20, piso(3.000 / 500)) = 6 |
| Seleção ilustrada | WIN, 250 pontos, 10 contratos, perda no stop de R$ 500 |
| Alvo mínimo 2:1 | 500 pontos / R$ 1.000 |
| Alvo recomendado 3:1 | 750 pontos / R$ 1.500 |
| Simulação | Três perdas de R$ 500 e três ganhos de R$ 1.000; resultado R$ 1.500; saldo do orçamento R$ 4.500 |

A hipótese de uma operação por dia é uma escolha para esta folha, não uma decisão já confirmada para a implementação. Se forem permitidas várias operações por dia, o limite diário precisa continuar definido separadamente, mesmo que o quadro antigo Ajustes da operação seja eliminado. Caso contrário, orçamento ÷ risco por operação mede perdas completas suportadas, não dias.

Os dias permanecem uma quantidade prevista pela cobertura do orçamento; não são previsão de sessões efetivamente operadas. O máximo de 20 foi conservado do modelo atual para esta proposta.

Os alvos em reais devem acompanhar a perda efetiva da linha selecionada. WIN com stop de 300 pontos e risco máximo R$ 500 comporta 8 contratos: perda R$ 480, alvo 2:1 de R$ 960 e alvo 3:1 de R$ 1.440. Multiplicar sempre o teto de R$ 500 faria a relação real deixar de ser 2:1/3:1 nessa linha.

A meta deixa de ser um percentual mensal independente. Não multiplicar automaticamente o alvo por todos os dias como se isso fosse um resultado esperado.

## Pular sem fabricar dados

- Pular obrigações: manter situação financeira como não informada. Não transformar a falta de resposta em reserva completa, contas cobertas ou saldo zero.
- Pular orçamento: dias e razão de exposição ficam a definir. Oferecer completar o orçamento depois.
- Se o usuário informar um stop sem orçamento, um cálculo isolado de contratos pode ser exploratório, mas não deve ser apresentado como gerenciamento financeiramente validado.
- Um cartão com dados incompletos deve dizer o que falta. Exemplos não podem ser promovidos silenciosamente a valores próprios.
- Rever respostas deve reabrir os modais sem navegar para outra página. A política de persistência dos resultados continua sendo uma decisão separada.

## Cotação: função e possibilidade de integração

A [especificação da B3 para WIN](https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/futuro-mini-de-ibovespa.htm) define R$ 0,20 por ponto e lote de um contrato. Assim, com stop informado em pontos, a quantidade é calculada por:

`contratos = piso(risco financeiro / (stop em pontos × valor do ponto))`

A cotação corrente do índice futuro não é necessária nessa fórmula. Ela serve para calcular o nocional e a razão de exposição:

`nocional WIN = cotação em pontos × R$ 0,20 × contratos`

`exposição / orçamento = nocional / orçamento destinado ao risco`

Na folha: cotação FICTÍCIA de 190.000 pontos → R$ 38.000 por WIN; 1 WIN / R$ 3.000 = 12,67×; 10 WIN / R$ 3.000 = 126,67×. Isso não mede a margem exigida pela corretora. Nenhum preço ao vivo foi obtido ou simulado como se tivesse sido obtido.

A [B3 descreve WDO](https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/moedas/futuro-mini-de-taxa-de-cambio-de-reais-por-dolar-comercial.htm) com tamanho USD 10.000 e cotação em reais por USD 1.000. A razão entre essas unidades resulta em R$ 10 por ponto, usada na tabela atual e preservada na folha.

O [TradingView informa que não oferece uma API pública de acesso a dados](https://www.tradingview.com/support/solutions/43000474413-i-need-access-to-your-api-in-order-to-get-data-or-indicator-values/); a REST API citada na documentação atende integração de corretoras. Portanto, não assumir que inserir um componente visual do TradingView entrega uma cotação reutilizável pelo cálculo.

Para a implementação, a opção tecnicamente adequada é selecionar uma fonte que forneça programaticamente o contrato futuro negociado com permissão de uso. Registrar símbolo/vencimento, valor, provedor, horário e atraso. Provedor, credenciais, custo e condições de acesso ainda não foram escolhidos nem contratados. Não trocar silenciosamente o contrato futuro pelo índice à vista. Sem cotação válida, apresentar exposição indisponível; o cálculo por stop em pontos pode continuar separado.

Fontes oficiais consultadas em 06/10/2026. A folha não faz integração e não afirma um preço atual de mercado.

## Critérios para a próxima etapa

Antes de implementar, consolidar o significado do stop por operação versus dia; quais dados continuam opcionais; qual provedor fornece a cotação; e como orçamento, resultados e saldo disponível se relacionam. A folha usa hipóteses explícitas para permitir avaliar o layout primeiro.

## Conferência da folha

Doze verificações passaram: documento sem scripts e com controles estáticos, dois modais, 12 linhas WIN/WDO com quantidades conferidas, seis dias de simulação, ausência de rolagem lateral em 320/390/768/1440 px, ausência de armazenamento e nenhuma exceção JavaScript. Imagens desktop e mobile conferidas visualmente. Os 15 arquivos de public e os 15 arquivos da cópia PQS#13 continuam idênticos aos hashes registrados antes da proposta.

### ⚠️ Atenção — erros e warnings

Os achados anteriores continuam pendentes no site atual; esta folha não os corrige.

| # | Tipo | Onde | Cenário → resultado | Origem |
|---|---|---|---|---|
| 1 | ERRO | `public/assets/gerenciamento.js:182`; `public/assets/cartao.js:45` | Risco R$ 100, limite diário R$ 30 e WIN 250 pontos → tabela mostra 2 contratos e cartão mostra 0. | PENDENTE |
| 2 | ERRO | `public/assets/gerenciamento.js:44`; `public/assets/gerenciamento.js:208` | Limite mensal zero e perda R$ 100 → nenhum alerta e uso do limite de 0%. | PENDENTE |
| 3 | WARNING | `public/assets/gerenciamento.js:34`; `public/assets/gerenciamento.js:179` | Uso combinado com orçamento R$ 500 e limite mensal R$ 1.000 → R$ 600 em perdas sem aviso de orçamento esgotado. | PENDENTE |
| 4 | WARNING | `public/gerenciamento.html:141`; `public/gerenciamento.html:148` | Seguir para o Paraquedas e voltar após lançar resultado próprio → lançamento descartado. | PENDENTE |