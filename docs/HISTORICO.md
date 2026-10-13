# Histórico de modificações — Paraquedas do Trader Indisciplinado

## 2026-10-06

- Definido o conceito: rendimento do CDI como orçamento de risco mensal, dividido em stops diários.
- Autor acrescentou: complemento do bolso para capital pequeno (R$ 450 + R$ 550), stop diário ideal R$ 100–200, uso sem patrimônio (valor fixo mensal), evolução com lucros e desalavancagem ao longo do tempo.
- Decisões: público iniciante; 50% do lucro reinvestido; métrica de alavancagem = nocional WIN ÷ capital de risco; entregar as 3 versões.
- Calculada simulação ilustrativa de 12 meses (`dados.md`): resultado +R$ 1.880; guardado R$ 3.280; orçamento R$ 1.000 → R$ 2.356.
- Criado o carrossel de 8 telas (canvas de design).
- Criado o infográfico vertical único (canvas de design).
- Criada a página interativa com calculadora e simulação (`pagina-interativa.html`).
- Criados `roadmap.md` e este `HISTORICO.md`.
- Ajuste pedido em comentário: eixo dos 12 meses passa de M1…M12 para Jan…Dez (3 letras) no infográfico, no carrossel (tela 6) e na página interativa.
- Projeto renomeado de "Paraquedas do CDI" para **"Paraquedas do Trader Indisciplinado"** em todas as peças (títulos, capas e documentos). O título da capa passou a ocupar 3 linhas, com "Indisciplinado" em verde; a ilustração da capa foi reduzida para caber.
- Definida a hospedagem no GitHub Pages (endereço padrão, arquivos entregues pelo Claude, prévia Open Graph com imagem). Conteúdo do site aguardando a nova modularização que o autor vai pedir.
- Analisada a planilha de gerenciamento (Borba Gold). Definido o módulo "Gerenciamento": página própria no site, folha única de 20 dias, sem persistência, marca Paraquedas do Trader Indisciplinado, com 3 correções de cálculo (percentual, rótulo da meta, pizza). Detalhes na seção 7 do roadmap.
- Site para GitHub Pages criado em `site/`: menu com Paraquedas e Gerenciamento, estilos e scripts separados em `assets/`, prévia de link (Open Graph + imagem 1200×630), favicon, `.nojekyll` e README de publicação. A calculadora do Paraquedas foi convertida em `index.html` completo.
- Página Gerenciamento implementada: controle de meta, contratos WIN/WDO com stops editáveis, diário de 20 dias com exemplo, alerta de drawdown, gráfico de barras e rosca de acertos. Cálculos conferidos contra a planilha.
- Gerenciamento redesenhado em layout horizontal (página larga): regras de disciplina movidas para o topo; meta, limites e contratos em 3 colunas; diário ao lado dos indicadores e gráficos, que ficam fixos ao rolar. Celular continua empilhado.
- Botão de tema claro/escuro nas duas páginas (segue o sistema, lembra a escolha).
- Regras de disciplina com cores e ícones; tabela de contratos com "Stop (pts)", etiqueta do ativo e área de cálculo em tom destacado.
- "Carregar exemplo" substituído por cenários de acerto (25% a 80%) com payoff 2:1, misto 2 e 3 (padrão) ou 3:1, ordem sorteada e quadro "Onde a disciplina vira lucro"; aviso de que os cenários são um norte e não uma promessa.
- Animação do paraquedas pousando numa pilha de blocos de dinheiro no topo da página Paraquedas.
- Publicado em https://theceji.github.io/paraquedas/ — a primeira publicação ficou sem formatação porque a pasta `assets/` não foi enviada ao repositório (`assets/style.css` retornava 404). Tags Open Graph preenchidas com o endereço real.
- Animação não aparecia no navegador do autor: ela era desligada quando o sistema pede "reduzir movimento". Removido esse vínculo em todo o site; a animação agora sempre toca (ao abrir e ao tocar).
- Abas de navegação movidas do menu superior para a base do topo, como dois cartões grandes e chamativos. Corrigidos o tamanho do ícone das abas e o menu no celular.
- Transição entre páginas suavizada: cabeçalho, título e abas agora têm a mesma largura e altura nas duas páginas (antes o Gerenciamento usava 1360px e um topo mais baixo, e as abas "pulavam" ~180px). Ilustração de barras no topo do Gerenciamento e efeito de transição nativo do navegador.
- Definido (ainda não implementado): Paraquedas para qualquer fonte de renda, formulário em 3 passos (obrigações → renda para o risco → resultado) com semáforo e faixa "Contas → Reserva → Investir → Risco". Detalhes na seção 7b do roadmap.
- Implementado o Paraquedas para qualquer renda: 3 passos (obrigações, quanto vai para o risco, seu paraquedas), semáforo, faixa de degraus, rendas extras com dicas, saque do patrimônio em âmbar e textos do topo, do pior caso e da simulação atualizados. Testados 7 cenários do semáforo.
- Cartão do plano de trade: botão nas duas páginas, imagem PNG 1080×1350 juntando números do Paraquedas e do Gerenciamento (tabela de contratos WIN/WDO, regras). Números das páginas guardados no navegador por 30 dias, sem link para apagar. Testados 4 cenários (só uma página, ambas, risco maior que o stop diário, dados expirados).
- Régua da sobra em reais (0 até a sobra) com balão de valor; "Dinheiro retirado do patrimônio para o day trade" destacado em vermelho como má decisão; stop diário sem limite de R$ 300, dentro do passo 3 e puxado do Gerenciamento; regras de ouro com explicação no cartão.

