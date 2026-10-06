/* Paraquedas do Trader Indisciplinado — simulador de gerenciamento
   Origem: planilha mensal de gerenciamento, reduzida a uma folha única de 20 dias, sem persistência.
   Correções em relação à planilha: % do dia sempre sobre o capital inicial; "% da meta atingido"
   (a planilha rotulava como "% que falta"); pizza calculada sobre as operações feitas (a planilha dividia por 24). */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const DIAS = 20;
  const WIN_PONTO = 0.20;
  const WDO_PONTO = 10;
  const STOPS_WIN = [250, 300, 350, 400, 450, 500];
  const STOPS_WDO = [10, 11, 11.5, 12, 15, 20];
  const ACERTOS = [25, 30, 35, 45, 50, 75, 80];
  let ultimo = null;
  let exemplo = true;
  let desfazer = null;
  let cenarioAnterior = '35';
  const campos = ['cap', 'meta', 'risco', 'dd'];
  const padrao = Object.fromEntries(campos.map(id => [id, $(id).value]));

  const brl = (v) => (v < 0 ? '−' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brl0 = (v) => (v < 0 ? '−' : '') + 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
  const pct = (v, d = 1) => (v < 0 ? '−' : '') + Math.abs(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
  const num = (el, def) => { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : def; };

  /* ---------- Cálculo puro (testável) ---------- */
  function contratos(risco, pts, valorPonto) {
    if (!(pts > 0) || !(risco > 0)) return 0;
    return Math.floor(risco / (pts * valorPonto) + 1e-9);
  }

  function calcular(p) {
    const risco = p.cap * p.riscoPct / 100;
    const dd = p.cap * p.ddPct / 100;
    const metaR = p.cap * p.metaPct / 100;
    let saldo = p.cap, total = 0, gains = 0, losses = 0, lancados = 0;
    let primeiroLimite = null, totalNoLimite = 0, maiorPerda = 0, aposLimite = 0;
    const linhas = p.resultados.map((v, i) => {
      if (v === null) return { dia: i + 1, v: null, sit: '-', pctDia: null, saldo: null, pctMeta: null };
      lancados++;
      total += v; saldo += v;
      maiorPerda = Math.max(maiorPerda, -total);
      if (primeiroLimite !== null) aposLimite++;
      if (primeiroLimite === null && dd > 0 && total <= -dd) { primeiroLimite = i + 1; totalNoLimite = total; }
      const sit = v > 0 ? 'Gain' : (v < 0 ? 'Loss' : '-');
      if (v > 0) gains++; else if (v < 0) losses++;
      return {
        dia: i + 1, v, sit,
        pctDia: p.cap > 0 ? v / p.cap : 0,
        saldo,
        pctMeta: p.cap > 0 && p.metaPct > 0 ? ((saldo - p.cap) / p.cap) / (p.metaPct / 100) : 0
      };
    });
    return {
      risco, dd, metaR,
      win: STOPS_WIN.map((_, i) => p.stopsWin[i]).map((pts) => { const c = contratos(risco, pts, WIN_PONTO); return { pts, c, fin: pts * WIN_PONTO * c }; }),
      wdo: STOPS_WDO.map((_, i) => p.stopsWdo[i]).map((pts) => { const c = contratos(risco, pts, WDO_PONTO); return { pts, c, fin: pts * WDO_PONTO * c }; }),
      linhas, total, saldo, gains, losses, lancados,
      pctMetaFinal: p.cap > 0 && p.metaPct > 0 ? (total / p.cap) / (p.metaPct / 100) : 0,
      primeiroLimite, totalNoLimite, maiorPerda, aposLimite,
      alerta: primeiroLimite !== null
    };
  }
  window.__gerenciamentoCalcular = calcular;

  /* ---------- Montagem das tabelas ---------- */
  function montarStops(tbodyId, stops, prefixo, passo) {
    $(tbodyId).innerHTML = stops.map((s, i) => `<tr>
      <td><input type="number" id="${prefixo}${i}" value="${s}" min="0" step="${passo}" inputmode="decimal" aria-label="Stop em pontos, linha ${i + 1}"></td>
      <td><strong class="num" id="${prefixo}c${i}">—</strong></td>
      <td class="num" id="${prefixo}f${i}">—</td></tr>`).join('');
  }
  function montarDias() {
    let h = '';
    for (let i = 0; i < DIAS; i++) {
      h += `<tr id="linha${i}">
        <td>Dia ${i + 1}</td>
        <td><input type="number" id="d${i}" step="10" inputmode="decimal" aria-label="Resultado do dia ${i + 1} em reais"></td>
        <td class="dia-col"><span class="pill" id="s${i}">-</span></td>
        <td class="num dia-col" id="p${i}">-</td>
        <td class="num dia-col" id="b${i}">-</td>
        <td class="num dia-col" id="m${i}">-</td>
        <td class="dia-toggle"><button type="button" class="btn" data-dia="${i}" aria-expanded="false" aria-controls="detalhe${i}" aria-label="Detalhes do dia ${i + 1}">Ver</button></td></tr>
        <tr class="dia-extra" id="detalhe${i}" hidden><td colspan="7"><dl>
          <dt>Situação</dt><dd id="ds${i}">—</dd><dt>% do dia</dt><dd id="dp${i}">—</dd><dt>Saldo</dt><dd id="db${i}">—</dd><dt>% da meta</dt><dd id="dm${i}">—</dd>
        </dl></td></tr>`;
    }
    $('tDias').innerHTML = h;
  }

  function lerParametros() {
    const resultados = [];
    for (let i = 0; i < DIAS; i++) {
      const raw = $('d' + i).value;
      resultados.push(raw === '' ? null : num($('d' + i), null));
    }
    return {
      cap: Math.max(0, num($('cap'), 0)),
      metaPct: Math.max(0, num($('meta'), 0)),
      riscoPct: Math.max(0, num($('risco'), 0)),
      ddPct: Math.max(0, num($('dd'), 0)),
      stopsWin: STOPS_WIN.map((d, i) => num($('w' + i), d)),
      stopsWdo: STOPS_WDO.map((d, i) => num($('o' + i), d)),
      resultados
    };
  }

  /* ---------- Gráficos ---------- */
  function desenharBarras(r) {
    const W = 600, H = 240, pl = 62, pr = 8, pt = 12, pb = 26;
    const vals = r.linhas.map((l) => l.v || 0);
    const maxP = Math.max(1, ...vals), maxN = Math.max(1, ...vals.map((v) => -v));
    const ph = H - pt - pb;
    const y0 = pt + ph * (maxP / (maxP + maxN));
    const k = (y0 - pt) / maxP;
    const step = (W - pl - pr) / DIAS, bw = step * 0.62;
    let o = '';
    [maxP, 0, -maxN].forEach((t) => {
      const y = y0 - t * k;
      o += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)"/>`;
      o += `<text x="${pl - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="var(--muted)">${brl0(t)}</text>`;
    });
    vals.forEach((v, i) => {
      const cx = pl + step * i + step / 2;
      if (v !== 0) {
        const h = Math.abs(v) * k;
        o += `<rect x="${cx - bw / 2}" y="${v > 0 ? y0 - h : y0}" width="${bw}" height="${Math.max(1, h)}" rx="3" fill="${v > 0 ? 'var(--green)' : 'var(--red)'}"/>`;
      }
      o += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${i + 1}</text>`;
    });
    o += `<line x1="${pl}" x2="${W - pr}" y1="${y0}" y2="${y0}" stroke="var(--ink)" stroke-width="1.5"/>`;
    $('chBar').innerHTML = o;
  }

  function desenharPizza(r) {
    const cx = 110, cy = 100, R = 88, r0 = 54;
    const tot = r.gains + r.losses;
    let o = '';
    if (tot === 0) {
      o += `<circle cx="${cx}" cy="${cy}" r="${(R + r0) / 2}" fill="none" stroke="var(--line)" stroke-width="${R - r0}"/>`;
      o += `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="16" fill="var(--muted)">Sem operações</text>`;
    } else {
      const frac = r.gains / tot;
      const arc = (a0, a1, cor) => {
        if (a1 - a0 >= Math.PI * 2 - 1e-6) return `<circle cx="${cx}" cy="${cy}" r="${(R + r0) / 2}" fill="none" stroke="${cor}" stroke-width="${R - r0}"/>`;
        const p = (a, rad) => [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
        const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0);
        const big = a1 - a0 > Math.PI ? 1 : 0;
        return `<path d="M${x0} ${y0} A${R} ${R} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${big} 0 ${x3} ${y3} Z" fill="${cor}"/>`;
      };
      const ag = frac * Math.PI * 2;
      if (r.gains) o += arc(0, ag, 'var(--green)');
      if (r.losses) o += arc(ag, Math.PI * 2, 'var(--red)');
      o += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ink)" font-family="Archivo, sans-serif">${Math.round(frac * 100)}%</text>`;
      o += `<text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="13" fill="var(--muted)">de acerto</text>`;
    }
    o += `<text x="250" y="72" font-size="15" fill="var(--muted)">Dias com gain</text><text x="250" y="100" font-size="26" font-weight="800" fill="var(--green)" font-family="Archivo, sans-serif">${r.gains}</text>`;
    o += `<text x="250" y="134" font-size="15" fill="var(--muted)">Dias com loss</text><text x="250" y="162" font-size="26" font-weight="800" fill="var(--red)" font-family="Archivo, sans-serif">${r.losses}</text>`;
    $('chPie').innerHTML = o;
  }

  /* ---------- Render ---------- */
  function render() {
    const p = lerParametros();
    const r = calcular(p);

    $('kRisco').textContent = brl(r.risco);
    $('kDD').textContent = brl(-r.dd);
    $('kMeta').textContent = brl(r.metaR);
    $('kMetaPct').textContent = p.metaPct.toLocaleString('pt-BR') + '% sobre ' + brl0(p.cap);
    $('kStops').textContent = r.risco > 0 ? String(Math.floor(r.dd / r.risco + 1e-9)) : '—';
    const entradas = { ...Object.fromEntries(campos.map(id => [id, $(id).value])), stopsWin: p.stopsWin, stopsWdo: p.stopsWdo, exemplo };
    ultimo = { pagina: 'ger', dados: { cap: p.cap, metaPct: p.metaPct, riscoPct: p.riscoPct, ddPct: p.ddPct, risco: r.risco, dd: r.dd, metaR: r.metaR, stopsWin: p.stopsWin, stopsWdo: p.stopsWdo, entradas, exemplo } };
    const salvo = window.PlanoCartao && window.PlanoCartao.salvar('ger', ultimo.dados);
    $('planoEstado').textContent = (exemplo ? 'Exemplo ilustrativo' : 'Meu gerenciamento') + (salvo ? ' · limites salvos neste navegador por 30 dias' : ' · armazenamento indisponível; mantenha a página aberta');
    const pq = window.PlanoCartao && window.PlanoCartao.ler().pq;
    const relacao = $('relacaoLimites');
    relacao.className = 'hint' + (pq && (pq.orc <= 0 || r.risco > pq.stopEf) ? ' neg' : '');
    relacao.textContent = !pq ? 'Defina o limite diário na página Paraquedas para comparar com o risco por operação.' : pq.orc <= 0 ? 'O Paraquedas está sem orçamento. Nenhuma operação cabe no gerenciamento combinado.' : r.risco > pq.stopEf ? 'Risco por operação maior que o limite diário de ' + brl(pq.stopEf) + '. Ajuste os limites antes de operar.' : r.risco > 0 ? 'Limite diário ' + brl(pq.stopEf) + ' · até ' + Math.floor(pq.stopEf / r.risco + 1e-9) + ' perdas completas por dia.' : 'Defina um risco por operação maior que zero.';

    let algumZero = false;
    r.win.forEach((x, i) => { const c = $('wc' + i); c.textContent = x.c; c.classList.toggle('zero', x.c === 0); $('wf' + i).textContent = brl(x.fin); if (x.c === 0) algumZero = true; });
    r.wdo.forEach((x, i) => { const c = $('oc' + i); c.textContent = x.c; c.classList.toggle('zero', x.c === 0); $('of' + i).textContent = brl(x.fin); if (x.c === 0) algumZero = true; });
    $('warnCtr').hidden = !algumZero;

    r.linhas.forEach((l, i) => {
      const s = $('s' + i);
      s.textContent = l.sit;
      s.className = 'pill' + (l.sit === 'Gain' ? ' gain' : l.sit === 'Loss' ? ' loss' : '');
      $('p' + i).textContent = l.pctDia === null ? '-' : pct(l.pctDia, 2);
      $('p' + i).className = 'num dia-col' + (l.v > 0 ? ' pos' : l.v < 0 ? ' neg' : '');
      $('b' + i).textContent = l.saldo === null ? '-' : brl(l.saldo);
      $('m' + i).textContent = l.pctMeta === null ? '-' : pct(l.pctMeta, 0);
      ['s', 'p', 'b', 'm'].forEach(prefixo => $('d' + prefixo + i).textContent = $(prefixo + i).textContent);
      const linha = $('linha' + i);
      linha.classList.toggle('dia-limite', r.primeiroLimite === i + 1);
      linha.classList.toggle('dia-apos', r.primeiroLimite !== null && i + 1 > r.primeiroLimite && l.v !== null);
      linha.title = r.primeiroLimite === i + 1 ? 'Limite de perda atingido neste dia' : r.primeiroLimite !== null && i + 1 > r.primeiroLimite && l.v !== null ? 'Lançamento após o limite: fora da regra do gerenciamento' : '';
      if (linha.title) $('ds' + i).textContent += ' · ' + linha.title;
    });

    $('sSaldo').textContent = brl(r.saldo);
    const sr = $('sRes');
    sr.textContent = (r.total >= 0 ? '+' : '') + brl(r.total) + ' no período';
    sr.className = r.total > 0 ? 'pos' : r.total < 0 ? 'neg' : '';
    $('sMeta').textContent = pct(r.pctMetaFinal, 0);
    $('bMeta').style.width = Math.max(0, Math.min(1, r.pctMetaFinal)) * 100 + '%';
    const usado = r.dd > 0 ? r.maiorPerda / r.dd : 0;
    $('sDD').textContent = pct(Math.min(usado, 9.99), 0);
    $('bDD').style.width = Math.min(1, usado) * 100 + '%';
    const tot = r.gains + r.losses;
    $('sAcerto').textContent = tot ? Math.round(100 * r.gains / tot) + '%' : '—';
    $('sGL').textContent = r.gains + ' gain · ' + r.losses + ' loss';

    $('alerta').hidden = !r.alerta;
    if (r.alerta) $('alertaTxt').textContent = 'Limite de perda atingido no dia ' + r.primeiroLimite + ' (' + brl(r.totalNoLimite) + '). O período deveria encerrar nesse dia.' + (r.aposLimite ? ' Há ' + r.aposLimite + ' lançamento(s) posterior(es), fora da regra do gerenciamento. Ganhos posteriores não apagam esse limite.' : ' Pare e revise o gerenciamento.');

    desenharBarras(r);
    desenharPizza(r);
  }

  /* ---------- Cenários de acerto ----------
     Regra: 1 operação por dia; perda = risco por operação (stop respeitado);
     gain = 2x, 3x ou alternando 3x e 2x o risco ("misto"). É um norte, não uma promessa. */
  let payoff = 'mix';
  let ordem = [];

  function multiplicador(k) { return payoff === 'mix' ? (k % 2 === 0 ? 3 : 2) : Number(payoff); }
  function payoffMedio() { return payoff === 'mix' ? 2.5 : Number(payoff); }
  function nGains(acerto) { return Math.round(DIAS * acerto / 100); }
  function resultadoCenario(acerto, risco) {
    const g = nGains(acerto);
    let soma = 0;
    for (let k = 0; k < g; k++) soma += multiplicador(k) * risco;
    return { g, l: DIAS - g, total: soma - (DIAS - g) * risco };
  }
  function sortearOrdem() {
    ordem = Array.from({ length: DIAS }, (_, i) => i);
    for (let i = ordem.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
  }
  function cenarioAtivo() { const v = $('cenAcerto').value; return v === 'livre' ? null : Number(v); }

  function preencherCenario() {
    const acerto = cenarioAtivo();
    if (acerto === null) return;
    const risco = lerParametros().cap * lerParametros().riscoPct / 100;
    const g = nGains(acerto);
    const vals = new Array(DIAS).fill(-risco);
    for (let k = 0; k < g; k++) vals[ordem[k]] = multiplicador(k) * risco;
    const limite = lerParametros().cap * lerParametros().ddPct / 100;
    let total = 0, encerrou = false;
    for (let i = 0; i < DIAS; i++) {
      const valor = Math.round(vals[i] * 100) / 100;
      $('d' + i).value = encerrou ? '' : valor;
      if (!encerrou) { total += valor; if (limite > 0 && total <= -limite) encerrou = true; }
    }
  }

  function atualizarCenarios() {
    const p = lerParametros();
    const risco = p.cap * p.riscoPct / 100;
    const acerto = cenarioAtivo();
    cenarioAnterior = $('cenAcerto').value;
    const empate = 100 / (1 + payoffMedio());
    const nomePay = payoff === 'mix' ? 'gains de 2 a 3 vezes o stop' : 'gain de ' + payoff + ' para 1';
    $('empate').textContent = 'Com ' + nomePay + ', o empate fica em ' + empate.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% de acerto, antes de custos e sem aplicar o limite do período.';
    $('matriz').innerHTML = ACERTOS.map((a) => {
      const r = resultadoCenario(a, risco);
      const cls = r.total > 0 ? 'pos' : r.total < 0 ? 'neg' : 'nul';
      return `<button type="button" class="cel ${cls}" data-a="${a}" aria-pressed="${a === acerto}"><b>${a}%</b><span>${(r.total > 0 ? '+' : '') + brl0(r.total)}</span><small>${r.g} gains · ${r.l} stops</small></button>`;
    }).join('');
    const l = $('licao');
    if (acerto === null) {
      l.className = 'licao zero';
      l.innerHTML = 'Você está usando seus próprios resultados. Escolha um cenário para comparar com o stop respeitado.';
      return;
    }
    const realizado = calcular(p);
    if (realizado.alerta) {
      l.className = 'licao ko';
      l.textContent = 'Cenário encerrado no dia ' + realizado.primeiroLimite + ': o limite de perda foi atingido. Resultado até a parada: ' + brl(realizado.total) + '. As operações seguintes não foram realizadas. A comparação abaixo é teórica e não aplica esse limite.';
      return;
    }
    const r = resultadoCenario(acerto, risco);
    const ganhos = payoff === 'mix' ? 'gains de ' + brl0(2 * risco) + ' a ' + brl0(3 * risco) : 'gains de ' + brl0(Number(payoff) * risco);
    l.className = 'licao ' + (r.total > 0 ? 'ok' : r.total < 0 ? 'ko' : 'zero');
    const fecho = r.total > 0 ? 'Com disciplina, mesmo acertando menos da metade das vezes, o mês fecha no positivo.'
      : r.total < 0 ? 'Abaixo do empate, o stop respeitado limita o estrago: a perda fica controlada e o patrimônio sobrevive.'
      : 'Empate: errando a maior parte das vezes, o stop respeitado segurou o mês no zero a zero.';
    l.innerHTML = '<strong>' + acerto + '% de acerto:</strong> ' + r.g + ' ' + ganhos + ' e ' + r.l + ' stops de ' + brl0(risco) +
      '. Resultado do mês: <strong>' + (r.total > 0 ? '+' : '') + brl0(r.total) + '</strong>. ' + (acerto >= 50 && r.total > 0 ? 'Com acerto alto, o stop protege o que você ganhou.' : fecho);
  }

  function aplicarCenario() { preencherCenario(); render(); atualizarCenarios(); }
  function guardarResultados() {
    if (cenarioAnterior !== 'livre') return;
    const valores = Array.from({ length: DIAS }, (_, i) => $('d' + i).value);
    if (!valores.some(v => v !== '')) return;
    desfazer = { valores, payoff, ordem: [...ordem] };
    $('btnDesfazer').hidden = false;
  }
  function limpar() {
    guardarResultados();
    for (let i = 0; i < DIAS; i++) $('d' + i).value = '';
    $('cenAcerto').value = 'livre';
    render(); atualizarCenarios();
  }

  montarStops('tWin', STOPS_WIN, 'w', 10);
  montarStops('tWdo', STOPS_WDO, 'o', 0.5);
  montarDias();
  function restaurar(e) {
    campos.forEach(id => { if (e[id] !== undefined && Number.isFinite(Number(e[id])) && Number(e[id]) >= 0) $(id).value = e[id]; });
    [['stopsWin', 'w'], ['stopsWdo', 'o']].forEach(([chave, prefixo]) => {
      if (Array.isArray(e[chave])) e[chave].slice(0, 6).forEach((v, i) => { if (Number.isFinite(v) && v >= 0) $(prefixo + i).value = v; });
    });
    exemplo = e.exemplo === true;
  }
  const salvo = window.PlanoCartao && window.PlanoCartao.ler().ger;
  if (salvo) restaurar(salvo.entradas || { cap: salvo.cap, meta: salvo.metaPct, risco: salvo.riscoPct, dd: salvo.ddPct, stopsWin: salvo.stopsWin, stopsWdo: salvo.stopsWdo });
  $('btnExemplo').addEventListener('click', () => {
    if (!exemplo && !window.confirm('Substituir os limites do seu gerenciamento pelos valores de exemplo? Os resultados próprios serão mantidos.')) return;
    restaurar({ ...padrao, stopsWin: STOPS_WIN, stopsWdo: STOPS_WDO, exemplo: true });
    if (cenarioAtivo() !== null) aplicarCenario(); else { render(); atualizarCenarios(); }
  });
  $('btnDesfazer').addEventListener('click', () => {
    if (!desfazer) return;
    desfazer.valores.forEach((v, i) => $('d' + i).value = v);
    payoff = desfazer.payoff; ordem = [...desfazer.ordem]; $('cenAcerto').value = 'livre';
    document.querySelectorAll('#payoff button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.v === payoff)));
    desfazer = null; $('btnDesfazer').hidden = true; render(); atualizarCenarios();
  });
  $('tDias').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-dia]'); if (!btn) return;
    const aberto = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(aberto)); btn.textContent = aberto ? 'Fechar' : 'Ver';
    $('detalhe' + btn.dataset.dia).hidden = !aberto;
  });
  document.addEventListener('input', (e) => {
    if (!e.target.matches('input')) return;
    if (/^d\d+$/.test(e.target.id)) { $('cenAcerto').value = 'livre'; render(); atualizarCenarios(); return; }
    exemplo = false;
    if (['cap', 'risco', 'dd'].includes(e.target.id) && cenarioAtivo() !== null) { aplicarCenario(); return; }
    render(); atualizarCenarios();
  });
  $('formMeta').addEventListener('submit', (e) => e.preventDefault());
  $('cenAcerto').addEventListener('change', () => { guardarResultados(); aplicarCenario(); });
  $('matriz').addEventListener('click', (e) => {
    const b = e.target.closest('.cel'); if (!b) return;
    guardarResultados(); $('cenAcerto').value = b.dataset.a; aplicarCenario();
  });
  document.querySelectorAll('#payoff button').forEach((btn) => btn.addEventListener('click', () => {
    payoff = btn.dataset.v;
    document.querySelectorAll('#payoff button').forEach((b2) => b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false'));
    if (cenarioAtivo() === null) { atualizarCenarios(); } else { aplicarCenario(); }
  }));
  $('btnSortear').addEventListener('click', () => { guardarResultados(); sortearOrdem(); if (cenarioAtivo() === null) $('cenAcerto').value = '35'; aplicarCenario(); });
  $('btnLimpar').addEventListener('click', limpar);
  if (window.PlanoCartao) window.PlanoCartao.ligar('btnCartao', () => ultimo);
  sortearOrdem();
  aplicarCenario();
})();
