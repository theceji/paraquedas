/* Tema claro/escuro.
   Sem escolha salva, respeita o tema inicial definido pela página; nas ferramentas segue o sistema (prefers-color-scheme), com fallback claro.
   O botão alterna e lembra a escolha neste navegador. Carregado no <head> para não piscar o tema errado. */
(function () {
  var CHAVE = 'paraquedas-tema';
  var raiz = document.documentElement;
  try {
    var salvo = localStorage.getItem(CHAVE);
    if (salvo === 'dark' || salvo === 'light') raiz.setAttribute('data-theme', salvo);
  } catch (e) { /* armazenamento bloqueado: segue o sistema */ }

  var movimentoSalvo = null;
  try { movimentoSalvo = localStorage.getItem('paraquedas-movimento'); } catch (e) { /* segue o sistema */ }
  var movimentoSistema = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function atualizarMovimento() {
    var reduzido = movimentoSalvo ? movimentoSalvo === 'reduced' : !!(movimentoSistema && movimentoSistema.matches);
    raiz.setAttribute('data-motion', reduzido ? 'reduced' : 'full');
    var botao = document.getElementById('btnMovimento');
    if (botao) {
      botao.setAttribute('aria-pressed', String(reduzido));
      botao.setAttribute('aria-label', reduzido ? 'Ativar animações' : 'Reduzir movimento');
      botao.title = reduzido ? 'Ativar animações' : 'Reduzir movimento';
    }
    var cena = document.getElementById('dropBtn');
    if (cena) { cena.disabled = reduzido; cena.querySelector('.drop-hint').textContent = reduzido ? 'Ilustração estática' : 'Toque para soltar de novo'; }
  }
  atualizarMovimento();
  if (movimentoSistema && movimentoSistema.addEventListener) movimentoSistema.addEventListener('change', atualizarMovimento);
  document.addEventListener('DOMContentLoaded', function () {
    atualizarMovimento();
    var botao = document.getElementById('btnMovimento');
    if (botao) botao.addEventListener('click', function () {
      movimentoSalvo = raiz.getAttribute('data-motion') === 'reduced' ? 'full' : 'reduced';
      try { localStorage.setItem('paraquedas-movimento', movimentoSalvo); } catch (e) { /* vale nesta página */ }
      atualizarMovimento();
    });
  });

  function temaAtual() {
    var t = raiz.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function atualizarBotao(btn) {
    var escuro = temaAtual() === 'dark';
    btn.setAttribute('aria-label', escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
    btn.setAttribute('title', escuro ? 'Tema claro' : 'Tema escuro');
    btn.querySelector('.ico-sol').toggleAttribute('hidden', !escuro);
    btn.querySelector('.ico-lua').toggleAttribute('hidden', escuro);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btnTema');
    if (!btn) return;
    atualizarBotao(btn);
    btn.addEventListener('click', function () {
      var novo = temaAtual() === 'dark' ? 'light' : 'dark';
      raiz.setAttribute('data-theme', novo);
      try { localStorage.setItem(CHAVE, novo); } catch (e) { /* ignora */ }
      atualizarBotao(btn);
      document.dispatchEvent(new CustomEvent('temaalterado'));
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var ouvir = function () { atualizarBotao(btn); };
      if (mq.addEventListener) mq.addEventListener('change', ouvir); else if (mq.addListener) mq.addListener(ouvir);
    }
  });
})();