## 2026-10-06 — Revisão de usabilidade aprovada

- Restauração dos campos do plano antes do primeiro cálculo, incluindo rendas extras e stops personalizados; distinção entre exemplo e plano, com confirmação para substituir pelo exemplo.
- Limite diário separado do risco por operação e importação explícita. Máximo de 20 dias sem elevar automaticamente o limite diário informado.
- Campo em reais sincronizado com a régua, com precisão de centavos; orçamento zero e incompatibilidade entre limites deixam o cartão sem contratos.
- Alerta mantém o primeiro limite de perda atingido; cenários encerram nesse ponto e lançamentos manuais posteriores são sinalizados. Comparação de cenários identificada como teórica.
- Desfazer a última substituição ou limpeza de resultados próprios; diário continua temporário.
- Cabeçalho móvel compacto, acesso direto ao plano, regras recolhíveis, resumo antes do diário e detalhes por linha no celular.
- Textos menos ambíguos, contraste das abas corrigido, controle de movimento com ilustração estática e respeito à preferência inicial do sistema.

## 2026-10-06 — Organização das pastas

- Site atual movido para `public/`, com páginas, assets e `.nojekyll` juntos para manter os caminhos relativos.
- Histórico e roadmap movidos para `docs/`; guia de uso e publicação separado do README da raiz.
- Imagens de apoio movidas para `referencias/`.
- Oito versões anteriores movidas integralmente para `arquivo/versoes/`, sem alterar seus arquivos.
- Integridade dos 103 arquivos originais conferida por SHA-256 após as movimentações, antes das atualizações de documentação. Publicação limitada ao conteúdo de `public/`.

## 2026-10-06 — Entrada gratuita, gerenciamento e cartão

- Entrada independente em `public/index.html`, ocupando a tela no desktop e no celular, com composição inspirada em https://ghostly.tools/ e CTA “Definir minha meta — grátis”. A calculadora foi para `public/paraquedas.html`.
- Nova animação: a curva do capital para no limite definido quando o paraquedas abre. Proteção depende de respeitar o limite; sem mensagem de recuperação automática ou garantia de ganhos.
- Fluxo principal: Gerenciamento → refinamento opcional no Paraquedas → cartão no Gerenciamento. Dados já informados aparecem no resumo entre ferramentas e continuam salvos por 30 dias.
- Quatro regras sempre abertas, cartões compactos, cores discretas e ícones deslocados como marca-d’água.
- Removido “plano” dos textos visíveis. Gratuidade, ausência de cadastro e de assinatura explícitas.
- Emissão exclusiva no Gerenciamento. Prévia em modal com fundo escurecido, foco de teclado e fechamento por download, botão Fechar, Escape ou clique fora.
- PNG com fundo branco, fundos suaves e textos coloridos escuros para impressão.
- Licença MIT na raiz e em `public/LICENSE`; documentação continua fora da publicação.
- Validada navegação, integração dos dados, modal, download real de PNG, movimento reduzido e ausência de rolagem lateral em 320, 390, 768 e 1440 px, nos temas claro e escuro. Revisão visual de entrada, regras e cartão. Foram 113 verificações no navegador, incluindo orçamento ausente, limite diário zero, limites incompatíveis e repetição da animação.

Estas decisões substituem as descrições anteriores de entrada no Paraquedas, animação de dinheiro caindo, regras recolhíveis e emissão em duas páginas.

> A partir de 13/10/2026, o registro canônico de novas versões é [CHANGELOG.md](CHANGELOG.md). Este documento preserva o histórico anterior.

