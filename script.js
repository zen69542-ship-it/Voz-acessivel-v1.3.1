// ==========================================================================
// OuviLer — script.js — compartilhado por todas as páginas
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.navlinks a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Painel de acessibilidade: abrir/fechar ---------- */
  const fab = document.getElementById('a11yFab');
  const panel = document.getElementById('a11yPanel');
  const closeBtn = document.getElementById('a11yClose');
  if (fab && panel) {
    fab.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', open);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });
  }

  const root = document.documentElement;

  /* ---------- Toggles simples (alto contraste, dislexia, links, cliques, reduzir movimento) ---------- */
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.classList.toggle(btn.dataset.toggle);
      btn.classList.toggle('active');
    });
  });

  /* ---------- Modo epilepsia / fotossensibilidade ---------- */
  /* Aplica: sem animação/transição em nada, imagens dessaturadas e mais escuras,
     cores de acento neutralizadas, elementos puramente decorativos ocultos. */
  const epilepsyBtn = document.getElementById('epilepsyToggle');
  const epilepsyBanner = document.getElementById('epilepsyBannerText');
  if (epilepsyBtn) {
    epilepsyBtn.addEventListener('click', () => {
      const isActive = root.classList.toggle('epilepsy-safe');
      root.classList.toggle('epilepsy-active', isActive);
      epilepsyBtn.classList.toggle('active', isActive);
      if (isActive && epilepsyBanner) {
        epilepsyBanner.textContent = 'Modo epilepsia/fotossensibilidade ativo — animações, transições e cores fortes foram removidas de toda a página, inclusive das imagens.';
      }
      // Garante que nenhum modo de daltonismo fique competindo por cor ao mesmo tempo
      if (isActive) {
        window.speechSynthesis && null; // no-op, mantém isolado de outras rotinas
      }
    });
  }

  /* ---------- Paletas de daltonismo (7 tipos, mutuamente exclusivas) ---------- */
  const cbClasses = ['cb-protanopia','cb-protanomalia','cb-deuteranopia','cb-deuteranomalia','cb-tritanopia','cb-tritanomalia','cb-acromatopsia'];
  const cbBannerText = document.getElementById('cbBannerText');
  const cbRow = document.getElementById('cbRow');
  if (cbRow) {
    cbRow.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        cbClasses.forEach(c => root.classList.remove(c));
        cbRow.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        if (btn.dataset.cb !== 'none') {
          root.classList.add(btn.dataset.cb);
          root.classList.add('cb-active');
          if (cbBannerText) cbBannerText.textContent = 'Paleta ativa: ' + btn.textContent + ' — as cores do site foram adaptadas';
        } else {
          root.classList.remove('cb-active');
        }
        btn.classList.add('active');
      });
    });
  }

  /* ---------- Tamanho da fonte ---------- */
  let scale = 1;
  const fontInc = document.getElementById('fontInc');
  const fontDec = document.getElementById('fontDec');
  const fontReset = document.getElementById('fontReset');
  if (fontInc) fontInc.addEventListener('click', () => { scale = Math.min(1.5, scale + 0.1); root.style.setProperty('--font-scale', scale); });
  if (fontDec) fontDec.addEventListener('click', () => { scale = Math.max(0.85, scale - 0.1); root.style.setProperty('--font-scale', scale); });
  if (fontReset) fontReset.addEventListener('click', () => { scale = 1; root.style.setProperty('--font-scale', scale); });

  /* ---------- Restaurar tudo ---------- */
  const resetBtn = document.getElementById('a11yReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['high-contrast','dyslexia-mode','reduce-motion','big-click','link-highlight','cb-active','epilepsy-safe','epilepsy-active', ...cbClasses].forEach(c => root.classList.remove(c));
      document.querySelectorAll('.a11y-row button').forEach(b => b.classList.remove('active'));
      if (cbRow) { const noneBtn = cbRow.querySelector('button[data-cb="none"]'); if (noneBtn) noneBtn.classList.add('active'); }
      scale = 1; root.style.setProperty('--font-scale', 1);
    });
  }

  /* ---------- Narrador: lê a página inteira em voz alta, seção por seção ---------- */
  const sections = Array.from(document.querySelectorAll('#main [data-narrate]'));
  const narratorBar = document.getElementById('narratorBar');
  const nbText = document.getElementById('nbText');
  const nbPlayPause = document.getElementById('nbPlayPause');
  const nbStop = document.getElementById('nbStop');
  let isPlaying = false;

  function clearHighlight(){ sections.forEach(s => s.classList.remove('reading-now')); }

  function speakSection(i){
    if (!sections.length) return;
    if (i >= sections.length){ stopNarration(); return; }
    const el = sections[i];
    clearHighlight();
    el.classList.add('reading-now');
    const behavior = root.classList.contains('epilepsy-safe') ? 'auto' : 'smooth';
    el.scrollIntoView({ behavior, block:'start' });
    if (nbText) nbText.textContent = el.dataset.narrate;
    if (narratorBar) narratorBar.classList.add('active');
    if (nbPlayPause){ nbPlayPause.textContent = '⏸'; nbPlayPause.setAttribute('aria-label','Pausar leitura'); }
    const text = el.dataset.narrate + '. ' + el.innerText;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 0.98;
    utter.onend = () => { if (isPlaying) speakSection(i + 1); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function startNarration(fromIndex){
    if (!('speechSynthesis' in window)) { alert('Seu navegador não suporta leitura por voz.'); return; }
    isPlaying = true;
    speakSection(fromIndex || 0);
  }
  function stopNarration(){
    isPlaying = false;
    window.speechSynthesis.cancel();
    if (narratorBar) narratorBar.classList.remove('active');
    clearHighlight();
  }
  function togglePause(){
    if (!isPlaying) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused){
      window.speechSynthesis.pause();
      if (nbPlayPause){ nbPlayPause.textContent = '▶'; nbPlayPause.setAttribute('aria-label','Retomar leitura'); }
    } else if (window.speechSynthesis.paused){
      window.speechSynthesis.resume();
      if (nbPlayPause){ nbPlayPause.textContent = '⏸'; nbPlayPause.setAttribute('aria-label','Pausar leitura'); }
    }
  }

  const heroListen = document.getElementById('heroListen');
  const a11yListen = document.getElementById('a11yListen');
  if (heroListen) heroListen.addEventListener('click', () => startNarration(0));
  if (a11yListen) a11yListen.addEventListener('click', () => { if (panel) panel.classList.remove('open'); startNarration(0); });
  if (nbPlayPause) nbPlayPause.addEventListener('click', togglePause);
  if (nbStop) nbStop.addEventListener('click', stopNarration);

  /* ---------- Barra de progresso do narrador ---------- */
  const nbProgress = document.getElementById('nbProgress');
  function updateNarratorProgress(){
    if (!nbProgress || !sections.length) return;
    const idx = sections.findIndex(s => s.classList.contains('reading-now'));
    const pct = idx < 0 ? 0 : Math.round(((idx + 1) / sections.length) * 100);
    nbProgress.style.width = pct + '%';
  }
  const origSpeak = speakSection;
  speakSection = function(i){ origSpeak(i); updateNarratorProgress(); };
  const origStop = stopNarration;
  stopNarration = function(){ origStop(); if (nbProgress) nbProgress.style.width = '0%'; };

  /* ---------- Fallback JS p/ evitar sobreposição a11y-bar × narrator-bar (navegadores sem :has()) ---------- */
  if (narratorBar) {
    const obs = new MutationObserver(() => {
      document.body.classList.toggle('narrator-open', narratorBar.classList.contains('active'));
    });
    obs.observe(narratorBar, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- Persistência das preferências de acessibilidade entre páginas ---------- */
  const PREF_KEY = 'ouviler-a11y-prefs';
  const persistedToggles = ['high-contrast','dyslexia-mode','reduce-motion','big-click','link-highlight'];

  function savePrefs(){
    const prefs = {
      toggles: persistedToggles.filter(c => root.classList.contains(c)),
      cb: cbClasses.find(c => root.classList.contains(c)) || 'none',
      fontScale: scale
    };
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  function loadPrefs(){
    let prefs;
    try { prefs = JSON.parse(localStorage.getItem(PREF_KEY)); } catch (e) { prefs = null; }
    if (!prefs) return;

    (prefs.toggles || []).forEach(c => {
      root.classList.add(c);
      const btn = document.querySelector('[data-toggle="' + c + '"]');
      if (btn) btn.classList.add('active');
    });

    if (prefs.cb && prefs.cb !== 'none') {
      root.classList.add(prefs.cb, 'cb-active');
      const btn = cbRow && cbRow.querySelector('[data-cb="' + prefs.cb + '"]');
      if (btn) { btn.classList.add('active'); if (cbRow) cbRow.querySelectorAll('button').forEach(b => { if (b !== btn) b.classList.remove('active'); }); }
      if (cbBannerText && btn) cbBannerText.textContent = 'Paleta ativa: ' + btn.textContent + ' — as cores do site foram adaptadas';
    }

    if (typeof prefs.fontScale === 'number') {
      scale = prefs.fontScale;
      root.style.setProperty('--font-scale', scale);
    }
  }

  loadPrefs();
  document.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', savePrefs));
  if (cbRow) cbRow.querySelectorAll('button').forEach(btn => btn.addEventListener('click', savePrefs));
  if (fontInc) fontInc.addEventListener('click', savePrefs);
  if (fontDec) fontDec.addEventListener('click', savePrefs);
  if (fontReset) fontReset.addEventListener('click', savePrefs);
  if (resetBtn) resetBtn.addEventListener('click', () => { try { localStorage.removeItem(PREF_KEY); } catch (e) {} });

  /* ---------- Toasts ---------- */
  const toastWrap = document.getElementById('toastWrap');
  function showToast(message, type){
    if (!toastWrap) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = message;
    toastWrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }
  window.ouviLerToast = showToast;

  /* ---------- Voltar ao topo ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: root.classList.contains('reduce-motion') || root.classList.contains('epilepsy-safe') ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Animação de entrada ao rolar (scroll reveal) ---------- */
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !prefersReduced && !root.classList.contains('reduce-motion') && !root.classList.contains('epilepsy-safe')) {
    const revealTargets = document.querySelectorAll('.cat-card, .team-card, .stack-card, .nav-card, .tl-item, .compare-col, .stat-box, .demo-box, .quote-block');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }

  /* ---------- Formulário de contato: validação e feedback reais ---------- */
  const contactForm = document.querySelector('.form-grid');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      contactForm.querySelectorAll('[required]').forEach(field => {
        const msg = field.parentElement.querySelector('.field-msg');
        const empty = !field.value.trim();
        const invalidEmail = field.type === 'email' && field.value.trim() && !/^\S+@\S+\.\S+$/.test(field.value.trim());
        if (empty || invalidEmail) {
          valid = false;
          field.classList.add('field-error');
          field.setAttribute('aria-invalid', 'true');
          if (msg) { msg.textContent = empty ? 'Este campo é obrigatório.' : 'Digite um e-mail válido.'; msg.classList.add('show'); }
        } else {
          field.classList.remove('field-error');
          field.removeAttribute('aria-invalid');
          if (msg) msg.classList.remove('show');
        }
      });

      if (!valid) {
        showToast('Confira os campos destacados antes de enviar.', 'error');
        const firstError = contactForm.querySelector('.field-error');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.add('loading');
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(() => {
        if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
        showToast('Mensagem enviada — este é um formulário de demonstração do TCC, sem envio real.', 'success');
        contactForm.reset();
      }, 900);
    });

    contactForm.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => {
        if (field.classList.contains('field-error') && field.value.trim()) {
          field.classList.remove('field-error');
          field.removeAttribute('aria-invalid');
          const msg = field.parentElement.querySelector('.field-msg');
          if (msg) msg.classList.remove('show');
        }
      });
    });
  }

});

