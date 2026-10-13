# Internacionalização — 13/10/2026

## Arquitetura e manutenção

- Fontes únicas: src/pages/index.html, gerenciamento.html e paraquedas.html.
- Catálogos UTF-8: src/locales/pt-BR.json, en.json, es.json. Chaves textuais em português funcionam como mensagens-fonte; chaves de estado/plurais são semânticas. Ao alterar uma chave, atualizar os três catálogos e todas as referências.
- Build sem dependências externas: node scripts/build-site.mjs. Gera nove páginas, sitemap.xml e assets/locales.js. Confere paridade de chaves e parâmetros, textos sem tradução e escape HTML. O catálogo publicado reúne os três idiomas (~100 KB sem compressão) para permitir troca instantânea sem chamadas a tradutores ou requisições extras.
- Runtime: public/assets/i18n.js. Atualiza nós de texto e atributos registrados explicitamente; não substitui formulários e não observa mutações arbitrárias. Mensagens dinâmicas usam t(chave, parâmetros).
- Rota portuguesa preservada. Inglês em en/ e espanhol em es/, incluindo redirecionamento do Paraquedas antigo. Recursos compartilhados, LICENSE e cotacao.json têm caminhos corretos sob o subdiretório do GitHub Pages.
- SITE_URL pode configurar a URL absoluta do build. Padrão: https://theceji.github.io/paraquedas/. Canonical próprio, hreflang recíproco, x-default e lang. Páginas possuem conteúdo estático traduzido mesmo sem JavaScript; cálculos continuam exigindo JavaScript.

## Idioma e dados

A marca Paraquedas do Trader Indisciplinado permanece. Textos usam inglês internacional e espanhol neutro. As convenções numéricas escolhidas são pt-BR, en-US e es-ES; BRL permanece a moeda em todos os idiomas. CDI e IR conservam o contexto brasileiro e WIN/WDO mantêm seus códigos e especificações.

Intl.NumberFormat formata números e valores; Intl.DateTimeFormat formata datas; Intl.PluralRules seleciona singular/plural. Os inputs type=number mantêm sua representação numérica nativa sem inserção de separadores de milhares. Nenhum valor formatado é convertido de volta para o modelo. Validações traduzidas orientam a entrada; a interface nativa de números ainda depende do navegador/sistema.

A URL determina o idioma inicial. O seletor atualiza a URL com History API e registra paraquedas-language no armazenamento local, sem redirecionamento forçado. Voltar/avançar restaura o idioma. A preferência registrada não substitui o idioma de um link explícito.

Trocar o idioma não modifica dados confirmados, rascunhos (inclusive inválidos), diário, ordem do cenário, privacidade, tema, validade de 30 dias ou confirmação mensal. Não altera as chaves anteriores nem os códigos de opções salvos. O fuso de mercado permanece America/Sao_Paulo; ajuste de fim de dia usa a data UTC original, como antes.

O modelo financeiro retorna status e messageParams, independentemente do idioma. A interface traduz o estado. Os cálculos em centavos não foram duplicados.

## Cartão e compartilhamento

O PNG continua 1080 × 1350, em uma única página, com tabelas completas e quatro regras. O idioma acompanha a interface; trocar na prévia invalida a imagem anterior e gera outra. Nomes do download são localizados, preservando o nome anterior em português.

Prévia social: assets/og-cover.png, og-cover-en.png e og-cover-es.png. São geradas com node scripts/gerar-previas.cjs, usando Edge no Windows e desenho em canvas. Rodar esse comando ao alterar o texto/arte da prévia; as imagens prontas seguem no artefato publicável. O build comum não exige um navegador. O script é opcional para manutenção das imagens, não é um teste.

## Validação e publicação

Executar:

~~~powershell
node scripts/build-site.mjs
node --test tests/*.test.cjs tests/*.test.mjs
node tests/browser-check.cjs
node tests/parametros-browser.cjs
node tests/i18n-browser.cjs
~~~

O workflow gera as páginas antes de validar e publicar somente public/. Fontes, catálogos de edição, documentação, scripts e backups não são enviados ao Pages. Não houve deploy remoto desta entrega.

Antes de uma nova versão: node scripts/arquivar-versao.mjs. Não executar novamente para correções da mesma versão. Revisar docs/CHANGELOG.md e confirmar o estado real de publicação. PQS#17 identifica a cópia integral anterior às alterações desta entrega.
