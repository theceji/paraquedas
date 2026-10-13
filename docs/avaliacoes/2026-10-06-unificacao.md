# Avaliação da unificação de Gerenciamento e Paraquedas

> Registro histórico. A implementação aprovada foi concluída em 07/10/2026; o estado atual e a resolução dos achados constam em [VALIDACAO.md](../VALIDACAO.md).

Data: 06/10/2026. Escopo: avaliação do código e do fluxo atual, reprodução de cenários em navegador isolado e proposta visual. Nenhuma correção ou unificação foi aplicada ao site em `public/`.

**Recomendação: reunir as duas ferramentas em uma página, mantendo a entrada em tela cheia no topo e usando navegação por âncoras.** O Paraquedas deve se tornar o bloco de orçamento do Gerenciamento. A maior melhoria é ter uma única definição de limites e uma única validação para resumo, tabela, diário e cartão.

Não basta colocar os dois formulários um abaixo do outro: os cálculos hoje usam critérios diferentes. A página única precisa resolver essas diferenças antes de poder ser considerada consistente.

[Ver a folha interativa da proposta](../../referencias/propostas/gerenciamento-unificado.html) · [Imagem desktop](../../referencias/propostas/gerenciamento-unificado.png) · [Imagem mobile](../../referencias/propostas/gerenciamento-unificado-mobile.png).

## Divergências e seus efeitos

| Prioridade | Ponto | Evidência atual | Efeito para a pessoa | Proposta |
|---|---|---|---|---|
| Alta | Tabela e cartão discordam sobre contratos | A tabela usa apenas o risco calculado do capital; o cartão também considera orçamento e limite diário. `public/assets/gerenciamento.js:33`, `:182`; `public/assets/cartao.js:43`. | Com risco de R$ 100, limite diário de R$ 30 e stop de 250 pontos WIN: tabela mostra 2 contratos, cartão mostra 0. | Um único cálculo de compatibilidade alimenta todas as saídas. A inconsistência precisa estar resolvida antes da emissão de um cartão operacional. |
| Alta | Orçamento mensal e perda máxima mensal não se confrontam | O orçamento é calculado em `public/assets/paraquedas.js:69`; o limite mensal vem de capital × percentual em `public/assets/gerenciamento.js:34`. A relação entre páginas confere só orçamento zero e risco diário em `:179`. | Orçamento R$ 500 e limite mensal R$ 1.000 coexistem. Após R$ 600 de perdas, o diário não avisa que o orçamento foi ultrapassado. | Exibir os dois valores e validar a compatibilidade. Não alterar silenciosamente os campos. Proposta: limite mensal não pode superar o orçamento disponível confirmado. |
| Alta | Zero tem sentidos opostos | Paraquedas/cartão tratam zero como ausência de orçamento. O diário só testa o limite se `dd > 0`, em `public/assets/gerenciamento.js:44`, e os cenários usam a mesma condição em `:255`. | Limite mensal R$ 0 e perda de R$ 100 resultam em ausência de alerta e indicador de uso de 0%. | Zero deve significar ausência de risco permitido. Se existir um modo sem limite, precisa ser uma opção explícita e diferente de zero. |
| Média | Refinar implica abandonar o diário | A interface manda ir ao Paraquedas e voltar (`public/gerenciamento.html:141`), mas avisa que resultados não são salvos (`:148`). O preenchimento inicial recria cenários. | Um resultado próprio, como −R$ 123,45, deixa de estar no diário ao retornar. É comportamento documentado, mas conflita com o fluxo sugerido. | Navegação interna preserva a sessão. Decidir separadamente se o diário deve sobreviver também a recarregamento/fechamento. |
| Média | “Dias de operação” não equivale aos 20 dias do diário | Paraquedas calcula orçamento ÷ limite diário, limitado a 20 (`public/assets/paraquedas.js:223`). Gerenciamento tem 20 linhas fixas (`public/assets/gerenciamento.js:8`) e o cenário assume uma operação por dia (`:223`). | “5 dias” pode ser entendido como calendário de operação, embora seja cobertura para perdas integrais. O diário continua permitindo 20 lançamentos. | Renomear para “dias de perda integral cobertos”. Manter calendário/sessões separados desse indicador. |
| Média | Dois blocos de “4 regras” ensinam conjuntos diferentes | `public/gerenciamento.html:54` e `public/paraquedas.html:244`. | Repetição de conteúdo, sem uma hierarquia única; o usuário pode supor que as listas são equivalentes. | Consolidar quatro cartões sempre visíveis. Incorporar meta, stop, não aumentar risco e registro nas explicações. |
| Média | “Capital”, “patrimônio” e “orçamento” ficam espalhados | Capital em `public/gerenciamento.html:88`; patrimônio aplicado em `public/paraquedas.html:106`; orçamento em `public/assets/paraquedas.js:69`. | Dá margem para usar o mesmo valor em conceitos que não são iguais ou entender que o capital inteiro está disponível para perda. | Nomear “capital de referência das operações”, “patrimônio aplicado” e “orçamento disponível para risco”, com sua finalidade visível. Não somar capital ao orçamento. |
| Média | O semáforo e os limites respondem a perguntas distintas | O semáforo analisa contas/reserva/saque em `public/assets/paraquedas.js:73`; incompatibilidade operacional aparece em outro texto (`:222`). | É possível ver “obrigações cobertas” e, ao mesmo tempo, risco por operação maior que o limite diário. | Separar “condições financeiras informadas” de “compatibilidade dos limites”, sem tratar verde como autorização para operar. |
| Baixa | Simulações não compartilham premissas | O diário usa risco e acerto; a série anual usa percentuais fixos em `public/assets/paraquedas.js:6` e `:90`. | Colocar os dois gráficos lado a lado pode fazer a série anual parecer uma projeção do diário, o que não é. | Manter a simulação mensal e deixar “hipótese de 12 meses” em seção expansível, explicitamente independente. |