/* ============================================================
   SISTEMA DE MOTION — roda fora do DOMContentLoaded pra pegar
   o load o mais cedo possível (loader de abertura)
   ============================================================ */
(function () {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function motionOff() {
    return prefersReduced || root.classList.contains('reduce-motion') || root.classList.contains('epilepsy-safe');
  }

  /* ---------- Loader de abertura (só na 1ª página da sessão) ---------- */
  const introLoader = document.getElementById('introLoader');
  if (introLoader) {
    let seen = false;
    try { seen = sessionStorage.getItem('ouviler-intro-seen') === '1'; } catch (e) {}
    if (seen || motionOff()) {
      introLoader.style.display = 'none';
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => { introLoader.classList.add('done'); }, 650);
      });
      try { sessionStorage.setItem('ouviler-intro-seen', '1'); } catch (e) {}
    }
  }

  /* ---------- Barra de progresso de leitura ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    function updateProgress() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      scrollProgress.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------- Transição suave entre páginas internas ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    let url;
    try { url = new URL(href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;
    if (!url.pathname.endsWith('.html')) return;

    e.preventDefault();
    if (motionOff()) { window.location.href = href; return; }
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 150);
  });

  /* ---------- Stagger + tilt 3D — aplicados após o DOM carregar ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-grid, .cat-grid, .team-grid, .stack-grid, .compare-grid').forEach(grid => {
      Array.from(grid.children).forEach((child, i) => {
        child.style.setProperty('--stagger', Math.min(i * 70, 350) + 'ms');
      });
    });

    if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !motionOff()) {
      document.querySelectorAll('.cat-card, .team-card, .stack-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--rx', (px * 6).toFixed(2) + 'deg');
          card.style.setProperty('--ry', (py * -6).toFixed(2) + 'deg');
        });
        card.addEventListener('mouseleave', () => {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }
  });
})();
