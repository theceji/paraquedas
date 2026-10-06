/* Paraquedas do Trader Indisciplinado — cartão do plano de trade
   - Cada página guarda seus últimos números neste navegador (localStorage), para o cartão juntar as duas.
   - Os dados expiram sozinhos após 30 dias sem atualização. Não há link para apagar (decisão do autor).
   - O cartão é desenhado em <canvas> (1080×1350) e baixado como PNG. Nada é enviado a servidor. */
(function () {
  'use strict';
  const CHAVE = 'paraquedas-plano';
  const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;
  const WIN_PONTO = 0.20, WDO_PONTO = 10;
  const STOPS_WIN = [250, 300, 350, 400, 450, 500];
  const STOPS_WDO = [10, 11, 11.5, 12, 15, 20];
  const URL_SITE = 'theceji.github.io/paraquedas';
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  /* ---------- Memória ---------- */
  function lerTudo() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { d = {}; }
    const agora = Date.now();
    let mudou = false;
    ['pq', 'ger'].forEach((k) => { if (d[k] && !(agora - (d[k].ts || 0) < VALIDADE_MS)) { delete d[k]; mudou = true; } });
    if (mudou) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) { /* ignora */ } }
    return d;
  }
  function salvar(pagina, dados) {
    try {
      const d = lerTudo();
      d[pagina] = Object.assign({}, dados, { ts: Date.now() });
      localStorage.setItem(CHAVE, JSON.stringify(d));
    } catch (e) { /* armazenamento bloqueado: o cartão usa só a página atual */ }
  }

  /* ---------- Cálculo do conteúdo ---------- */
  const brl = (v, dec) => (v < 0 ? '−' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  const ctr = (risco, pts, vp) => (risco > 0 && pts > 0 ? Math.floor(risco / (pts * vp) + 1e-9) : 0);

  function montarPlano(atual) {
    const d = lerTudo();
    if (atual && atual.pagina) d[atual.pagina] = Object.assign({}, atual.dados, { ts: Date.now() });
    const pq = d.pq || null, ger = d.ger || null;
    const baseRisco = ger ? ger.risco : (pq ? pq.stopEf : 0);
    const baseTxt = ger ? 'pelo risco por operação' : 'pelo stop diário';
    const stopsWin = ger && ger.stopsWin ? ger.stopsWin : STOPS_WIN;
    const stopsWdo = ger && ger.stopsWdo ? ger.stopsWdo : STOPS_WDO;
    const stopsPorDia = pq && ger && ger.risco > 0 ? Math.floor(pq.stopEf / ger.risco + 1e-9) : null;
    const hoje = new Date();
    return {
      pq, ger, baseRisco, baseTxt, stopsPorDia,
      alertaRisco: pq && ger && ger.risco > pq.stopEf,
      win: stopsWin.map((p) => ({ p, c: ctr(baseRisco, p, WIN_PONTO) })),
      wdo: stopsWdo.map((p) => ({ p, c: ctr(baseRisco, p, WDO_PONTO) })),
      mes: MESES[hoje.getMonth()] + ' de ' + hoje.getFullYear(),
      arquivo: 'plano-de-trade-' + hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '.png',
      data: hoje.toLocaleDateString('pt-BR')
    };
  }

  /* ---------- Desenho ---------- */
  const C = { navy: '#0F2235', navy2: '#1A3550', bg: '#F4F8FB', card: '#FFFFFF', ink: '#0F2235', muted: '#4A5E70', line: '#D5E2EB',
    green: '#17784F', greenL: '#2FA36F', greenSoft: '#D6EEE2', red: '#B83A2E', redSoft: '#F6DEDB', amber: '#F2B544', amberInk: '#6B4300', amberSoft: '#FBEFD6',
    blue: '#1F5F99', calc: '#E3ECF2', accent: '#7FD1A8' };
  const F = { d: 'Archivo, "Arial Black", sans-serif', b: 'Figtree, "Segoe UI", Arial, sans-serif' };

  function rr(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function txt(ctx, s, x, y, font, cor, align) {
    ctx.font = font; ctx.fillStyle = cor; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
  }
  function caber(ctx, s, font, max) {
    ctx.font = font;
    if (ctx.measureText(s).width <= max) return s;
    while (s.length > 1 && ctx.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s + '…';
  }
  function paraquedas(ctx, x, y, esc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc);
    ctx.fillStyle = C.greenL;
    ctx.beginPath(); ctx.moveTo(30, 190); ctx.quadraticCurveTo(210, -40, 390, 190);
    [[345, 300], [255, 210], [165, 120], [75, 30]].forEach(([cx, ex]) => ctx.quadraticCurveTo(cx, 165, ex, 190));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#DCE7F0'; ctx.lineWidth = 14;
    [[30, 165], [210, 210], [390, 255]].forEach(([x1, x2]) => { ctx.beginPath(); ctx.moveTo(x1, 190); ctx.lineTo(x2, 335); ctx.stroke(); });
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.rect(140, 330, 140, 100); ctx.fill();
    ctx.restore();
  }
  function bloco(ctx, x, y, w, rotulo, valor, sub, corValor) {
    txt(ctx, rotulo, x, y, '600 21px ' + F.b, C.muted);
    txt(ctx, caber(ctx, valor, '900 40px ' + F.d, w), x, y + 46, '900 40px ' + F.d, corValor || C.ink);
    if (sub) txt(ctx, caber(ctx, sub, '500 18px ' + F.b, w), x, y + 74, '500 18px ' + F.b, C.muted);
  }
  function faltando(ctx, x, y, w, h, msg) {
    ctx.setLineDash([12, 10]);
    rr(ctx, x, y, w, h, 16, null, '#B9CBD8');
    ctx.setLineDash([]);
    txt(ctx, msg, x + w / 2, y + h / 2 + 8, '600 22px ' + F.b, C.muted, 'center');
  }

  function desenhar(canvas, P) {
    const W = 1080, H = 1350, M = 56;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    // Cabeçalho
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, 200);
    paraquedas(ctx, M, 34, 0.13);
    txt(ctx, 'Paraquedas do Trader ', M + 70, 72, '800 26px ' + F.d, '#FFFFFF');
    ctx.font = '800 26px ' + F.d; const wPt = ctx.measureText('Paraquedas do Trader ').width;
    txt(ctx, 'Indisciplinado', M + 70 + wPt, 72, '800 26px ' + F.d, C.accent);
    txt(ctx, 'Meu plano de trade', M, 150, '900 58px ' + F.d, '#FFFFFF');
    txt(ctx, P.mes, W - M, 150, '700 26px ' + F.b, '#A9C2D6', 'right');

    let y = 236;
    // Semáforo
    if (P.pq && P.pq.semCor) {
      const cores = { verde: [C.greenSoft, C.green], ambar: [C.amberSoft, C.amberInk], vermelho: [C.redSoft, C.red] }[P.pq.semCor] || [C.calc, C.ink];
      rr(ctx, M, y, W - 2 * M, 64, 16, cores[0]);
      ctx.fillStyle = P.pq.semCor === 'ambar' ? C.amber : cores[1];
      ctx.beginPath(); ctx.arc(M + 34, y + 32, 13, 0, Math.PI * 2); ctx.fill();
      txt(ctx, caber(ctx, P.pq.semTit, '800 26px ' + F.d, W - 2 * M - 80), M + 62, y + 41, '800 26px ' + F.d, cores[1]);
      y += 88;
    }

    // Meu mês (Paraquedas) | Minha operação (Gerenciamento)
    const colW = (W - 2 * M - 24) / 2, xL = M, xR = M + colW + 24, hBox = 300;
    if (P.pq) {
      rr(ctx, xL, y, colW, hBox, 22, C.card);
      txt(ctx, 'MEU MÊS', xL + 28, y + 46, '800 20px ' + F.b, C.green);
      bloco(ctx, xL + 28, y + 88, colW - 56, 'Orçamento de risco', brl(P.pq.orc), P.pq.saque > 0 ? brl(P.pq.saque) + ' retirados do patrimônio' : '100% renda nova do mês', C.green);
      bloco(ctx, xL + 28, y + 196, (colW - 56) / 2 - 8, 'Stop diário', brl(P.pq.stopEf), null);
      bloco(ctx, xL + 28 + (colW - 56) / 2 + 8, y + 196, (colW - 56) / 2 - 8, 'Dias', P.pq.dias + (P.pq.dias === 1 ? ' dia' : ' dias'), null);
    } else faltando(ctx, xL, y, colW, hBox, 'Complete na página Paraquedas');
    if (P.ger) {
      rr(ctx, xR, y, colW, hBox, 22, C.card);
      txt(ctx, 'MINHA OPERAÇÃO', xR + 28, y + 46, '800 20px ' + F.b, C.blue);
      bloco(ctx, xR + 28, y + 88, colW - 56, 'Risco por operação', brl(P.ger.risco), P.stopsPorDia === 0 ? 'maior que o stop diário!' : P.stopsPorDia !== null ? 'até ' + P.stopsPorDia + (P.stopsPorDia === 1 ? ' stop' : ' stops') + ' por dia' : P.ger.riscoPct.toLocaleString('pt-BR') + '% de ' + brl(P.ger.cap), C.ink);
      bloco(ctx, xR + 28, y + 196, (colW - 56) / 2 - 8, 'Meta do mês', brl(P.ger.metaR), P.ger.metaPct.toLocaleString('pt-BR') + '%', C.green);
      bloco(ctx, xR + 28 + (colW - 56) / 2 + 8, y + 196, (colW - 56) / 2 - 8, 'Drawdown', brl(-P.ger.dd), 'alerta: pare', C.red);
    } else faltando(ctx, xR, y, colW, hBox, 'Complete na página Gerenciamento');
    y += hBox + 22;

    // Contratos
    const hCtr = 370;
    rr(ctx, M, y, W - 2 * M, hCtr, 22, C.card);
    txt(ctx, 'QUANTOS CONTRATOS OPERAR', M + 28, y + 46, '800 20px ' + F.b, C.ink);
    txt(ctx, 'Calculado ' + P.baseTxt + ': ' + brl(P.baseRisco), W - M - 28, y + 46, '600 18px ' + F.b, C.muted, 'right');
    const tW = (W - 2 * M - 56 - 24) / 2;
    [[P.win, 'WIN', 'Mini Índice', C.blue, '#FFFFFF', M + 28], [P.wdo, 'WDO', 'Mini Dólar', C.amber, '#3A2600', M + 28 + tW + 24]].forEach(([linhas, tag, nome, corTag, corTxt, x]) => {
      const ty = y + 74;
      rr(ctx, x, ty, 74, 38, 8, corTag); txt(ctx, tag, x + 37, ty + 27, '900 20px ' + F.d, corTxt, 'center');
      txt(ctx, nome, x + 88, ty + 27, '800 22px ' + F.d, C.ink);
      rr(ctx, x, ty + 54, tW, 226, 14, C.calc);
      txt(ctx, 'STOP (PTS)', x + 20, ty + 86, '700 15px ' + F.b, C.muted);
      txt(ctx, 'CONTRATOS', x + tW - 20, ty + 86, '700 15px ' + F.b, C.muted, 'right');
      linhas.forEach((l, i) => {
        const ly = ty + 116 + i * 28;
        txt(ctx, l.p.toLocaleString('pt-BR'), x + 20, ly, '700 22px ' + F.b, C.ink);
        txt(ctx, String(l.c), x + tW - 20, ly, '900 24px ' + F.d, l.c === 0 ? C.red : C.ink, 'right');
      });
    });
    y += hCtr + 22;

    // Regras de ouro (título + explicação), em 2×2
    const regras = [
      ['Bateu o stop, desliga.', 'O dia acabou. Amanhã tem outro.', C.green, '#FFFFFF'],
      ['Stop não acumula.', 'Sobra de hoje não vira crédito amanhã.', C.blue, '#FFFFFF'],
      ['Nunca dobre para recuperar.', 'Aumentar o lote depois de perder quebra contas.', C.red, '#FFFFFF'],
      ['Anote cada trade.', 'Entrada, saída e motivo. Revise toda semana.', C.amber, '#3A2600']
    ];
    const rW = (W - 2 * M - 12) / 2, rH = 86;
    regras.forEach(([t, e, cor, corT], i) => {
      const x = M + (i % 2) * (rW + 12), ry = y + Math.floor(i / 2) * (rH + 12);
      rr(ctx, x, ry, rW, rH, 16, cor);
      txt(ctx, caber(ctx, t, '900 24px ' + F.d, rW - 44), x + 22, ry + 38, '900 24px ' + F.d, corT);
      txt(ctx, caber(ctx, e, '600 18px ' + F.b, rW - 44), x + 22, ry + 66, '600 18px ' + F.b, corT);
    });

    // Rodapé
    ctx.fillStyle = C.navy; ctx.fillRect(0, H - 92, W, 92);
    txt(ctx, 'A disciplina é o fermento das suas finanças.', M, H - 40, '800 24px ' + F.d, '#FFFFFF');
    txt(ctx, URL_SITE + ' · ' + P.data, W - M, H - 40, '600 18px ' + F.b, '#A9C2D6', 'right');
  }

  /* ---------- Interface: botão, prévia e download ---------- */
  async function carregarFontes() {
    if (!document.fonts || !document.fonts.load) return;
    const lista = ['900 40px Archivo', '800 26px Archivo', '600 20px Figtree', '700 20px Figtree', '500 18px Figtree'];
    try { await Promise.race([Promise.all(lista.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* segue com a fonte reserva */ }
  }

  async function gerar(btn, atual) {
    const alvo = document.getElementById('cartaoPrev');
    if (!alvo) return;
    btn.disabled = true; const rotulo = btn.textContent; btn.textContent = 'Gerando…';
    await carregarFontes();
    const P = montarPlano(atual());
    const canvas = document.createElement('canvas');
    desenhar(canvas, P);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      alvo.hidden = false;
      alvo.innerHTML = '';
      const img = new Image(); img.src = url; img.alt = 'Prévia do cartão do plano de trade'; img.className = 'cartao-img';
      const a = document.createElement('a'); a.href = url; a.download = P.arquivo; a.className = 'btn btn-primary'; a.textContent = 'Baixar imagem (PNG)';
      const dica = document.createElement('p'); dica.className = 'hint';
      dica.textContent = !P.pq || !P.ger ? 'Dica: preencha também a página ' + (!P.pq ? 'Paraquedas' : 'Gerenciamento') + ' para completar o cartão.' : 'Salve no celular, use como papel de parede ou imprima e cole perto da tela.';
      alvo.append(img, a, dica);
      btn.disabled = false; btn.textContent = rotulo;
      alvo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 'image/png');
  }

  window.PlanoCartao = {
    salvar,
    ler: lerTudo,
    ligar: function (btnId, atual) {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', () => gerar(btn, atual));
    },
    _montarPlano: montarPlano
  };
})();