Referências da tabela são relativas à raiz `E:\dev\Programacao\pqstrd`. As linhas foram conferidas na versão analisada.

## O que incorporar do Paraquedas

| Conteúdo atual | Destino na página única | Tratamento |
|---|---|---|
| Renda, contas e reserva | 01 — Orçamento | Formulário principal, com explicação curta. |
| Parte da sobra destinada ao risco | 01 — Orçamento | Um valor em reais; percentual derivado como informação auxiliar. |
| Rendimento de aplicações e outras rendas | Dentro de Orçamento | Detalhamento expansível; explicitar que uma renda não deve ser contada duas vezes. |
| Dinheiro retirado do patrimônio | Detalhamento de Orçamento | Separado de renda nova, com alerta visível quando houver valor. |
| Limite diário | 02 — Limites | Ao lado dos limites por operação e por mês. Sem botão de importação entre abas. |
| Composição e total do orçamento | Resumo unificado | Uma fonte dos números usados pelas demais seções. |
| “Dias de operação” | Cobertura do orçamento | Trocar o nome; não confundir quantidade de perdas suportadas com dias efetivamente operados. |
| Limite diário convertido em pontos de 1 WIN | Detalhes avançados | Retirar do fluxo principal, pois compete com o stop em pontos de cada operação. |
| Exposição de 1 WIN / orçamento | Detalhes avançados | Preservar como informação auxiliar, sem confundir exposição com perda no stop. |
| “Perdeu todos os dias?” | Seção educativa expansível | Mostrar impacto com as mesmas premissas do orçamento. |
| Simulação de 12 meses | Seção educativa expansível | Fora do caminho de gerar o cartão; premissas independentes explícitas. |
| Regras de ouro | Quatro regras consolidadas | Um só conjunto, sempre aberto. |
| Voltar ao Gerenciamento / importar limites | Remover da proposta | Navegação por âncoras substitui a ida e volta entre páginas. |

## Estrutura proposta

1. **Entrada em tela cheia:** preservar identidade, gratuidade e animação. CTA leva à seção de gerenciamento na própria página.
2. **Quatro regras sempre visíveis:** sem recolher esse bloco.
3. **Orçamento do mês:** quanto está disponível e de onde vem.
4. **Meta e limites:** capital de referência, meta, risco por operação, limite diário e limite mensal.
5. **Contratos:** uma só tabela de WIN/WDO, com os mesmos critérios do cartão.
6. **Cartão:** um único ponto de emissão, com prévia modal e apresentação adequada para impressão.
7. **Explorar cenários:** diário, hipótese anual, pior caso e exposição em blocos expansíveis. Resultados próprios não devem ser substituídos por simulações sem ação explícita.

A navegação superior usa âncoras e não recarrega a página. No desktop, um resumo lateral acompanha o preenchimento. No celular, ele deve entrar no fluxo sem cobrir campos ou ocupar a tela permanentemente.

É possível oferecer “já sei meu orçamento” sem exigir detalhes de renda. Nesse caso, a origem deve ficar identificada como não conferida, evitando um semáforo verde indevido. A folha ilustra a rota completa, com orçamento detalhado.

## Regra de consistência sugerida — ainda não implementada

Para o modo com orçamento confirmado, propor a relação:

`risco por operação ≤ limite diário ≤ limite mensal ≤ orçamento disponível`

