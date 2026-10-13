# Folha estática — perguntas obrigatórias e início preservado

> Registro histórico. A implementação aprovada foi concluída em 07/10/2026; o estado atual e a resolução dos achados constam em [VALIDACAO.md](../VALIDACAO.md).

07/10/2026 · Revisão 03. Substitui o fluxo opcional da revisão 02. Continua sendo uma proposta estática, sem implementação em public.

[HTML estático](../../referencias/propostas/gerenciamento-modal-v3.html) · [Imagem desktop](../../referencias/propostas/gerenciamento-modal-v3.png) · [Imagem celular](../../referencias/propostas/gerenciamento-modal-v3-mobile.png).

## Decisões confirmadas

- Removida a opção Pular das duas etapas: Suas obrigações e Quanto vai para o risco.
- Próxima depende do preenchimento válido dos campos aplicáveis. Campos vazios não são interpretados como zero; uma fonte inexistente pode ser declarada explicitamente como zero ou Não tenho.
- Voltar permite corrigir a etapa anterior. Retornar à página inicial abandona o preenchimento sem promover respostas incompletas a um gerenciamento concluído.
- A página principal/inicial permanece separada, com a aparência em tela cheia, animação e CTA atuais. O CTA leva ao Gerenciamento, que recebe os modais e o conteúdo unificado.
- A unificação diz respeito às ferramentas Gerenciamento e Paraquedas, não à incorporação da página inicial dentro da calculadora.
- Permanecem a tabela WIN/WDO, os alvos 2:1 e 3:1 e a simulação com a quantidade calculada de dias.
- A hipótese de uma operação por dia, os números ilustrativos e as pendências de integração de cotação continuam conforme as [notas da revisão 02](2026-10-06-fluxo-modal-v2.md). A descrição de Pular naquela revisão é histórica e foi substituída por esta decisão.

A folha mostra o primeiro modal com Voltar ao início / Próxima e o segundo com Voltar / Próxima. Os controles são apenas visuais; nenhum formulário real foi alterado. A revisão 02 permanece disponível para comparação.

## Conferência

14 verificações passaram, incluindo ausência de Pular, link para o início separado, tabelas preservadas e ausência de rolagem lateral em 320, 390, 768 e 1440 px. Imagem da folha conferida visualmente. public e PQS#13 permanecem idênticas aos hashes registrados antes desta revisão.

### ⚠️ Atenção — erros e warnings

Os achados anteriores continuam pendentes no site atual; esta folha não os corrige.

| # | Tipo | Onde | Cenário → resultado | Origem |
|---|---|---|---|---|
| 1 | ERRO | `public/assets/gerenciamento.js:182`; `public/assets/cartao.js:45` | Risco R$ 100, limite diário R$ 30 e WIN 250 pontos → tabela mostra 2 contratos e cartão mostra 0. | PENDENTE |
| 2 | ERRO | `public/assets/gerenciamento.js:44`; `public/assets/gerenciamento.js:208` | Limite mensal zero e perda R$ 100 → nenhum alerta e uso do limite de 0%. | PENDENTE |
| 3 | WARNING | `public/assets/gerenciamento.js:34`; `public/assets/gerenciamento.js:179` | Uso combinado com orçamento R$ 500 e limite mensal R$ 1.000 → R$ 600 em perdas sem aviso de orçamento esgotado. | PENDENTE |
| 4 | WARNING | `public/gerenciamento.html:141`; `public/gerenciamento.html:148` | Seguir para o Paraquedas e voltar após lançar resultado próprio → lançamento descartado. | PENDENTE |