## 2026-10-06 — Animação combinada

- Pacote de dinheiro com paraquedas aberto desde o início acompanha a trajetória de queda do preço até pousar no chão do stop.
- Após o pouso, a queda continua em pontilhado vermelho; o pacote permanece no limite.
- Removido o botão de pausa das três páginas e desconsiderada a antiga preferência de pausa salva. Mantido Rever a animação. A preferência de movimento reduzido do sistema exibe a cena completa, com reprodução explícita disponível.
- Esta revisão substitui a animação em que o paraquedas só abria ao chegar ao limite.

## 2026-10-06 — Correção da reprodução automática

- A animação principal agora começa ao concluir o carregamento da página, independentemente da preferência de movimento reduzido do sistema. Removida a condição que mostrava diretamente a cena final.
- Rever a animação continua disponível. Esta decisão substitui a descrição anterior de cena estática inicial para movimento reduzido.

## 2026-10-06 — Fechamento após o pouso

- O paraquedas permanece aberto durante a descida e se recolhe sobre o dinheiro após tocar o chão. O pacote permanece parado e a queda pontilhada continua. Rever reinicia com o paraquedas aberto; reprodução automática preservada.

## 2026-10-07 — Gerenciamento unificado implementado

- Entrada e animação preservadas; unificação restrita às ferramentas. Rota Paraquedas redireciona ao Gerenciamento.
- Duas etapas obrigatórias para obrigações e fontes de risco, sem Pular. Revisão e migração com confirmação.
- Tabela WIN/WDO preservada, seleção de linha e alvos 2:1 / 3:1 da perda efetiva. Um stop financeiro, uma operação por dia e limite mensal igual ao orçamento.
- Simulação dos dias previstos (até 20), separada do diário. Diário e referência manual preservados na sessão da aba; perdas fora dos dias reduzidos continuam contando no saldo.
- Cartão emitido exclusivamente pelo mesmo modelo da página, com prévia modal e PNG de fundo claro.
- Cotação em JSON: Yahoo à vista como aproximação, brapi/ajuste WIN como reserva, data visível, fallback manual e preservação do último valor. Workflow de coleta/publicação preparado, ainda sem ativação remota.
- Removido da publicação o JavaScript antigo do Paraquedas, preservado no arquivo PQS#13. Documentos, scripts, testes e imagens de validação ficam fora de public.
- Validação: 14 testes de cálculo/cotação e 57 verificações no Edge; temas claro/escuro em 320, 390, 768 e 1440 px. Conferidos por SHA-256 os 15 arquivos de PQS#13, a home e os arquivos compartilhados preservados.
- Os quatro achados das avaliações anteriores foram corrigidos; evidências em VALIDACAO.md. A documentação vigente é GUIA.md.

Estas decisões substituem o refinamento opcional em uma segunda ferramenta, o diário descartado na navegação e a meta editável independente do stop. Permanecem fora da entrega a reimportação do PNG e a ativação remota do workflow.

## 2026-10-07 — Respostas visíveis e regras destacadas no cartão

- Retirados os círculos da tabela de contratos. Seleção pela linha ou pelo número de contratos, com teclado; editar o stop seleciona a linha.
- Corrigido o título Mini Índice e mantido o cabeçalho Risco contratado ajustado pelo autor.
- Substituído Rever minhas respostas por resumo visível, consulta de todos os parâmetros e botão Editar parâmetros.
- Disciplina antes da entrada no PNG agora reproduz as quatro regras da página em cartões com borda colorida e ícones suaves, mantendo o fundo claro para impressão.

## 2026-10-07 — Tabela informativa e comparação mensal

- Removida toda seleção de operação da tabela, estado salvo, metas, simulação, exposição e cartão. Metas agora usam apenas o stop financeiro.
- WIN inicia em 100 pontos e segue a sequência definida pelo autor; WDO usa 7, 10, 12, 15, 17 e 25. Exibição até a primeira linha zero; após o fim da sequência, acrescenta somente o primeiro stop sem contrato, conforme confirmação do autor.
- Botão Ocultar/Mostrar valores, com preferência de sessão e aplicação às entradas financeiras, resumo, tabelas e gráficos.
- Simulação abre em Mensal · 20 dias, com orçamento hipotético de 20 stops; alternativa Meu cenário calculado preserva o orçamento do operador e o diário separado.
- PNG de uma única página, sem Operação selecionada, com altura de linhas ajustada para mostrar as tabelas completas e as quatro regras.
- Esta decisão substitui a seleção pela linha e os alvos calculados sobre a perda efetiva de uma linha.
