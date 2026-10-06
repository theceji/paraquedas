# Paraquedas do Trader Indisciplinado

Site estático com duas ferramentas educativas de gestão de risco para day trade na B3:

- **Paraquedas** (`index.html`): combina a sobra da renda, rendimentos de aplicações e outras rendas em um orçamento de risco; define um limite diário e simula 12 meses.
- **Gerenciamento** (`gerenciamento.html`): meta, risco por operação, contratos de WIN/WDO pelo tamanho do stop e diário de até 20 dias com alerta de limite de perda.

Tudo roda no navegador, sem servidor de aplicação. Os campos do plano e os limites ficam salvos neste navegador por 30 dias e são restaurados ao voltar às páginas. O diário de resultados é temporário e não é salvo ao sair ou recarregar. Tema e preferência de movimento também ficam neste navegador.

## Estrutura

```
index.html              página Paraquedas
gerenciamento.html      página Gerenciamento
assets/style.css        estilos e cores compartilhados (tema claro/escuro)
assets/paraquedas.js    lógica da calculadora do Paraquedas
assets/gerenciamento.js lógica do simulador de gerenciamento
assets/cartao.js        persistência local e cartão PNG do plano
assets/tema.js          tema e preferência de movimento
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

## Prévia do link

As tags Open Graph já apontam para `https://theceji.github.io/paraquedas/`. Se mudar o endereço de publicação, atualize `og:url` e `og:image` nas duas páginas e `URL_SITE` em `assets/cartao.js`.

Para testar a prévia depois de publicar: cole o link no WhatsApp ou use o *Post Inspector* do LinkedIn.

## Premissas a revisar periodicamente

- Selic 13,75% a.a. (Copom de 16/09/2026); CDI padrão 13,65% a.a. — campo editável na calculadora.
- Ibovespa futuro ~190 mil pontos (set/2026) — campo editável.
- Valor do ponto: WIN R$ 0,20 e WDO R$ 10,00 por contrato.

Conteúdo educativo. Não é recomendação de investimento.

## Uso e regras da interface

- A primeira visita usa exemplos identificados. Editar um campo transforma o conjunto em "Meu plano"; "Usar exemplo" pede confirmação antes de substituir um plano personalizado.
- O limite diário e o risco por operação são independentes. No Paraquedas, importar o risco da outra página exige clicar no botão correspondente.
- A régua e o campo em reais usam o mesmo valor em centavos. Se a sobra mudar, a fração destinada ao risco é preservada.
- Há no máximo 20 dias no cálculo. O limite diário informado não aumenta automaticamente; o excedente do orçamento fica fora do risco.
- Sem orçamento ou limite diário positivo, o cartão não calcula contratos. Se o risco por operação exceder o limite diário, o cartão informa a incompatibilidade e apresenta zero contratos até o ajuste.
- O limite de perda do período é medido sobre o capital inicial. O primeiro dia em que ele foi atingido permanece identificado mesmo se houver ganhos posteriores.
- Cenários automáticos param ao atingir esse limite. A comparação de percentuais é teórica, sem aplicar o limite do período. Lançamentos manuais posteriores são mantidos e sinalizados como fora da regra.
- Limpar ou substituir resultados próprios permite desfazer a última substituição enquanto a página estiver aberta.
- No celular, o resumo precede o diário e cada linha oferece detalhes. As regras de disciplina são recolhíveis.
- A preferência de movimento segue o sistema inicialmente e pode ser alterada no cabeçalho; com movimento reduzido, a ilustração continua visível.
- Se o navegador bloquear o armazenamento, os cálculos e o cartão da página atual continuam funcionando; a interface informa que o plano não foi salvo.
