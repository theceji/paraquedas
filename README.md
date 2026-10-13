# Paraquedas do Trader Indisciplinado

Site educativo gratuito, sem cadastro, com entrada independente e gerenciamento de risco unificado.

## Estrutura

- `src/pages/`: modelos únicos das páginas; `src/locales/`: catálogos pt-BR, en e es.
- `public/`: artefatos publicáveis gerados. `index.html` é a entrada; `gerenciamento.html` reúne orçamento, contratos, diário, simulação e cartão; `paraquedas.html` redireciona os links antigos.
- `scripts/`: servidor de prévia e coletor de cotação, fora do site.
- `tests/`: testes de cálculo, cotação e navegador, fora do site.
- `.github/workflows/`: automação preparada para cotação e GitHub Pages.
- `docs/`: guia, validação, CHANGELOG canônico, histórico anterior, roadmap e avaliações.
- `referencias/propostas/`: folhas estáticas avaliadas antes da implementação.
- `referencias/validacao/`: imagens da versão implementada com valores de teste.
- `arquivo/versoes/`: versões históricas, incluindo **PQS#13** e **PQS#17** (base anterior à internacionalização).

## Executar localmente

Na pasta do projeto, com Node.js 22 ou superior:

```powershell
node scripts/build-site.mjs
node scripts/servir.mjs
```

Abra `http://127.0.0.1:8080`, `/en/` ou `/es/`. Encerre o servidor com Ctrl+C.

## Usar

1. Entre pelo botão gratuito da página inicial.
2. Responda **Suas obrigações** e **Quanto vai para o risco**. Não existe opção de pular; zero e “Não” são respostas válidas.
3. Informe o stop financeiro e consulte as possibilidades WIN/WDO. Não há seleção de operação; os alvos são 2:1 e 3:1 do stop financeiro.
4. Explore o cenário mensal de 20 dias, aberto por padrão, ou seu cenário calculado. O diário usa orçamento ÷ stop, até 20, e fica separado das simulações.
5. Gere o cartão. A prévia abre sobre a tela e fecha ao baixar ou fechar.

O modelo considera **uma operação por dia**. Respostas e limites ficam no navegador por até 30 dias, com reconfirmação na mudança de mês. Diário e cotação manual ficam na sessão da aba.

O botão **Ocultar valores** mascara os dados financeiros, entradas e gráficos sem apagar as respostas. **Mostrar valores** restaura a visualização. A preferência dura a sessão da aba.

## Cotação e publicação

O site lê `public/cotacao.json`: Yahoo (Ibovespa à vista, identificado como aproximação) com brapi como reserva (ajuste diário de WIN). Origem e data são exibidas. A referência alimenta exposição e razão sobre orçamento; contratos pelo stop não dependem dela.

O workflow está preparado para três consultas em dias úteis e publicação **somente de `public/`**. Ainda exige ser enviado ao repositório e habilitado no GitHub Pages. Nenhuma publicação remota foi feita nesta implementação.

Leia [GUIA.md](docs/GUIA.md) para ativação, publicação manual, persistência e fórmulas. Consulte [VALIDACAO.md](docs/VALIDACAO.md) para testes, imagens e correções dos achados anteriores.

## Testar

```powershell
node --test tests/*.test.cjs tests/*.test.mjs
node tests/browser-check.cjs
node tests/parametros-browser.cjs
node tests/i18n-browser.cjs
```

Os testes de navegador usam Edge instalado no Windows e um perfil temporário isolado. As fontes externas são bloqueadas no teste para não depender de sua disponibilidade; as fontes de sistema são verificadas como alternativa.

## Licença

[MIT](LICENSE), com cópia idêntica em `public/LICENSE`.

## Novas versões e idiomas

Antes de iniciar a próxima versão, execute `node scripts/arquivar-versao.mjs`. O comando encontra o próximo PQS# sequencial (a partir de 17), copia public/ integralmente e verifica os hashes. O snapshot desta entrega já é PQS#17; não gere outro para continuar os ajustes desta mesma versão.

Revise [CHANGELOG.md](docs/CHANGELOG.md) a cada versão. Registre como publicado somente após confirmar o deploy do artefato correspondente. As instruções permanentes estão em [AGENTS.md](AGENTS.md).

Edite os modelos em src/pages/ e os três catálogos JSON em src/locales/; reconstrua public/ com o build. Não mantenha cópias manuais das páginas traduzidas. O build falha se faltar tradução, chave ou parâmetro.

Detalhes de arquitetura, formatos, idiomas e testes: [INTERNACIONALIZACAO.md](docs/INTERNACIONALIZACAO.md).
