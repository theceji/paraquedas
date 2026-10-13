# Validação da implementação

## Internacionalização — 13/10/2026

Entrega local validada: 27 testes automatizados, 68 verificações de regressão, 25 dos parâmetros e 94 multilíngues no Edge. Sem exceções JavaScript nas execuções finais. Conferidos três idiomas, dois temas e larguras 320/390/768/1440; PNGs de uma página e downloads reais. Evidências com dados fictícios em [i18n](../referencias/validacao/i18n/). Detalhes em [INTERNACIONALIZACAO.md](INTERNACIONALIZACAO.md).

A versão anterior foi copiada integralmente para arquivo/versoes/PQS#17 antes das alterações. Não houve publicação remota.

## Implementação anterior — 07/10/2026

A página inicial foi mantida. As ferramentas agora compartilham uma página e um modelo de cálculo. A implementação foi validada localmente; não houve publicação remota.

## Visualização

Imagens da execução no navegador, usando **dados fictícios de teste**:

- [Gerenciamento desktop](../referencias/validacao/gerenciamento-desktop.png)
- [Tabela de contratos no celular](../referencias/validacao/contratos-mobile.png)
- [Modal de obrigações no celular](../referencias/validacao/obrigacoes-mobile.png)
- [Modal das fontes de risco](../referencias/validacao/risco-modal.png)
- [Resumo das respostas e parâmetros](../referencias/validacao/respostas-desktop.png)
- [Resumo no celular](../referencias/validacao/respostas-mobile.png)
- [Tabela para stop financeiro de R$ 350](../referencias/validacao/tabela-stop-350.png)
- [Valores ocultos](../referencias/validacao/valores-ocultos.png)
- [Cenário mensal inicial](../referencias/validacao/simulacao-mensal.png)
- [Cartão de exemplo](../referencias/validacao/cartao-exemplo.png)

A [folha estática aprovada](../referencias/propostas/gerenciamento-modal-v3.html) permanece em propostas como histórico. As capturas finais usam a alternativa de fontes do sistema; as fontes externas foram bloqueadas no teste reproduzível. O layout com as fontes da marca também foi inspecionado na execução anterior desta implementação.

A revisão atual elimina qualquer seleção na tabela. As faixas são geradas até zero contratos, as metas usam o stop financeiro, a simulação abre no cenário mensal de 20 dias e o botão Ocultar valores também cobre formulários e gráficos. O PNG contém as tabelas completas e as quatro regras em uma única página.

## Evidências

- **16 testes automatizados** de cálculo e cotação: orçamento, arredondamento, metas, dias, limite zerado, saldo insuficiente, persistência da primeira violação, registros fora dos dias reduzidos, cenários separados e falhas dos provedores.
- **68 verificações no Edge**: perguntas obrigatórias, navegação, revisão/cancelamento, valores zerados, migração, armazenamento bloqueado, diário, cotação manual, falha de atualização, cartão, download real, fechamento/foco e responsividade.
- Temas claro e escuro, larguras de **320, 390, 768 e 1440 px**, sem transbordamento horizontal da página ou do modal de orçamento.
- Download PNG **1080 × 1350** conferido visualmente; a maior faixa WIN (20 linhas) cabe integralmente, sem Operação selecionada. Com stop R$ 500, as metas são R$ 1.000 / R$ 1.500. O cenário de R$ 350 também foi validado: 17 WIN de 100 pontos, primeira linha zero em 2000 pontos; WDO começa com 5 contratos de 7 pontos e encerra em 35,5 pontos com zero.
- Consultas reais aos endpoints Yahoo e brapi retornaram HTTP 200. O arquivo inicial foi gravado com a referência fornecida pelo Yahoo e sua data original. Essa conferência não garante disponibilidade futura.
- **15 arquivos de `arquivo/versoes/PQS#13`** conferidos contra o manifesto SHA-256 da cópia original. `public/index.html`, `inicio.js`, `inicio.css`, `tema.js`, `style.css` e `experiencia.css` permanecem iguais à cópia anterior à implementação.

## Achados anteriores resolvidos

| Achado anterior | Correção | Evidência |
|---|---|---|
| Tabela e cartão dimensionavam contratos diferentes | Emissão recebe o mesmo modelo calculado da interface | `public/assets/gerenciamento.js:182`; `public/assets/cartao.js:41` |
| Limite zero desabilitava alertas | Orçamento zero bloqueia dimensionamento; perdas com limite zero continuam sinalizadas | `public/assets/gerenciamento-modelo.js:26`; testes de orçamento zero |
| Orçamento não limitava o diário | Orçamento confirmado é o único limite mensal; recuperação posterior não apaga a primeira violação | `public/assets/gerenciamento-modelo.js:45` |
| Navegação descartava resultados próprios | Diário em sessionStorage e cenários independentes | `public/assets/gerenciamento.js:182`; teste de ida à home e retorno |

Reduzir dias também não pode ocultar perdas do saldo: os registros excedentes são preservados e considerados nos limites.

## Reproduzir

Na raiz do projeto:

```powershell
node --test tests/*.test.cjs tests/*.test.mjs
node tests/browser-check.cjs
```

O teste de navegador exige Edge instalado no Windows, usa perfil temporário e informa a pasta dos artefatos ao terminar. Não acessa seu perfil pessoal. Os testes de cotação usam respostas controladas e não dependem de internet.

## Limites desta validação

Workflow de GitHub Actions e deploy preparados, mas **não executados no GitHub**. A ativação, permissão de gravação da branch e configuração de Pages precisam ser feitas no repositório de destino conforme GUIA.md. O diário é de sessão; não há sincronização ou recuperação de cartão PNG. Safari/iOS e aparelhos físicos não foram testados.

### ⚠️ Atenção — erros e warnings

Nenhum erro ou warning identificado nos cenários locais verificados. Os quatro achados anteriores acima foram corrigidos; ativação remota e validação em outros navegadores permanecem fora das verificações executadas.
