# Paraquedas do Trader Indisciplinado

Site estático com duas ferramentas educativas de gestão de risco para day trade na B3:

- **Paraquedas** (`index.html`): usa o rendimento do CDI como orçamento de risco mensal, divide em stops diários e simula 12 meses.
- **Gerenciamento** (`gerenciamento.html`): meta, risco por operação, contratos de WIN/WDO pelo tamanho do stop e diário de 20 dias com alerta de drawdown.

Tudo roda no navegador. Não há servidor, banco de dados nem dados salvos.

## Estrutura

```
index.html              página Paraquedas
gerenciamento.html      página Gerenciamento
assets/style.css        estilos e cores compartilhados (tema claro/escuro)
assets/paraquedas.js    lógica da calculadora do Paraquedas
assets/gerenciamento.js lógica do simulador de gerenciamento
assets/favicon.svg      ícone da aba
assets/og-cover.png     imagem de prévia do link (1200×630)
.nojekyll               faz o GitHub Pages servir os arquivos sem processar
```

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub (ex.: `paraquedas`).
2. Envie **o conteúdo desta pasta** para a raiz do repositório, incluindo o arquivo `.nojekyll`.
   - Pelo site: *Add file › Upload files*, arraste tudo e confirme.
   - Pelo terminal:
     ```
     git init
     git add .
     git commit -m "Site Paraquedas do Trader Indisciplinado"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
     git push -u origin main
     ```
3. No repositório: *Settings › Pages › Build and deployment*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em 1 a 2 minutos o site fica em `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

## Ajuste obrigatório: prévia do link

As tags de prévia (Open Graph) precisam do endereço completo. Em `index.html` e `gerenciamento.html`, troque as duas ocorrências de `SEU-USUARIO.github.io/SEU-REPOSITORIO` pelo seu endereço real. Sem isso, o link abre normalmente, mas o WhatsApp e o LinkedIn não mostram a imagem de capa.

Para testar a prévia depois de publicar: cole o link no WhatsApp ou use o *Post Inspector* do LinkedIn.

## Premissas a revisar periodicamente

- Selic 13,75% a.a. (Copom de 16/09/2026); CDI padrão 13,65% a.a. — campo editável na calculadora.
- Ibovespa futuro ~190 mil pontos (set/2026) — campo editável.
- Valor do ponto: WIN R$ 0,20 e WDO R$ 10,00 por contrato.

Conteúdo educativo. Não é recomendação de investimento.
