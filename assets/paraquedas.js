/* Paraquedas do Trader Indisciplinado — calculadora em 3 passos (obrigações, renda para o risco, resultado com semáforo) e simulação de 12 meses.
   Verde = renda nova do mês destinada ao risco (qualquer fonte). Âmbar = saque do que já estava guardado. */
(function () {
  const $ = (id) => document.getElementById(id);
  const brl = (v) => (v < 0 ? '−' : '') + 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
  const SEQ = [0.40, -0.60, 0.80, -0.30, 0.50, -1.00, 0.60, 0.50, -0.40, 0.90, -0.30, 0.70];
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let reinv = 0.5;
  let ultimo = null;

  function num(id, def) { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : def; }

  /* Tipos de renda extra (rendas que NÃO entraram no passo 1) */
  const TIPOS = {
    aluguel: { nome: 'Aluguel', dica: 'Valor que sobra para você, depois de IR, IPTU, condomínio e administração.' },
    dividendos: { nome: 'Dividendos e proventos', dica: 'Use a média dos meses mais fracos.' },
    extra: { nome: 'Renda extra ou freela', dica: 'Use o menor valor dos últimos meses, não o melhor.' },
    prolabore: { nome: 'Pró-labore', dica: 'Só se não estiver na renda do passo 1.' },
    outra: { nome: 'Outra renda', dica: 'Valor líquido, o que de fato entra.' }
  };
  let reserva = 'completa';
  let seqExtra = 0;

  function addRenda(tipo, valor, pct) {
    const id = ++seqExtra;
    const div = document.createElement('div');
    div.className = 'fonte fonte-extra';
    div.dataset.id = id;
    div.innerHTML = `
      <div class="fonte-top">
        <select id="xt${id}" aria-label="Tipo de renda">${Object.keys(TIPOS).map(k => `<option value="${k}"${k === tipo ? ' selected' : ''}>${TIPOS[k].nome}</option>`).join('')}</select>
        <button type="button" class="btn-rem" aria-label="Remover esta renda">×</button>
      </div>
      <div class="fonte-grid">
        <div class="field"><label for="xv${id}">Recebe por mês (R$)</label><input type="number" id="xv${id}" min="0" step="50" value="${valor}" inputmode="numeric"></div>
        <div class="field"><label for="xp${id}">Vai para o risco <output id="xpo${id}" for="xp${id}">${pct}%</output></label><input type="range" id="xp${id}" min="0" max="100" step="5" value="${pct}"></div>
      </div>
      <span class="hint" id="xd${id}">${TIPOS[tipo].dica}</span>`;
    $('extras').appendChild(div);
    div.querySelector('select').addEventListener('change', (e) => { $('xd' + id).textContent = TIPOS[e.target.value].dica; render(); });
    div.querySelector('.btn-rem').addEventListener('click', () => { div.remove(); $('btnAddRenda').hidden = false; render(); });
    $('btnAddRenda').hidden = $('extras').children.length >= 4;
    return div;
  }

  function base() {
    const renda = num('renda', 0), contas = num('contas', 0);
    const sobra = renda - contas;
    const pat = num('pat', 0), cdi = num('cdi', 0), ir = parseFloat($('ir').value);
    const taxaMes = Math.pow(1 + cdi / 100, 1 / 12) - 1;
    const rendAplic = pat * taxaMes * (1 - ir / 100);
    const pctSobra = num('pctSobra', 0);
    const daSobra = Math.max(0, sobra) * pctSobra / 100;
    const extras = [...$('extras').children].map((d) => {
      const id = d.dataset.id;
      const tipo = $('xt' + id).value, valor = num('xv' + id, 0), pct = num('xp' + id, 0);
      return { tipo, nome: TIPOS[tipo].nome, valor, pct, risco: valor * pct / 100 };
    });
    const daExtras = extras.reduce((a, x) => a + x.risco, 0);
    const saque = num('saque', 0);
    const verde = rendAplic + daSobra + daExtras;
    const stop = num('stop', 100), pts = num('pts', 190000);
    return { renda, contas, sobra, pat, rendAplic, pctSobra, daSobra, extras, daExtras, saque,
             rend: verde, comp: saque, orc: verde + saque, stop, noc: pts * 0.20 };
  }

  /* Semáforo: vermelho = contas não fecham, ou saque sem reserva; âmbar = reserva incompleta ou saque; verde = ok */
  function semaforo(b) {
    const msgs = [];
    let cor = 'verde';
    if (b.sobra < 0) { cor = 'vermelho'; msgs.push('Suas contas (' + brl(b.contas) + ') são maiores que a renda (' + brl(b.renda) + '). Feche o mês no azul antes de arriscar.'); }
    if (b.saque > 0 && reserva === 'nao') { cor = 'vermelho'; msgs.push('Você está sacando ' + brl(b.saque) + ' do que guardou, sem ter reserva de emergência.'); }
    if (reserva !== 'completa') {
      if (cor !== 'vermelho') cor = 'ambar';
      msgs.push(reserva === 'nao' ? 'Monte uma reserva de emergência antes de aumentar o risco. Até lá, mantenha o orçamento pequeno.' : 'Complete a reserva de emergência. Enquanto isso, prefira um orçamento menor.');
    }
    if (b.saque > 0 && reserva !== 'nao') { if (cor !== 'vermelho') cor = 'ambar'; msgs.push(brl(b.saque) + ' saem do que já estava guardado: essa parte não tem paraquedas.'); }
    const tit = cor === 'verde' ? 'Sinal verde' : cor === 'ambar' ? 'Sinal amarelo: atenção' : 'Sinal vermelho: pare e reorganize';
    if (cor === 'verde') msgs.push('Contas cobertas, reserva completa e risco só com dinheiro novo do mês.');
    return { cor, tit, msgs };
  }

  function simular(b) {
    let reforco = 0, guardado = 0, compPerdido = 0, total = 0;
    const meses = SEQ.map((r, i) => {
      const orc = b.orc + reforco;
      const res = r * orc;
      total += res;
      if (res > 0) { reforco += res * reinv; guardado += res * (1 - reinv); }
      else if (res < 0) {
        const perda = -res;
        const daBase = Math.min(perda, b.orc);
        const doRend = Math.min(daBase, b.rend);
        compPerdido += daBase - doRend;
        reforco = Math.max(0, reforco - Math.max(0, perda - b.orc));
      }
      return { n: i + 1, orc, res, alav: orc > 0 ? b.noc / orc : 0 };
    });
    return { meses, total, guardado, compPerdido, orcFinal: b.orc + reforco };
  }

  function drawSim(s) {
    const W = 900, H = 360, padL = 60, padR = 16, padT = 20, padB = 34;
    const maxPos = Math.max(1, ...s.meses.map(m => Math.max(m.res, m.orc)));
    const maxNeg = Math.max(1, ...s.meses.map(m => Math.max(0, -m.res)));
    const plotH = H - padT - padB;
    const y0 = padT + plotH * (maxPos / (maxPos + maxNeg));
    const k = (y0 - padT) / maxPos;
    const step = (W - padL - padR) / 12, bw = step * 0.56;
    let out = '';
    const ticks = [maxPos, maxPos / 2, 0, -maxNeg];
    ticks.forEach(t => {
      const y = y0 - t * k;
      out += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
      out += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="var(--muted)">${brl(t)}</text>`;
    });
    s.meses.forEach((m, i) => {
      const cx = padL + step * i + step / 2;
      const h = Math.abs(m.res) * k;
      const y = m.res >= 0 ? y0 - h : y0;
      const c = m.res >= 0 ? 'var(--green)' : 'var(--red)';
      out += `<rect x="${cx - bw / 2}" y="${y}" width="${bw}" height="${Math.max(1, h)}" rx="4" fill="${c}"/>`;
      out += `<text x="${cx}" y="${H - 10}" text-anchor="middle" font-size="13" fill="var(--muted)">${MESES[i]}</text>`;
    });
    const pts = s.meses.map((m, i) => `${padL + step * i + step / 2},${y0 - m.orc * k}`).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>`;
    s.meses.forEach((m, i) => { out += `<circle cx="${padL + step * i + step / 2}" cy="${y0 - m.orc * k}" r="4" fill="var(--ink)"/>`; });
    out += `<line x1="${padL}" x2="${W - padR}" y1="${y0}" y2="${y0}" stroke="var(--ink)" stroke-width="1.5"/>`;
    $('simChart').innerHTML = out;
  }

  function drawLev(s) {
    const W = 900, H = 240, padL = 60, padR = 40, padT = 24, padB = 34;
    const maxA = Math.max(1, ...s.meses.map(m => m.alav));
    const step = (W - padL - padR) / 11;
    const yOf = (a) => padT + (H - padT - padB) * (1 - a / maxA);
    let out = '';
    [maxA, maxA / 2, 0].forEach(t => {
      out += `<line x1="${padL}" x2="${W - padR}" y1="${yOf(t)}" y2="${yOf(t)}" stroke="var(--line)"/>`;
      out += `<text x="${padL - 8}" y="${yOf(t) + 4}" text-anchor="end" font-size="12" fill="var(--muted)">${t.toFixed(0)}x</text>`;
    });
    const pts = s.meses.map((m, i) => `${padL + step * i},${yOf(m.alav)}`).join(' ');
    out += `<polygon points="${padL},${yOf(0)} ${pts} ${padL + step * 11},${yOf(0)}" fill="var(--green-soft)"/>`;
    out += `<polyline points="${pts}" fill="none" stroke="var(--green)" stroke-width="3" stroke-linejoin="round"/>`;
    s.meses.forEach((m, i) => {
      const x = padL + step * i;
      out += `<text x="${x}" y="${H - 10}" text-anchor="middle" font-size="13" fill="var(--muted)">${MESES[i]}</text>`;
    });
    const first = s.meses[0], last = s.meses[11];
    out += `<circle cx="${padL}" cy="${yOf(first.alav)}" r="5" fill="var(--green)"/><text x="${padL + 10}" y="${yOf(first.alav) - 8}" font-size="14" font-weight="700" fill="var(--ink)">${first.alav.toFixed(1).replace('.', ',')}x</text>`;
    out += `<circle cx="${padL + step * 11}" cy="${yOf(last.alav)}" r="5" fill="var(--green)"/><text x="${padL + step * 11}" y="${yOf(last.alav) - 10}" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)">${last.alav.toFixed(1).replace('.', ',')}x</text>`;
    $('levChart').innerHTML = out;
  }

  function render() {
    const b = base();
    $('stopOut').textContent = brl(b.stop);
    const orc = b.orc;
    const ks = $('kSobra'); ks.textContent = brl(b.sobra); ks.className = 'num' + (b.sobra < 0 ? ' neg' : '');
    $('pctSobraOut').textContent = b.pctSobra + '%';
    document.querySelectorAll('#extras input[type="range"]').forEach((r) => { const o = $('xpo' + r.id.slice(2)); if (o) o.textContent = r.value + '%'; });
    const sem = semaforo(b);
    $('semaforo').className = 'semaforo ' + sem.cor;
    $('semTit').textContent = sem.tit;
    $('semMsgs').innerHTML = sem.msgs.map((m) => '<li>' + m + '</li>').join('');
    const comp = [];
    if (b.rendAplic > 0) comp.push(['Rendimento de aplicação', b.rendAplic]);
    if (b.daSobra > 0) comp.push([b.pctSobra + '% da sobra do mês', b.daSobra]);
    b.extras.forEach((x) => { if (x.risco > 0) comp.push([x.pct + '% de ' + x.nome.toLowerCase(), x.risco]); });
    if (b.saque > 0) comp.push(['Saque do patrimônio (sem paraquedas)', b.saque]);
    $('composicao').innerHTML = comp.map((c) => '<li><span>' + c[0] + '</span><b>' + brl(c[1]) + '</b></li>').join('');
    $('bbG').style.flexGrow = Math.max(b.rend, 0.0001);
    $('bbA').style.flexGrow = Math.max(b.comp, 0.0001);
    $('bbA').hidden = b.comp <= 0;
    $('bbG').hidden = b.rend <= 0;
    $('bbGv').textContent = brl(b.rend);
    $('bbAv').textContent = brl(b.comp);
    $('kOrc').textContent = brl(orc);
    $('kProt').textContent = orc > 0 ? Math.round(100 * b.rend / orc) + '% com paraquedas' : '—';

    const diasRaw = b.stop > 0 ? Math.floor(orc / b.stop) : 0;
    const dias = Math.min(20, diasRaw);
    const stopEf = diasRaw > 20 ? orc / 20 : b.stop;
    $('kDias').textContent = dias + (dias === 1 ? ' dia' : ' dias');
    $('kStopEf').textContent = diasRaw > 20 ? 'stop sobe para ' + brl(stopEf) + '/dia' : 'stop de ' + brl(stopEf) + '/dia';
    $('kPts').textContent = Math.round(stopEf / 0.20).toLocaleString('pt-BR') + ' pts';
    $('kAlav').textContent = orc > 0 ? (b.noc / orc).toFixed(1).replace('.', ',') + 'x' : '—';
    $('kNoc').textContent = '1 WIN ≈ ' + brl(b.noc);
    ultimo = { pagina: 'pq', dados: { orc, saque: b.saque, rend: b.rend, stopEf, dias, semCor: sem.cor, semTit: sem.tit } };
    if (window.PlanoCartao) window.PlanoCartao.salvar('pq', ultimo.dados);
    $('days').innerHTML = Array.from({ length: 20 }, (_, i) => `<i class="${i < dias ? 'on' : ''}"></i>`).join('');

    const w = $('warn');
    if (orc <= 0) { w.textContent = 'Nenhum valor foi destinado ao risco. Informe uma aplicação, uma parte da sobra ou outra renda.'; w.hidden = false; }
    else if (dias === 0) { w.textContent = 'O orçamento (' + brl(orc) + ') é menor que o stop diário. Diminua o stop ou destine mais renda ao risco.'; w.hidden = false; }
    else if (dias < 5) { w.textContent = 'Poucos dias no mês. Tudo bem para começar: com meses positivos, o orçamento cresce.'; w.hidden = false; }
    else w.hidden = true;

    $('pPat').textContent = b.saque > 0 ? brl(b.pat) + ' → ' + brl(Math.max(0, b.pat - b.saque)) : brl(b.pat);
    $('pRend').textContent = brl(b.rend);
    $('pComp').textContent = brl(b.comp);

    const s = simular(b);
    drawSim(s); drawLev(s);
    const r = $('sRes'); r.textContent = (s.total >= 0 ? '+' : '') + brl(s.total); r.className = 'num ' + (s.total >= 0 ? 'pos' : 'neg');
    $('sGuard').textContent = brl(s.guardado);
    $('sOrc').textContent = brl(s.meses[0].orc) + ' → ' + brl(s.meses[11].orc);
    $('sComp').textContent = brl(s.compPerdido);
  }

  $('form').addEventListener('input', render);
  $('form').addEventListener('change', render);
  $('btnAddRenda').addEventListener('click', () => { const d = addRenda('aluguel', 1000, 20); d.querySelector('select').focus(); render(); });
  document.querySelectorAll('#reserva button').forEach((btn) => btn.addEventListener('click', () => {
    reserva = btn.dataset.v;
    document.querySelectorAll('#reserva button').forEach((b2) => b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false'));
    render();
  }));
  $('form').addEventListener('submit', (e) => e.preventDefault());
  document.querySelectorAll('#reinv button').forEach(btn => btn.addEventListener('click', () => {
    reinv = parseFloat(btn.dataset.v);
    document.querySelectorAll('#reinv button').forEach(b2 => b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false'));
    render();
  }));
  if (window.PlanoCartao) window.PlanoCartao.ligar('btnCartao', () => ultimo);
  render();
})();
