/* O dinheiro para no stop; a trajetória vermelha segue até o rodapé da entrada. */
(function () {
  const scene = document.getElementById('riskScene'), btn = document.getElementById('replayRisk');
  if (!scene || !btn) return;
  const screen = document.querySelector('.landing-screen'), footer = screen.querySelector('.landing-bottom');
  const line = scene.querySelector('.capital-line'), money = scene.querySelector('.money-descent');
  const parachute = scene.querySelector('.limit-parachute'), shadow = scene.querySelector('.landing-shadow');
  const overlay = document.getElementById('riskContinuation'), continuation = document.getElementById('continuationReveal');
  const continuationPath = document.getElementById('continuationPath'), mask = document.getElementById('continuationMask');
  const indicator = scene.querySelector('.stop-indicator'), figure = scene.closest('figure');
  const capitalFade = document.getElementById('capitalFade'), continuationFade = document.getElementById('continuationFade');
  const fallDuration = 7200, continuationDuration = 2400;
  let frame = 0, layoutFrame = 0, length = 0, progress = 0, after = 0;
  function draw(nextProgress, nextAfter) {
    progress = nextProgress; after = nextAfter;
    const point = line.getPointAtLength(length * progress);
    // Oscilação leve em torno do velame; zera no início e no pouso.
    const sway = progress <= 0 || progress >= 1 ? 0 : 5 * Math.sin(progress * Math.PI) * Math.sin(progress * fallDuration / 2400 * Math.PI * 2);
    money.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') rotate(' + sway + ' 0 -95)');
    line.style.strokeDasharray = '1'; line.style.strokeDashoffset = String(1 - progress);
    continuation.style.strokeDasharray = '1'; continuation.style.strokeDashoffset = String(1 - after);
    line.style.opacity = String(Math.min(1, progress * fallDuration / 450));
    const reveal = Math.min(1, after * continuationDuration / 550);
    indicator.style.opacity = String(reveal * reveal * (3 - 2 * reveal));
    shadow.style.opacity = String(.2 * progress);
    // O paraquedas permanece aberto durante toda a descida e recolhe após o pouso.
    const closing = Math.max(0, Math.min(1, (after * continuationDuration - 100) / 700));
    const fold = closing * closing * (3 - 2 * closing);
    parachute.setAttribute('transform', 'translate(0 -29) rotate(' + (-8 * fold) + ') scale(' + (1 - .72 * fold) + ' ' + (1 - .94 * fold) + ') translate(0 29)');
  }
  function layout() {
    const matrix = scene.getScreenCTM();
    if (!matrix) return;
    const bounds = screen.getBoundingClientRect(), footerBounds = footer.getBoundingClientRect();
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    // No desktop a queda começa acima da antiga moldura. No celular fica abaixo do texto.
    const top = mobile ? 115 : Math.min(115, (screen.querySelector('.landing-nav').getBoundingClientRect().bottom + 118 * matrix.d - matrix.f) / matrix.d);
    const descent = [[45,0],[76,.12],[96,.23],[133,.32],[148,.43],[184,.51],[205,.49],[237,.66],[262,.74],[281,.72],[307,.9],[326,1]];
    line.setAttribute('d', descent.map(([x,t],i)=>(i?'L':'M')+x+' '+(top+(292-top)*t)).join(''));
    length = line.getTotalLength();
    const fadeEnd = line.getPointAtLength(length * .14);
    capitalFade.setAttribute('x1', '45'); capitalFade.setAttribute('y1', String(top));
    capitalFade.setAttribute('x2', String(fadeEnd.x)); capitalFade.setAttribute('y2', String(fadeEnd.y));
    const figureBounds = figure.getBoundingClientRect();
    const replayPoint = new DOMPoint(figureBounds.width < 400 ? 310 : 467, 296).matrixTransform(matrix);
    figure.style.setProperty('--replay-x', (replayPoint.x - figureBounds.left) + 'px');
    figure.style.setProperty('--replay-y', (replayPoint.y - figureBounds.top) + 'px');
    const project = (x,y) => { const p = new DOMPoint(x,y).matrixTransform(matrix); return [p.x-bounds.left,p.y-bounds.top]; };
    const width = bounds.width, height = bounds.height;
    overlay.setAttribute('viewBox','0 0 '+width+' '+height);
    mask.setAttribute('x','0'); mask.setAttribute('y','0'); mask.setAttribute('width',String(width)); mask.setAttribute('height',String(height));
    // A continuação cai ao lado da mensagem, sem viajar até a borda da janela.
    const card = figure.querySelector('.reserve-card').getBoundingClientRect();
    const caption = figure.querySelector('.reserve-summary p').getBoundingClientRect();
    const points = [[326,292],[330,316],[326,330],[354,350]].map(([x,y])=>project(x,y));
    const besideCard = Math.max(project(416,0)[0], card.right - bounds.left + 16, caption.right - bounds.left + 12);
    points.push([besideCard, card.top - bounds.top - 12], [besideCard + 6, card.bottom - bounds.top + 10]);
    const last = points[points.length-1];
    const endY = footerBounds.top - bounds.top - 12;
    const endX = footerBounds.right - bounds.left;
    const drift = Math.max(0, endX - last[0]), remaining = endY - last[1];
    for (const [t,x] of [[.12,.12],[.24,.14],[.38,.43],[.5,.5],[.63,.52],[.77,.72],[.9,.84],[1,1]]) points.push([last[0]+drift*x,last[1]+remaining*t]);
    continuationFade.setAttribute('y1', String(points[0][1]));
    continuationFade.setAttribute('y2', String(endY));
    const path = points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join('');
    continuation.setAttribute('d',path); continuationPath.setAttribute('d',path);
    draw(progress,after);
  }
  function scheduleLayout() {
    cancelAnimationFrame(layoutFrame); layoutFrame = requestAnimationFrame(layout);
  }
  function play() {
    cancelAnimationFrame(frame); layout(); draw(0,0);
    const start = performance.now();
    function tick(now) {
      const elapsed = now-start;
      draw(Math.min(1,elapsed/fallDuration),Math.max(0,Math.min(1,(elapsed-fallDuration)/continuationDuration)));
      if (elapsed<fallDuration+continuationDuration) frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  btn.addEventListener('click',play);
  window.addEventListener('resize',scheduleLayout);
  // Reposiciona a trajetória após mudanças de fonte ou de altura, sem reiniciar a animação.
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(scheduleLayout);
    [screen,scene,footer].forEach(element=>observer.observe(element));
  }
  if (document.fonts) document.fonts.ready.then(scheduleLayout);
  layout(); draw(0,0);
  if (document.readyState==='complete') play();
  else window.addEventListener('load',play,{once:true});
})();
