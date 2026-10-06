/* Paraquedas do Trader Indisciplinado — calculadora em 3 passos (obrigações, renda para o risco, resultado com semáforo) e simulação de 12 meses.
   Verde = renda nova do mês destinada ao risco (qualquer fonte). Vermelho/âmbar = dinheiro retirado do patrimônio (má decisão). */
(function () {
  const $ = (id) => document.getElementById(id);
  const brl = (v) => (v < 0 ? '−' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
  const SEQ = [0.40, -0.60, 0.80, -0.30, 0.50, -1.00, 0.60, 0.50, -0.40, 0.90, -0.30, 0.70];
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let reinv = 0.5;
  let ultimo = null;
  let exemplo = true;
  const campos = ['renda', 'contas', 'pat', 'cdi', 'ir', 'saque', 'stop', 'pts'];
  const padrao = Object.fromEntries(campos.map(id => [id, $(id).value]));

  function num(id, def) { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : def; }

  /* Tipos de renda extra (rendas que NÃO entraram no passo 1) */
  const TIPOS = {
    aluguel: { nome: 'Aluguel', dica: 'Só inclua se não entrou na renda do passo 1. Valor líquido após os custos do imóvel.' },
    dividendos: { nome: 'Dividendos e proventos', dica: 'Use a média dos meses mais fracos.' },
    extra: { nome: 'Renda extra ou freela', dica: 'Use o menor valor dos últimos meses, não o melhor.' },
    prolabore: { nome: 'Pró-labore', dica: 'Só se não estiver na renda do passo 1.' },
    outra: { nome: 'Outra renda', dica: 'Valor líquido, o que de fato entra.' }
  };
  let reserva = 'completa';
  let fracSobra = 0.30;        /* fração da sobra destinada ao risco: mantida quando a sobra muda */
  /* O limite diário só muda por uma ação explícita nesta página. */
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
    div.querySelector('.btn-rem').addEventListener('click', () => { div.remove(); $('btnAddRenda').hidden = false; exemplo = false; render(); });
    $('btnAddRenda').hidden = $('extras').children.length >= 4;
    return div;
  }

  function base() {
    const renda = num('renda', 0), contas = num('contas', 0);
    const sobra = renda - contas;
    const pat = num('pat', 0), cdi = num('cdi', 0), ir = parseFloat($('ir').value);
    const taxaMes = Math.pow(1 + cdi / 100, 1 / 12) - 1;
    const rendAplic = pat * taxaMes * (1 - ir / 100);
    const daSobra = Math.round(Math.max(0, sobra) * fracSobra * 100) / 100;
    const pctSobra = Math.round(fracSobra * 100);
    const extras = [...$('extras').children].map((d) => {
      const id = d.dataset.id;
      const tipo = $('xt' + id).value, valor = num('xv' + id, 0), pct = num('xp' + id, 0);
      return { tipo, nome: TIPOS[tipo].nome, valor, pct, risco: valor * pct / 100 };
    });
    const daExtras = extras.reduce((a, x) => a + x.risco, 0);
    const saque = num('saque', 0);
    const verde = rendAplic + daSobra + daExtras;
    const stop = num('stop', 0), pts = num('pts', 0);
    return { renda, contas, sobra, pat, rendAplic, pctSobra, daSobra, extras, daExtras, saque,
             rend: verde, comp: saque, orc: verde + saque, stop, noc: pts * 0.20 };
  }

  /* Semáforo: vermelho = contas não fecham, ou saque sem reserva; âmbar = reserva incompleta ou saque; verde = ok */
  function semaforo(b) {
    const msgs = [];
    let cor = 'verde';
    if (b.sobra < 0) { cor = 'vermelho'; msgs.push('Suas contas (' + brl(b.contas) + ') são maiores que a renda (' + brl(b.renda) + '). Feche o mês no azul antes de arriscar.'); }
    if (b.saque > 0 && reserva === 'nao') { cor = 'vermelho'; msgs.push('Você está retirando ' + brl(b.saque) + ' do patrimônio, sem ter reserva de emergência. Má decisão.'); }
    if (reserva !== 'completa') {
      if (cor !== 'vermelho') cor = 'ambar';
      msgs.push(reserva === 'nao' ? 'Monte uma reserva de emergência antes de aumentar o risco. Até lá, mantenha o orçamento pequeno.' : 'Complete a reserva de emergência. Enquanto isso, prefira um orçamento menor.');
    }
    if (b.saque > 0 && reserva !== 'nao') { if (cor !== 'vermelho') cor = 'ambar'; msgs.push(brl(b.saque) + ' retirados do patrimônio: má decisão, essa parte não tem paraquedas.'); }
    if (cor !== 'vermelho' && (b.orc <= 0 || b.stop <= 0)) cor = 'neutro';
    const tit = cor === 'neutro' ? (b.orc <= 0 ? 'Sem orçamento para operar' : 'Defina um limite diário') : cor === 'verde' ? 'Obrigações informadas cobertas' : cor === 'ambar' ? 'Atenção às condições do gerenciamento' : 'Pare e reorganize suas contas';
    if (cor === 'verde') msgs.push('Conforme os dados informados, as contas e a reserva estão cobertas. O orçamento pode ser perdido; este resultado não garante segurança nas operações.');
    if (cor === 'neutro') msgs.push('Defina um orçamento e um limite de perda antes de calcular operações.');
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
      out += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="var(--muted)">${brl(Math.round(t))}</text>`;
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

  /* Régua da sobra: vai de R$ 0 até a sobra calculada no passo 1; balão mostra "R$ X · Y%" */
  function atualizarRegua(b) {
    const r = $('valSobra');
    const max = Math.max(0, Math.round(b.sobra * 100) / 100);
    r.max = String(max || 0);
    r.step = '0.01';
    r.disabled = max <= 0;
    r.value = String(b.daSobra);
    const exato = $('valorSobraExato');
    exato.max = String(max); exato.disabled = max <= 0;
    if (document.activeElement !== exato || Number(exato.value) !== b.daSobra) exato.value = String(b.daSobra);
    $('reguaFim').textContent = brl(max);
    const frac = max > 0 ? Number(r.value) / max : 0;
    const balao = $('sobraBalao');
    balao.textContent = max > 0 ? brl(Number(r.value)) + ' · ' + Math.round(frac * 100) + '%' : 'Sem sobra';
    balao.style.left = 'calc(' + (frac * 100) + '% + ' + (11 - frac * 22) + 'px)';
    $('sobraHint').textContent = max > 0 ? 'É por aqui que entram salário, pró-labore e aluguel: pela sobra, depois das contas.' : 'Sem sobra no mês: nada desta parte pode ir para o risco.';
  }
  /* Risco por operação para comparação e importação explícita. */
  function stopGer() {
    const d = window.PlanoCartao ? window.PlanoCartao.ler() : {};
    return d && d.ger && d.ger.risco > 0 ? d.ger.risco : null;
  }

  function render() {
    const b = base();
    const orc = b.orc;
    const ks = $('kSobra'); ks.textContent = brl(b.sobra); ks.className = 'num' + (b.sobra < 0 ? ' neg' : '');
    atualizarRegua(b);
    document.querySelectorAll('#extras input[type="range"]').forEach((r) => { const o = $('xpo' + r.id.slice(2)); if (o) o.textContent = r.value + '%'; });
    const sem = semaforo(b);
    $('semaforo').className = 'semaforo ' + sem.cor;
    $('semTit').textContent = sem.tit;
    $('semMsgs').innerHTML = sem.msgs.map((m) => '<li>' + m + '</li>').join('');
    const comp = [];
    if (b.rendAplic > 0) comp.push(['Rendimento de aplicação', b.rendAplic]);
    if (b.daSobra > 0) comp.push([b.pctSobra + '% da sobra do mês', b.daSobra]);
    b.extras.forEach((x) => { if (x.risco > 0) comp.push([x.pct + '% de ' + x.nome.toLowerCase(), x.risco]); });
    if (b.saque > 0) comp.push(['Retirado do patrimônio (má decisão)', b.saque]);
    $('composicao').innerHTML = comp.map((c) => '<li><span>' + c[0] + '</span><b>' + brl(c[1]) + '</b></li>').join('');
    $('bbG').style.flexGrow = Math.max(b.rend, 0.0001);
    $('bbA').style.flexGrow = Math.max(b.comp, 0.0001);
    $('bbA').hidden = b.comp <= 0;
    $('bbG').hidden = b.rend <= 0;
    $('bbGv').textContent = brl(b.rend);
    $('bbAv').textContent = brl(b.comp);
    $('kOrc').textContent = brl(orc);
    $('kProt').textContent = orc > 0 ? Math.round(100 * b.rend / orc) + '% proveniente da renda do mês' : '—';

    const stopUso = orc > 0 ? Math.min(b.stop, orc) : 0;
    const sh = $('stopHint');
    if (orc > 0 && b.stop > orc) { sh.textContent = 'Seu stop não pode passar do orçamento do mês (' + brl(orc) + '). Usando ' + brl(orc) + ' = 1 dia.'; sh.classList.add('neg'); }
    else { sh.classList.remove('neg'); sh.textContent = 'Total que você aceita perder no dia, somando as operações. É diferente do risco de cada trade.'; }
    const origem = window.PlanoCartao && window.PlanoCartao.ler().ger;
    $('gerResumo').hidden = !origem;
    if (origem) $('gerResumoValores').textContent = (origem.exemplo ? 'Exemplo do Gerenciamento: ' : 'Seus limites: ') + 'capital ' + brl(origem.cap) + ' · meta ' + brl(origem.metaR) + ' · risco por operação ' + brl(origem.risco) + ' · limite do período ' + brl(origem.dd) + '.';
    const g = stopGer(); $('btnStopGer').hidden = !(g !== null && Math.abs(g - b.stop) > 0.005);
    if (g !== null) $('btnStopGer').textContent = 'Usar ' + brl(g) + ' como limite diário';
    const relacao = $('relacaoLimites');
    relacao.className = 'hint' + (g !== null && g > stopUso ? ' neg' : '');
    relacao.textContent = g === null ? 'Defina o risco por operação no Gerenciamento para comparar os dois limites.' : orc <= 0 ? 'Sem orçamento disponível: nenhuma operação cabe neste plano.' : g > stopUso ? 'O risco por operação (' + brl(g) + ') excede o limite diário (' + brl(stopUso) + '). Ajuste os limites antes de operar.' : 'Limite diário ' + brl(stopUso) + ' · risco por operação ' + brl(g) + ' · até ' + Math.floor(stopUso / g + 1e-9) + ' perdas completas por dia.';
    const diasRaw = stopUso > 0 ? Math.floor(orc / stopUso + 1e-9) : 0;
    const dias = Math.min(20, diasRaw);
    const stopEf = stopUso;
    $('kDias').textContent = dias + (dias === 1 ? ' dia' : ' dias');
    $('kStopEf').textContent = 'limite de ' + brl(stopEf) + '/dia' + (diasRaw > 20 ? ' · sobra mantida fora do risco' : '');
    $('kPts').textContent = Math.round(stopEf / 0.20).toLocaleString('pt-BR') + ' pts';
    $('kAlav').textContent = orc > 0 ? (b.noc / orc).toFixed(1).replace('.', ',') + 'x' : '—';
    $('kNoc').textContent = '1 WIN ≈ ' + brl(b.noc);
    const entradas = { ...Object.fromEntries(campos.map(id => [id, $(id).value])), fracSobra, reserva, reinv, exemplo, extras: b.extras.map(x => ({ tipo: x.tipo, valor: x.valor, pct: x.pct })) };
    ultimo = { pagina: 'pq', dados: { orc, saque: b.saque, rend: b.rend, stopEf, dias, semCor: sem.cor, semTit: sem.tit, entradas, exemplo } };
    const salvo = window.PlanoCartao && window.PlanoCartao.salvar('pq', ultimo.dados);
    $('planoEstado').textContent = (exemplo ? 'Exemplo ilustrativo' : 'Meu gerenciamento') + (salvo ? ' · salvo neste navegador por 30 dias' : ' · armazenamento indisponível; mantenha a página aberta');
    $('days').innerHTML = Array.from({ length: 20 }, (_, i) => `<i class="${i < dias ? 'on' : ''}"></i>`).join('');

    const w = $('warn');
    if (orc <= 0) { w.textContent = 'Nenhum valor foi destinado ao risco. Informe uma aplicação, uma parte da sobra ou outra renda.'; w.hidden = false; }
    else if (dias === 0) { w.textContent = 'Informe um limite diário maior que zero para calcular os dias de operação.'; w.hidden = false; }
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

  $('form').addEventListener('input', () => { exemplo = false; render(); });
  ['stop', 'pts'].forEach((id) => $(id).addEventListener('input', () => { exemplo = false; render(); }));
  $('valSobra').addEventListener('input', (e) => {
    const max = Number(e.target.max) || 0;
    e.target.dataset.arrastando = '1';
    fracSobra = max > 0 ? Number(e.target.value) / max : fracSobra;
    $('sobraErro').hidden = true;
    render();
  });
  $('valSobra').addEventListener('change', (e) => { e.target.dataset.arrastando = '0'; });
  $('btnStopGer').addEventListener('click', () => { const g = stopGer(); if (g !== null) { $('stop').value = g; exemplo = false; render(); } });
  $('valorSobraExato').addEventListener('input', (e) => {
    const max = Math.max(0, num('renda', 0) - num('contas', 0));
    const digitado = Number(e.target.value) || 0;
    const valor = Math.round(Math.min(max, Math.max(0, digitado)) * 100) / 100;
    fracSobra = max > 0 ? valor / max : 0;
    $('sobraErro').hidden = digitado >= 0 && digitado <= max;
    $('sobraErro').textContent = 'Use um valor entre R$ 0 e ' + brl(max) + '. O cálculo foi ajustado a esse intervalo.';
    if (digitado !== valor) e.target.value = String(valor);
  });
  $('form').addEventListener('change', render);
  $('btnAddRenda').addEventListener('click', () => { exemplo = false; const d = addRenda('aluguel', 0, 20); d.querySelector('select').focus(); render(); });
  document.querySelectorAll('#reserva button').forEach((btn) => btn.addEventListener('click', () => {
    exemplo = false; reserva = btn.dataset.v;
    document.querySelectorAll('#reserva button').forEach((b2) => b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false'));
    render();
  }));
  $('form').addEventListener('submit', (e) => e.preventDefault());
  document.querySelectorAll('#reinv button').forEach(btn => btn.addEventListener('click', () => {
    exemplo = false; reinv = parseFloat(btn.dataset.v);
    document.querySelectorAll('#reinv button').forEach(b2 => b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false'));
    render();
  }));
  function restaurar(e) {
    campos.forEach(id => { if (e[id] !== undefined && Number.isFinite(Number(e[id])) && Number(e[id]) >= 0) $(id).value = e[id]; });
    if (!['15', '17.5', '20', '22.5'].includes($('ir').value)) $('ir').value = padrao.ir;
    fracSobra = Number.isFinite(e.fracSobra) ? Math.max(0, Math.min(1, e.fracSobra)) : .3;
    reserva = ['nao', 'parte', 'completa'].includes(e.reserva) ? e.reserva : 'completa';
    reinv = [0, .5, 1].includes(e.reinv) ? e.reinv : .5;
    exemplo = e.exemplo === true;
    $('extras').innerHTML = ''; $('btnAddRenda').hidden = false;
    if (Array.isArray(e.extras)) e.extras.slice(0, 4).forEach(x => {
      if (x && Object.hasOwn(TIPOS, x.tipo) && Number.isFinite(x.valor) && Number.isFinite(x.pct)) addRenda(x.tipo, Math.max(0, x.valor), Math.max(0, Math.min(100, x.pct)));
    });
    document.querySelectorAll('#reserva button').forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.v === reserva ? 'true' : 'false'));
    document.querySelectorAll('#reinv button').forEach(btn => btn.setAttribute('aria-pressed', Number(btn.dataset.v) === reinv ? 'true' : 'false'));
  }
  const salvo = window.PlanoCartao && window.PlanoCartao.ler().pq;
  if (salvo && salvo.entradas) restaurar(salvo.entradas);
  $('btnExemplo').addEventListener('click', () => {
    if (!exemplo && !window.confirm('Substituir os valores do seu gerenciamento pelos valores de exemplo?')) return;
    restaurar({ ...padrao, exemplo: true }); $('sobraErro').hidden = true; render();
  });
  render();
})();
