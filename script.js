(() => {
  'use strict';

  /* ---------- Preloader ---------- */
  const MIN_LOAD_MS = 2000;
  const startTime = Date.now();
  function finishLoader(){
    const elapsed = Date.now() - startTime;
    const wait = Math.max(MIN_LOAD_MS - elapsed, 0);
    setTimeout(() => {
      document.body.classList.add('loader-exit');
      document.body.classList.remove('lock-scroll');
      setTimeout(() => document.body.classList.add('is-loaded'), 1050);
      startHeroSequence();
    }, wait);
  }
  document.body.classList.add('lock-scroll');
  window.addEventListener('load', finishLoader);
  setTimeout(finishLoader, 4500); // safety fallback

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  function onScrollNav(){
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile menu ---------- */
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mob');
  function closeMob(){
    mob.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  ham.addEventListener('click', () => {
    const isOpen = mob.classList.toggle('open');
    ham.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  });
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMob));

  /* ---------- Smooth anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.rev');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Shine sweep on headings when visible ---------- */
  const shineEls = document.querySelectorAll('.heading--shine, .heading--shine-dark');
  const shineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('shine-play');
        shineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  shineEls.forEach(el => shineObserver.observe(el));

  /* ---------- Counters ---------- */
  function animateCounter(el, target, prefix, suffix, duration = 1600){
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(tick);
  }
  const counterEls = document.querySelectorAll('[data-count], [data-hero-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count ?? el.dataset.heroCount);
      if (!isNaN(target)){
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, prefix, suffix);
      }
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObserver.observe(el));

  /* ---------- Hero typewriter ---------- */
  const twWords = ['Puertas', 'Portones', 'Barandales', 'Escaleras', 'Ventanas', 'Estructuras Metálicas'];
  const twEl = document.getElementById('twText');
  function startHeroSequence(){
    if (!twEl) return;
    let wordIndex = 0, charIndex = 0, deleting = false;
    function loop(){
      const word = twWords[wordIndex];
      if (!deleting){
        charIndex++;
        twEl.textContent = word.slice(0, charIndex);
        if (charIndex === word.length){
          deleting = true;
          setTimeout(loop, 1400);
          return;
        }
      } else {
        charIndex--;
        twEl.textContent = word.slice(0, charIndex);
        if (charIndex === 0){
          deleting = false;
          wordIndex = (wordIndex + 1) % twWords.length;
        }
      }
      setTimeout(loop, deleting ? 45 : 85);
    }
    setTimeout(loop, 1500);
  }

  /* ---------- Parallax backgrounds ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('.parallax-img'));
  let ticking = false;
  function updateParallax(){
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (rect.top) / vh; // -1..1 roughly
      const shift = progress * 40;
      el.style.transform = `translateY(${shift}px) scale(1.12)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();

  /* ---------- Particle canvases ---------- */
  function initParticles(canvas, opts = {}){
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const count = opts.count || 40;
    const color = opts.color || '198,161,91';
    let w, h, particles;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      const parent = canvas.parentElement;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
    }
    function makeParticles(){
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.6,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }
    function draw(){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10){ p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.alpha})`;
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  }
  initParticles(document.getElementById('pcanvas'), { count: 55 });
  initParticles(document.getElementById('pcanvasWhy'), { count: 34 });
  initParticles(document.getElementById('pcanvasGaleria'), { count: 34 });

  /* ---------- Hero cursor spotlight ---------- */
  const hero = document.getElementById('hero');
  if (hero){
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  /* ---------- Card tilt ---------- */
  function initTilt(selector, intensity){
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--rx', (px * intensity) + 'deg');
        card.style.setProperty('--ry', (-py * intensity) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    initTilt('.svc-card', 6);
    initTilt('.why-card', 4);
  }

  /* ---------- Gallery lightbox ---------- */
  const galCards = Array.from(document.querySelectorAll('.gal-card'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  if (lightbox && lbImg && galCards.length){
    let lbIndex = 0;
    function openLightbox(i){
      lbIndex = (i + galCards.length) % galCards.length;
      const card = galCards[lbIndex];
      const img = card.querySelector('img');
      const cap = card.querySelector('figcaption');
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lbCaption.textContent = cap ? cap.textContent : '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }
    function closeLightbox(){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }
    galCards.forEach((card, i) => card.addEventListener('click', () => openLightbox(i)));
    document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lbPrev')?.addEventListener('click', () => openLightbox(lbIndex - 1));
    document.getElementById('lbNext')?.addEventListener('click', () => openLightbox(lbIndex + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
      if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
    });
  }

  /* ---------- Back to top ---------- */
  const fabTop = document.getElementById('fabTop');
  const topRingFg = document.getElementById('topRingFg');
  const TOP_CIRC = 2 * Math.PI * 24;
  function updateTopProgress(){
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? scrollTop / height : 0;
    if (topRingFg) topRingFg.style.strokeDashoffset = String(TOP_CIRC * (1 - progress));
    if (fabTop) fabTop.classList.toggle('show', scrollTop > 500);
  }
  window.addEventListener('scroll', updateTopProgress, { passive: true });
  updateTopProgress();
  fabTop?.querySelector('.top-btn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Contact form -> WhatsApp ---------- */
  const WA_NUMBER = '524772917349';
  const form = document.getElementById('cForm');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const telefono = form.telefono.value.trim();
      const tipo = form.tipo.value;
      const mensaje = form.mensaje.value.trim();
      if (!nombre || !telefono || !tipo){
        form.reportValidity();
        return;
      }
      let text = `Hola, soy ${nombre}. Me interesa cotizar: ${tipo}.`;
      text += ` Mi teléfono es ${telefono}.`;
      if (mensaje) text += ` Detalles: ${mensaje}`;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      form.reset();
    });
  }
})();
