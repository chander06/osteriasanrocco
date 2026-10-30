document.documentElement.classList.remove('no-js');

(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Titolo hero: parola per parola */
  doc.querySelectorAll('[data-split]').forEach(function (el) {
    var testo = el.textContent.trim();
    var parole = testo.split(' ');
    el.setAttribute('aria-label', testo);
    el.innerHTML = '';
    parole.forEach(function (parola, i) {
      var w = doc.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      var s = doc.createElement('span');
      s.textContent = parola;
      s.style.setProperty('--i', i);
      w.appendChild(s);
      el.appendChild(w);
      el.appendChild(doc.createTextNode(' '));
    });
  });

  function avvia() { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); }
  if (doc.readyState === 'complete') avvia(); else window.addEventListener('load', avvia);
  setTimeout(function () { root.classList.add('is-loaded'); }, 1500);

  /* Rivelazioni allo scroll */
  var reveal = doc.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  }

  /* Nav: vetro dopo lo scroll + menu mobile */
  var nav = doc.querySelector('[data-nav]');
  var fab = doc.querySelector('.wa-fab');
  var burger = doc.querySelector('[data-burger]');
  function chiudiMenu() {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelector('.sr').textContent = 'Apri il menu';
    root.classList.remove('menu-aperto');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var aperto = burger.getAttribute('aria-expanded') === 'true';
      if (aperto) { chiudiMenu(); return; }
      burger.setAttribute('aria-expanded', 'true');
      burger.querySelector('.sr').textContent = 'Chiudi il menu';
      root.classList.add('menu-aperto');
    });
    doc.querySelectorAll('#menu-principale a').forEach(function (a) { a.addEventListener('click', chiudiMenu); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) chiudiMenu(); });
  }

  /* Cantina: il calice si riempie e il contatore sale */
  var cantina = doc.querySelector('[data-cantina]');
  var contatore = doc.querySelector('[data-count]');
  var totale = contatore ? parseInt(contatore.getAttribute('data-count'), 10) : 0;
  var cantinaAttiva = cantina && !reduce;
  if (cantinaAttiva) cantina.style.setProperty('--p', '0');

  var ticking = false;
  function aggiorna() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);
    if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    if (cantinaAttiva) {
      var r = cantina.getBoundingClientRect();
      var corsa = r.height - window.innerHeight;
      var p = corsa > 0 ? Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.15) / corsa)) : 1;
      p = Math.min(1, p * 1.25);
      cantina.style.setProperty('--p', p.toFixed(3));
      if (contatore) contatore.textContent = Math.round(p * totale);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(aggiorna); }
  }, { passive: true });
  window.addEventListener('resize', aggiorna, { passive: true });
  aggiorna();

  /* Amatriciana: bianca / rossa */
  var duello = doc.querySelector('[data-duello]');
  var range = doc.querySelector('[data-duello-range]');
  if (duello && range) {
    var imposta = function (v) { duello.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', function () { imposta(range.value); });
    imposta(range.value);
    /* Piccola dimostrazione quando appare, per far capire che si trascina */
    if (!reduce && 'IntersectionObserver' in window) {
      var mostrato = false;
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || mostrato) return;
          mostrato = true; io2.disconnect();
          var t0 = null, toccato = false;
          range.addEventListener('pointerdown', function () { toccato = true; }, { once: true });
          var passo = function (t) {
            if (toccato) return;
            if (!t0) t0 = t;
            var k = Math.min(1, (t - t0) / 1800);
            var v = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
            range.value = v; imposta(v);
            if (k < 1) requestAnimationFrame(passo);
          };
          setTimeout(function () { requestAnimationFrame(passo); }, 700);
        });
      }, { threshold: 0.5 });
      io2.observe(duello);
    }
  }
})();
