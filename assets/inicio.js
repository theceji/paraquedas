/* O dinheiro acompanha o preço até o chão; a queda vermelha continua sem ele. */
(function () {
  const scene = document.getElementById('riskScene'), btn = document.getElementById('replayRisk');
  if (!scene || !btn) return;
  const line = scene.querySelector('.capital-line'), money = scene.querySelector('.money-descent');
  const continuation = document.getElementById('continuationReveal'), shadow = scene.querySelector('.landing-shadow');
  const length = line.getTotalLength(), fallDuration = 3200, continuationDuration = 1000;
  let frame = 0;
  function draw(progress, after) {
    const point = line.getPointAtLength(length * progress);
    money.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ')');
    line.style.strokeDasharray = '1'; line.style.strokeDashoffset = String(1 - progress);
    continuation.style.strokeDasharray = '1'; continuation.style.strokeDashoffset = String(1 - after);
    shadow.style.opacity = String(.2 * progress);
  }
  function play() {
    cancelAnimationFrame(frame); draw(0, 0);
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      draw(Math.min(1, elapsed / fallDuration), Math.max(0, Math.min(1, (elapsed - fallDuration) / continuationDuration)));
      if (elapsed < fallDuration + continuationDuration) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  // A apresentação sempre toca ao carregar, independentemente do movimento do sistema.
  btn.addEventListener('click', play);
  draw(0, 0);
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();
