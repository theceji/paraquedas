/* A perda para no limite; a ilustração não representa proteção automática. */
(function () {
  const scene = document.getElementById('riskScene'), btn = document.getElementById('replayRisk');
  if (!scene || !btn) return;
  function movimento() { const reduzido = document.documentElement.dataset.motion === 'reduced'; btn.disabled = reduzido; btn.textContent = reduzido ? 'Movimento reduzido · ilustração estática' : 'Rever a animação ↻'; }
  btn.addEventListener('click', () => { scene.classList.remove('play'); void scene.getBoundingClientRect(); scene.classList.add('play'); });
  new MutationObserver(movimento).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  movimento(); scene.classList.add('play');
})();
