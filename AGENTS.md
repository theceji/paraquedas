# Instruções — Paraquedas

- Responder em português. Manter alterações no escopo autorizado.
- Antes da primeira alteração de cada nova versão, copiar integralmente public/ para arquivo/versoes/PQS#<n>. A sequência desta regra começa em 17; usar o próximo número disponível, sem sobrescrever snapshots. Conferir arquivos e hashes, incluindo arquivos ocultos. Não criar outro snapshot para cada ajuste dentro da mesma versão.
- docs/CHANGELOG.md é o changelog canônico. Revisá-lo em cada versão para corresponder exatamente ao artefato entregue/publicado. Enquanto não houver confirmação de deploy, manter a entrada em Não publicado; não afirmar publicação com base apenas no build local.
- docs/HISTORICO.md é o registro histórico anterior, preservado como referência.
- Publicar somente public/. Documentação, fontes de páginas, catálogos, scripts, testes e arquivos históricos ficam fora da publicação, salvo artefatos gerados necessários ao site.
- Páginas public/*.html e public/en/, public/es/ são geradas por scripts/build-site.mjs a partir de src/pages/ e src/locales/. Alterar as fontes e reconstruir, nunca editar páginas geradas manualmente.
- Preservar IDs, chaves de armazenamento e códigos de dados existentes. Idioma não altera moeda BRL, ativos, fórmulas, prazos nem fuso do mercado.
- Executar o build e os testes relevantes antes da entrega. Não publicar remotamente sem autorização.
