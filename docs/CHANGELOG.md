# Changelog

Registro canônico das versões a partir de 13/10/2026. O [histórico anterior](HISTORICO.md) já funciona como um diário de mudanças, mas não distingue de forma consistente versão local e versão publicada. Ele foi preservado, sem reclassificar retrospectivamente publicações não verificadas.

## Não publicado — Internacionalização (2026-10-13)

Implementada e validada localmente; aguardando publicação. Backup anterior: arquivo/versoes/PQS#17, cópia integral dos 18 arquivos de public/, conferida por SHA-256 antes das alterações.

### Implementado

- Português, inglês internacional e espanhol neutro, mantendo marca Paraquedas, BRL e regras brasileiras.
- Páginas estáticas geradas a partir de modelos e catálogos compartilhados; seletor de idioma preservando o estado em memória.
- Tradução de interface, validações, acessibilidade, cotação e cartão PNG.
- Nova rotina obrigatória de backup sequencial e revisão deste changelog, registrada no AGENTS.md e automatizada por scripts/arquivar-versao.mjs.
- URLs próprias, canonical, hreflang, sitemap e prévias PNG de compartilhamento nos três idiomas.
- Tradução sem recarga: preserva valores, rascunhos inválidos, foco nos campos, diário, ordem dos cenários e privacidade.
- Modelo fornece códigos de situação traduzidos pela interface; moeda, fórmulas e especificações permanecem comuns.

### Validação

- 27 testes automatizados de cálculo, cotação, internacionalização e snapshots.
- 68 verificações de regressão do gerenciamento e 25 dos parâmetros no Edge.
- 94 verificações multilíngues: três idiomas, temas claro/escuro, larguras 320/390/768/1440, acesso direto, navegação do histórico, armazenamento, validação, rascunhos e download real do PNG.
- Revisão visual dos cartões inglês/espanhol e das páginas desktop/celular. Fontes externas bloqueadas nos testes reproduzíveis, usando fallback do sistema.
- Evidências em referencias/validacao/i18n/.

### Publicação

Nenhum deploy desta versão foi realizado. Na publicação, substituir Não publicado pela identificação da versão e data efetiva, registrar o artefato publicado e atualizar as evidências de validação.