Essa é uma decisão de produto sugerida para a unificação, não uma regra já aplicada pelo site. Valores incompatíveis devem gerar uma explicação comum, sem corrigir a entrada silenciosamente. Os três limites continuam sendo conceitos diferentes.

- A meta não aumenta o orçamento nem os limites de perda.
- Capital de referência não se torna automaticamente dinheiro disponível para perder.
- Tabela, resumo, simulação e cartão devem usar a mesma validação.
- Orçamento e limites devem distinguir valores configurados de saldo ainda disponível após resultados.
- Ao atingir um limite, a simulação deve parar ou registrar a infração com clareza; recuperar depois não apaga o evento.
- Se o diário for usado para acompanhar o mês de verdade, decidir como tratar ganhos, perdas brutas/líquidas, dias, operações, virada do mês e persistência. Hoje o diário registra resultados por dia e o cenário usa uma operação por dia; não inventar informações por trade a partir de um total diário.

## Folha de exemplo

Arquivo: `referencias/propostas/gerenciamento-unificado.html`.

- Página independente, sem acessar o armazenamento do site e sem bibliotecas externas.
- Valores fictícios fixos: orçamento R$ 500, capital de referência R$ 10.000, risco por operação R$ 50, limite diário R$ 100 e mensal R$ 500.
- Demonstra navegação na mesma página, detalhes expansíveis, resumo e prévia de cartão.
- Os botões “Exemplo coerente” e “Ver limites incompatíveis” demonstram como tabela, resumo e cartão deveriam responder juntos.
- Não é a calculadora final. Não salva dados, não recomenda parâmetros e não gera um cartão operacional.
- A ilustração de entrada é estática na folha; a animação atual seria preservada na implementação.

## Cuidados para uma implementação futura

- Não concatenar os HTML/scripts atuais: há IDs repetidos, como `planoEstado`, `btnExemplo`, `relacaoLimites`, `sRes` e `t-reg`, que apontariam para elementos errados em uma só página.
- Separar estado dos dados, cálculo dos resultados e atualização da interface; manter uma única função de validação para tela e cartão.
- Preservar os valores já salvos e migrá-los explicitamente. Visitar uma ferramenta hoje já salva exemplos; isso deve ser distinto de confirmar valores próprios.
- Redirecionar os endereços antigos para as âncoras correspondentes se a mudança for aprovada, evitando quebrar links.
- Manter histórico, roadmap e propostas fora de `public/`.
- Textos de taxas/data e premissas fiscais não foram validados como informação atual nesta avaliação. O parecer trata da coerência do software e da organização da experiência.

## Validação realizada

Reprodução em Edge isolado dos cenários de tabela versus cartão, orçamento versus perda mensal, limite zero e perda de um lançamento manual ao navegar. A inspeção do código confirma que os cálculos são separados. Nenhum dado da sessão normal do usuário foi utilizado. A folha passou por 12 verificações de navegação, prévia modal, estados de exemplo e larguras de 320, 390, 768 e 1440 px. Os 15 arquivos de `public/` foram conferidos por SHA-256 e permaneceram idênticos.

### ⚠️ Atenção — erros e warnings

| # | Tipo | Onde | Cenário → resultado | Origem |
|---|---|---|---|---|
| 1 | ERRO | `public/assets/gerenciamento.js:182`; `public/assets/cartao.js:45` | Risco R$ 100, limite diário R$ 30, WIN 250 pontos → tabela exibe 2 contratos e cartão exibe 0 para a mesma configuração. | PRÉ-EXISTENTE |
| 2 | ERRO | `public/assets/gerenciamento.js:44`; `public/assets/gerenciamento.js:208` | Limite mensal zero e lançamento de −R$ 100 → nenhum alerta e uso do limite exibido como 0%, embora a interface não declare um modo sem limite. | PRÉ-EXISTENTE |
| 3 | WARNING | `public/assets/gerenciamento.js:34`; `public/assets/gerenciamento.js:179`; `public/assets/cartao.js:45` | Se o usuário interpretar as duas ferramentas como gerenciamento integrado: orçamento R$ 500 e limite mensal R$ 1.000 → −R$ 600 no diário sem aviso de orçamento esgotado; cartão ainda indica 2 contratos WIN a 250 pontos. Os módulos atualmente independentes precisam de uma regra comum. | PRÉ-EXISTENTE |
| 4 | WARNING | `public/gerenciamento.html:141`; `public/gerenciamento.html:148` | Preencher resultado próprio e seguir o refinamento sugerido no Paraquedas → voltar ao Gerenciamento descarta o lançamento. A perda é avisada no texto, mas a navegação proposta a provoca. | PRÉ-EXISTENTE |