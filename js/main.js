// Scroll choreography, carousels, cursor, menu state and preloader.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const S = window.SITE;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 900;
  const pad = (n, l = 2) => String(n).padStart(l, '0');

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: reduced ? 1 : 0.1, smoothWheel: !reduced, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
  }));

  // Run a callback only while an element is on screen
  function whileVisible(el, cb) {
    new IntersectionObserver(([en]) => cb(en.isIntersecting), { rootMargin: '10% 0px' }).observe(el);
  }

  /* ---------- Cursor: the dot sits exactly on the pointer, the ring catches up within a few frames ---------- */
  (function cursor() {
    const root = $('.cursor');
    if (!root) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) { root.remove(); return; }
    const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    let x = -100, y = -100, rx = x, ry = y, raf = 0, shown = false;
    const place = (el, px, py) => { el.style.transform = `translate3d(${px}px,${py}px,0)`; };
    function follow() { // runs only while the ring is still catching up, then stops
      rx += (x - rx) * 0.42; ry += (y - ry) * 0.42;
      if (Math.abs(x - rx) < 0.2 && Math.abs(y - ry) < 0.2) { rx = x; ry = y; }
      place(ring, rx, ry);
      raf = rx !== x || ry !== y ? requestAnimationFrame(follow) : 0;
    }
    addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      x = e.clientX; y = e.clientY;
      place(dot, x, y);
      if (!shown) { shown = true; rx = x; ry = y; place(ring, x, y); root.classList.add('is-on'); document.documentElement.classList.add('has-cursor'); }
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => { if (shown) root.classList.add('is-on'); });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      const txt = t ? t.getAttribute('data-cursor') : '';
      root.classList.toggle('has-label', !!txt);
      root.classList.toggle('is-hover', !!t && !txt);
      if (txt) label.textContent = txt;
    });
  })();

  /* ---------- Menu: colour follows the section underneath, current section is underlined ---------- */
  function navState() {
    const nav = $('.nav'), links = $$('.nav-links a');
    const sections = [
      ['.hero', 'light', null], ['.about', 'dark', '#about'], ['.journey', 'dark', '#journey'], ['.film', 'dark', '#journey'],
      ['.featured', 'light', '#projects'], ['.works', 'light', '#works'], ['.skills', 'dark', '#skills'], ['.contact', 'dark', '#contact']
    ];
    const set = (theme, href) => {
      nav.classList.toggle('is-light', theme === 'light');
      nav.classList.toggle('is-dark', theme === 'dark');
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === href));
    };
    sections.forEach(([sel, theme, href]) => {
      const sec = $(sel); if (!sec) return;
      // pinned sections sit inside a taller pin-spacer; use it so the state lasts for the whole pinned scroll
      const el = sec.parentElement && sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
      ScrollTrigger.create({ trigger: el, start: 'top 40px', end: 'bottom 40px', onToggle: (st) => { if (st.isActive) set(theme, href); } });
    });
    set('light', null);
    ScrollTrigger.create({ start: 40, end: 'max', onToggle: (st) => nav.classList.toggle('is-scrolled', st.isActive) });
    gsap.to('.nav-progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  }

  /* ---------- Hero ---------- */
  function heroScroll() {
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-title', { y: () => -innerHeight * 0.16, ease: 'none' }, 0)
      .to('.hero-figure', { y: () => innerHeight * 0.1, scale: 1.05, ease: 'none' }, 0)
      .to('.hero-foot, .hero-top', { opacity: 0, ease: 'none', duration: 0.4 }, 0);

    if (matchMedia('(pointer: fine)').matches) {
      const l1 = gsap.quickTo('.hero-title .l1', 'x', { duration: 1, ease: 'power3' });
      const l2 = gsap.quickTo('.hero-title .l2', 'x', { duration: 1.2, ease: 'power3' });
      const fx = gsap.quickTo('.hero-figure .bust, .hero-figure .photo', 'x', { duration: 1.4, ease: 'power3' });
      $('.hero').addEventListener('mousemove', (e) => {
        const n = e.clientX / innerWidth - 0.5;
        l1(n * -26); l2(n * 18); fx(n * 14);
      });
    }
  }
  function heroIntro() {
    const tl = gsap.timeline();
    tl.from('.hero-title .inner', { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.12 })
      .from('.hero-figure .bust, .hero-figure .photo', { yPercent: 18, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
      .from('.nav > *', { y: -16, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.4)
      .from('.hero-top > *, .hf-left, .hf-right', { y: 14, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.06 }, 0.55);
    return tl;
  }

  /* ---------- About ---------- */
  function about() {
    const panel = $('.about-panel');
    const dust = $('.dust');
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('i');
      d.style.left = 34 + Math.random() * 34 + '%';
      d.style.top = 20 + Math.random() * 40 + '%';
      d.style.animationDuration = 5 + Math.random() * 7 + 's';
      d.style.animationDelay = -Math.random() * 10 + 's';
      dust.appendChild(d);
    }

    const card = () => {
      const cw = Math.min(Math.max(innerWidth * (isMobile() ? 0.5 : 0.21), 190), 380), ch = cw * 1.2;
      return { t: Math.max(0, (panel.offsetHeight - ch) / 2), l: Math.max(0, (panel.offsetWidth - cw) / 2) };
    };
    const stats = $$('.ac-stats b').map((b) => ({ el: b, to: parseFloat(b.dataset.count), suf: b.dataset.suffix, dec: b.dataset.count.includes('.') ? 1 : 0 }));
    const counter = { v: 0 };
    const spread = () => innerWidth * (isMobile() ? 0.26 : 0.34);

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.about', start: 'top top', end: '+=240%', pin: true, scrub: 1, invalidateOnRefresh: true }
    });
    tl.fromTo(panel, { '--it': () => card().t + 'px', '--il': () => card().l + 'px', '--ir': '18px' },
      { '--it': '0px', '--il': '0px', '--ir': '28px', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.about-title .w1', { x: 0 }, { x: () => -spread(), ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.about-title .w2', { x: () => innerWidth * 0.03 }, { x: () => spread(), ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.about-title', { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.78)
      .fromTo('.about-sky', { scale: 1 }, { scale: 1.14, ease: 'none', duration: 1.3 }, 0)
      .fromTo('.about-shade', { opacity: 0 }, { opacity: 0.8, ease: 'none', duration: 1 }, 0.15)
      .fromTo('.about-content > *', { y: 46, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.35, ease: 'power2.out' }, 0.86)
      .to(counter, {
        v: 1, duration: 0.4, ease: 'power1.out',
        onUpdate: () => stats.forEach((s) => { s.el.textContent = (s.to * counter.v).toFixed(s.dec) + s.suf; })
      }, 0.95)
      .to({}, { duration: 0.35 });
  }

  /* ---------- Journey ---------- */
  function scramble(el, text, dur = 650) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>*+=';
    const token = (el._tok = (el._tok || 0) + 1), t0 = performance.now();
    (function frame(now) {
      if (token !== el._tok) return;
      const p = Math.min(1, (now - t0) / dur), n = Math.floor(p * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) s += i < n || text[i] === ' ' ? text[i] : chars[(Math.random() * chars.length) | 0];
      el.textContent = s;
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }
  function journey() {
    const J = S.journey, n = J.length;
    const track = $('.j-track');
    const words = J.map((j) => j.role).concat(['2026', 'ASHOKA', 'TABLA']);
    track.innerHTML = words.concat(words).map((w) => `<span>${w}</span>`).join('');
    const prog = $('.j-progress');
    prog.innerHTML = J.map(() => '<i><b></b></i>').join('');
    const bars = $$('b', prog);
    const roleEl = $('.j-role'), whenEl = $('.j-when'), orgEl = $('.j-org'), descEl = $('.j-desc'), tagsEl = $('.j-tags'), countEl = $('.j-count');
    let cur = -1, glitchT;

    function set(i) {
      if (i === cur) return;
      cur = i;
      const j = J[i];
      countEl.textContent = `${pad(i + 1)} / ${pad(n)}`;
      roleEl.dataset.text = j.role;
      roleEl.classList.add('is-glitching');
      clearTimeout(glitchT); glitchT = setTimeout(() => roleEl.classList.remove('is-glitching'), 480);
      scramble(roleEl, j.role);
      gsap.fromTo([whenEl, orgEl, descEl, tagsEl], { y: 18, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.05, ease: 'power3.out', overwrite: true });
      whenEl.textContent = j.when; orgEl.textContent = j.org; descEl.textContent = j.desc;
      tagsEl.innerHTML = j.tags.map((t) => `<li>${t}</li>`).join('');
    }
    set(0);

    gsap.timeline({
      scrollTrigger: {
        trigger: '.journey', start: 'top top', end: () => '+=' + innerHeight * n * 0.85, pin: true, scrub: 0.6,
        onUpdate: (st) => {
          const p = st.progress * n;
          set(Math.min(n - 1, Math.floor(p)));
          bars.forEach((b, k) => gsap.set(b, { scaleX: Math.max(0, Math.min(1, p - k)) }));
        }
      }
    }).fromTo(track, { xPercent: 0 }, { xPercent: -50, ease: 'none' }, 0)
      .fromTo('.j-title', { x: 0 }, { x: () => -innerWidth * 0.02, ease: 'none' }, 0);

    gsap.from('.j-left > *', { y: 60, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.journey', start: 'top 70%' } });
  }

  /* ---------- Featured: concave cylinder built from 3D strips ---------- */
  function featured(covers) {
    const items = S.featured, n = items.length, N = 14;
    const root = $('.cyl'), scene = $('.cyl-scene');
    const strips = [];
    items.forEach((p, ci) => {
      for (let j = 0; j < N; j++) {
        const el = document.createElement('div');
        el.className = 'strip';
        el.style.backgroundImage = `url(${covers[p.id]})`;
        el.dataset.card = ci;
        scene.appendChild(el);
        strips.push({ el, ci, j });
      }
    });
    let cardW, cardH, R, cardA, stepA, stripW;
    function layout() {
      const m = isMobile();
      cardW = Math.min(innerWidth * (m ? 0.74 : 0.38), 660);
      cardH = cardW * (Covers.H / Covers.W);
      cardA = (m ? 50 : 32) * Math.PI / 180;
      stepA = cardA + (m ? 6 : 3.2) * Math.PI / 180;
      R = cardW / cardA;
      stripW = cardW / N;
      for (const s of strips) {
        Object.assign(s.el.style, {
          width: stripW + 1 + 'px', height: cardH + 'px',
          marginLeft: -stripW / 2 + 'px', marginTop: -cardH / 2 + 'px',
          backgroundSize: `${cardW}px ${cardH}px`, backgroundPosition: `${-s.j * stripW}px 0`
        });
      }
    }
    layout(); addEventListener('resize', layout);

    let pos = 0, target = 0, active = -1, visible = false, tiltX = 0, tiltT = 0;
    const title = $('.f-title'), sub = $('.f-sub'), count = $('.f-count');
    function setActive(i) {
      if (i === active) return; active = i;
      count.textContent = `${pad(i + 1)} / ${pad(n)}`;
      gsap.fromTo([title, sub], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true });
      title.textContent = items[i].title; sub.textContent = items[i].short;
    }
    function render() {
      if (!visible) return;
      pos += (target - pos) * 0.085;
      tiltX += (tiltT - tiltX) * 0.06;
      scene.style.transform = `translateZ(${-R * 0.18}px) rotateX(${tiltX}deg)`;
      const half = (N - 1) / 2, da = cardA / N;
      for (const s of strips) {
        const a = (s.ci - pos) * stepA + (s.j - half) * da;
        if (Math.abs(a) > 1.45) { s.el.style.visibility = 'hidden'; continue; }
        s.el.style.visibility = 'visible';
        s.el.style.transform = `translate3d(${R * Math.sin(a)}px,0,${R * (1 - Math.cos(a))}px) rotateY(${-a}rad)`;
      }
      setActive(Math.max(0, Math.min(n - 1, Math.round(pos))));
    }
    gsap.ticker.add(render);
    whileVisible(root, (v) => { visible = v; });
    root.addEventListener('mousemove', (e) => { tiltT = (e.clientY / innerHeight - 0.5) * -6; });
    root.addEventListener('click', (e) => {
      const s = e.target.closest('.strip');
      openModal(items[s ? +s.dataset.card : active], covers);
    });

    ScrollTrigger.create({
      trigger: '.featured', start: 'top top', end: () => '+=' + innerHeight * (n - 1) * 0.6, pin: true, scrub: true,
      onUpdate: (st) => { target = st.progress * (n - 1); }
    });
    gsap.from('.featured .big-head', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.featured', start: 'top 75%' } });
  }

  /* ---------- Works: tilted rotating ring ---------- */
  function works(covers) {
    const items = S.works, n = items.length, step = 360 / n;
    const ring = $('.ring'), wrap = $('.ring-wrap'), list = $('.w-list');
    const cards = items.map((p, i) => {
      const c = document.createElement('div');
      c.className = 'rcard'; c.dataset.i = i;
      c.innerHTML = `<div class="face front" style="background-image:url(${covers[p.id]})"></div><div class="face back">${p.title}</div>`;
      ring.appendChild(c);
      return c;
    });
    list.innerHTML = items.map((p) => `<li>${p.title}</li>`).join('');
    const lis = $$('li', list);
    let R = 0;
    function layout() {
      const w = Math.min(innerWidth * (isMobile() ? 0.42 : 0.19), 300), h = w * (Covers.H / Covers.W);
      R = (w / (2 * Math.tan(Math.PI / n))) * 1.3;
      cards.forEach((c, i) => Object.assign(c.style, {
        width: w + 'px', height: h + 'px', left: -w / 2 + 'px', top: -h / 2 + 'px',
        transform: `rotateY(${i * step}deg) translateZ(${R}px)`
      }));
    }
    layout(); addEventListener('resize', layout);

    let ang = 0, angT = 0, tilt = 62, tiltT = 62, visible = false, active = -1;
    const title = $('.w-title'), sub = $('.w-sub'), idx = $('.w-idx');
    function setActive(i) {
      if (i === active) return; active = i;
      lis.forEach((li, k) => li.classList.toggle('on', k === i));
      idx.textContent = `${pad(i + 1)} / ${pad(n)}`;
      gsap.fromTo([title, sub], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true });
      title.textContent = items[i].title; sub.textContent = items[i].short;
    }
    gsap.ticker.add(() => {
      if (!visible) return;
      ang += (angT - ang) * 0.08; tilt += (tiltT - tilt) * 0.08;
      ring.style.transform = `rotateX(${-tilt}deg) rotateY(${ang}deg)`;
      setActive(((Math.round(-ang / step) % n) + n) % n);
    });
    whileVisible(wrap, (v) => { visible = v; });
    wrap.addEventListener('click', (e) => {
      const c = e.target.closest('.rcard');
      openModal(items[c ? +c.dataset.i : active], covers);
    });
    ScrollTrigger.create({
      trigger: '.works', start: 'top top', end: () => '+=' + innerHeight * 2.2, pin: true, scrub: true,
      onUpdate: (st) => {
        const p = st.progress;
        tiltT = 62 - 42 * Math.min(1, p / 0.35);
        angT = -p * step * (n - 1);
      }
    });
    gsap.from('.works .big-head', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.works', start: 'top 75%' } });
  }

  /* ---------- Contact ---------- */
  function contact() {
    const chrome = $('.chrome');
    gsap.fromTo(chrome, { '--shine': '0%' }, { '--shine': '100%', duration: 4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.from('.chrome', { yPercent: 40, opacity: 0, scale: 0.94, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
    gsap.from('.c-text, .c-pills .btn', { y: 30, opacity: 0, duration: 1, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 55%' } });
    const clock = $('.clock');
    const tick = () => { clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()); };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Modal ---------- */
  const modal = $('.modal');
  function openModal(p, covers) {
    if (!p) return;
    $('.modal-cover', modal).style.backgroundImage = `url(${covers[p.id]})`;
    $('.m-title', modal).textContent = p.title;
    $('.m-tech', modal).textContent = p.tech.join(' · ');
    $('.m-desc', modal).textContent = p.desc;
    $('.m-feat', modal).innerHTML = p.features.map((f) => `<li>${f}</li>`).join('');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    lenis.stop();
    gsap.to('.modal-backdrop', { opacity: 1, duration: 0.4 });
    gsap.fromTo('.modal-card', { y: 50, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    $('.modal-card').scrollTop = 0;
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    gsap.to('.modal-backdrop', { opacity: 0, duration: 0.3 });
    gsap.to('.modal-card', {
      y: 30, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); lenis.start(); }
    });
  }
  $('.modal-close').addEventListener('click', closeModal);
  $('.modal-backdrop').addEventListener('click', closeModal);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Boot: preloader paints the sky, then everything starts ---------- */
  async function boot() {
    const countEl = $('.pl-count'), circle = $('.pl-ring circle');
    let progress = 0, shown = 0;
    const show = () => {
      shown += (progress - shown) * 0.12;
      countEl.textContent = pad(Math.round(shown * 100), 3);
      circle.style.strokeDashoffset = 100 - shown * 100;
    };
    gsap.ticker.add(show);

    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
    await Promise.all(['800 100px Archivo', '600 20px "JetBrains Mono"'].map((f) => document.fonts.load(f).catch(() => {})));

    // a tab can report a 0x0 viewport while hidden; fall back to 16:10 instead of NaN
    const vw = innerWidth || screen.width || 1440, vh = innerHeight || screen.height || 900;
    const aspect = Math.max(0.5, Math.min(2.2, vw / vh)) || 1.6;
    const area = vw <= 900 ? 1.0e6 : 1.7e6;
    const H = Math.round(Math.sqrt(area / aspect)), W = Math.round(H * aspect);
    let sky = null, covers = {};
    try {
      sky = await Starry.paint(W, H, (p) => { progress = p * 0.86; });
      sky.className = 'sky-canvas';
      $('.about-sky').appendChild(sky);
    } catch (err) { console.error('Sky painting failed', err); }
    try { covers = Covers.build(S.featured.concat(S.works), sky); } catch (err) { console.error('Covers failed', err); }
    progress = 1;

    about();
    journey();
    if (window.Film) { try { Film.init(sky); } catch (err) { console.error('Story film failed', err); } }
    featured(covers);
    works(covers);
    if (window.Skills) Skills.init(sky, lenis).catch((err) => console.error('Skills hall failed', err));
    contact();
    heroScroll();
    navState();

    const flow = Starry.flowLayer($('.about-flow'));
    whileVisible($('.about'), (v) => (v && !reduced ? flow.start() : flow.stop()));

    // let the counter catch up (time-capped so a throttled tab never hangs here)
    await Promise.race([
      new Promise((r) => { const w = () => (shown > 0.985 ? r() : requestAnimationFrame(w)); w(); }),
      new Promise((r) => setTimeout(r, 1200))
    ]);
    gsap.ticker.remove(show);
    countEl.textContent = '100';

    const out = gsap.timeline({
      onComplete: () => { $('.preloader').remove(); document.body.classList.remove('is-loading'); lenis.start(); ScrollTrigger.refresh(); }
    });
    out.to('.pl-name', { yPercent: -60, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0.1)
      .to('.pl-foot', { opacity: 0, duration: 0.4 }, 0.1)
      .to('.pl-ring', { scale: 6, opacity: 0, duration: 1.2, ease: 'expo.in' }, 0.1)
      .to('.preloader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 0.7)
      .add(heroIntro(), 1.15);
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  boot();
})();
