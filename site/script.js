(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;
  const PURPLES = ['#3b0a4f', '#5a189a', '#7b2cbf', '#9d4edd', '#c8b6ff', '#e7dcff', '#ffffff'];
  const rand = (a, b) => a + Math.random() * (b - a);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Confetti (own canvas so it sits above every overlay) ---------- */
  let shoot = () => {};
  let heartShape = null;
  if (window.confetti) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:160';
    document.body.append(canvas);
    const c = confetti.create(canvas, { resize: true, useWorker: false });
    shoot = (opts) => c({ colors: PURPLES, disableForReducedMotion: true, ...opts });
    try { heartShape = confetti.shapeFromText({ text: '💜', scalar: 2.2 }); } catch (_) { heartShape = null; }
  }
  const heartsBurst = (origin, count = 26) => {
    if (!heartShape) return shoot({ particleCount: count * 2, spread: 100, origin });
    shoot({ particleCount: count, spread: 110, startVelocity: 32, scalar: 2.2, shapes: [heartShape], origin, ticks: 160 });
  };
  const originOf = (el, yFactor = .5) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * yFactor) / innerHeight };
  };

  /* ---------- Floating background hearts ---------- */
  const sky = $('.sky');
  for (let i = 0; i < (innerWidth < 600 ? 12 : 20); i++) {
    const s = document.createElement('span');
    s.className = 'floaty';
    s.textContent = '♡';
    s.style.setProperty('--x', rand(0, 100) + '%');
    s.style.setProperty('--s', rand(12, 28) + 'px');
    s.style.setProperty('--dur', rand(12, 24) + 's');
    s.style.setProperty('--delay', -rand(0, 24) + 's');
    s.style.setProperty('--spin', rand(-180, 180) + 'deg');
    sky.append(s);
  }

  /* ---------- Tap bursts ---------- */
  const spawnHeart = (x, y, { s = 16, tx = 0, ty = -60, rot = 20 } = {}) => {
    const el = document.createElement('span');
    el.className = 'trail';
    el.textContent = '♡';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--s', s + 'px');
    el.style.setProperty('--tx', tx + 'px');
    el.style.setProperty('--ty', ty + 'px');
    el.style.setProperty('--rot', rot + 'deg');
    document.body.append(el);
    el.addEventListener('animationend', () => el.remove());
  };
  if (!reduce) {
    addEventListener('pointerdown', (e) => {
      if (e.target.closest('input, .field, .lightbox')) return;
      for (let i = 0; i < 6; i++) {
        spawnHeart(e.clientX, e.clientY, { s: rand(12, 22), tx: rand(-70, 70), ty: rand(-30, -110), rot: rand(-60, 60) });
      }
    }, { passive: true });
  }

  /* ---------- Scroll reveals ---------- */
  const anchors = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      anchors.get(e.target)?.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => {
    // flying polaroids start off-screen, so watch their (untransformed) slot instead
    const anchor = el.closest('.slot') || el;
    anchors.set(anchor, el);
    io.observe(anchor);
  });

  /* ---------- Gate + hero intro ---------- */
  const gate = $('#gate');
  const heroIntro = () => {
    if (!motion) return;
    $$('.ribbon path').forEach((p) => {
      const L = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.8, ease: 'expo.out', delay: .2 });
    });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.bunting', { y: -140, duration: 1.2, stagger: .15 })
      .fromTo('.hb-title span', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut' }, .35)
      .from('.hb-name', { y: 30, opacity: 0, letterSpacing: '.4em', duration: 1.1 }, '-=.9')
      .from('.hb-wish', { opacity: 0, y: 10, duration: .6 }, '-=.6')
      .from('.blow-wrap', { y: 16, opacity: 0, duration: .8 }, '-=.35')
      .from('.cake', { y: 90, opacity: 0, duration: 1.3 }, '-=.7')
      .from('.candle', { scaleY: 0, transformOrigin: '50% 100%', stagger: .1, duration: .7 }, '-=.6')
      .from('.hero .deco', { opacity: 0, stagger: .07, duration: .6 }, '-=1');
  };
  $('#gateBtn').addEventListener('click', () => {
    gate.classList.add('out');
    document.body.classList.remove('locked');
    heroIntro();
    shoot({ particleCount: 70, spread: 80, startVelocity: 38, origin: { x: .5, y: .55 } });
    setTimeout(() => gate.remove(), reduce ? 0 : 1000);
  });

  /* ---------- Candles ---------- */
  const cake = $('#cake'), blowBtn = $('#blowBtn'), wish = $('#wishText'), cue = $('#scrollCue');
  const blow = () => {
    if (cake.classList.contains('blown')) return;
    cake.classList.remove('relight');
    cake.classList.add('blown');
    blowBtn.disabled = true;
    wish.textContent = 'WISH MADE';
    const origin = originOf(cake, .2);
    shoot({ particleCount: 130, spread: 95, startVelocity: 45, origin });
    setTimeout(() => shoot({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: .85 } }), 250);
    setTimeout(() => shoot({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: .85 } }), 400);
    setTimeout(() => heartsBurst(origin, 18), 650);
    cue.classList.add('show');
  };
  const relight = () => {
    cake.classList.remove('blown');
    void cake.getBoundingClientRect();
    cake.classList.add('relight');
    blowBtn.disabled = false;
    wish.textContent = 'MAKE A WISH!!';
    cue.classList.remove('show');
  };
  blowBtn.addEventListener('click', blow);
  cake.addEventListener('click', blow);

  /* ---------- Scroll-driven effects ---------- */
  if (motion) {
    gsap.to('.hero-content', {
      yPercent: 14, opacity: .25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.big24-wrap', { scale: .55, rotation: -10 }, {
      scale: 1, rotation: 0, ease: 'none',
      scrollTrigger: { trigger: '.twentyfour', start: 'top bottom', end: 'center center', scrub: true },
    });
    gsap.to('#fill24', {
      clipPath: 'inset(0% 0 0 0)', ease: 'none',
      scrollTrigger: { trigger: '.twentyfour', start: 'top 70%', end: 'center 40%', scrub: true },
    });
    // GSAP owns `transform`, so parallax goes on the slot and the polaroid keeps its CSS reveal/tilt.
    $$('.polaroid[data-speed]').forEach((el) => {
      const d = +el.dataset.speed;
      gsap.fromTo(el.parentElement, { y: d }, {
        y: -d, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  } else {
    $('#fill24').style.clipPath = 'inset(0 0 0 0)';
  }

  /* ---------- Envelope + letter ---------- */
  const env = $('#envelope'), letterSec = $('#letter'), dear = $('#dear');
  const typeDear = () => {
    const text = 'Dear Nmeso,';
    if (reduce) { dear.textContent = text; dear.classList.add('done'); return; }
    let i = 0;
    const step = () => {
      dear.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 85 + Math.random() * 60);
      else setTimeout(() => dear.classList.add('done'), 1400);
    };
    step();
  };
  const openEnvelope = () => {
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    env.setAttribute('aria-label', 'Letter opened');
    const origin = originOf(env, .55);
    setTimeout(() => heartsBurst(origin, 22), 250);
    setTimeout(() => shoot({ particleCount: 60, spread: 70, startVelocity: 30, origin }), 1100);
    setTimeout(() => {
      letterSec.hidden = false;
      if (hasGsap) ScrollTrigger.refresh();
      letterSec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (motion) gsap.from('.letter', { y: 140, scale: .88, rotation: -3, opacity: 0, duration: 1.3, ease: 'power3.out' });
      setTimeout(typeDear, reduce ? 0 : 800);
    }, reduce ? 50 : 2200);
  };
  env.addEventListener('click', openEnvelope);
  env.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });

  /* ---------- Gift form (Netlify Forms) ---------- */
  const form = $('#giftForm'), bank = $('#bank'), acct = $('#acct');
  const count = $('#acctCount'), sendBtn = $('#sendBtn'), msg = $('#formMsg');
  const setErr = (input, text) => {
    const f = input.closest('.field');
    f.classList.add('bad');
    f.querySelector('.err').textContent = text;
    f.classList.remove('shake');
    void f.offsetWidth;
    f.classList.add('shake');
  };
  const clearErr = (input) => {
    const f = input.closest('.field');
    f.classList.remove('bad');
    f.querySelector('.err').textContent = '';
  };
  acct.addEventListener('input', () => {
    const digits = acct.value.replace(/\D/g, '').slice(0, 10);
    if (digits !== acct.value) acct.value = digits;
    count.textContent = `${digits.length}/10`;
    count.classList.toggle('ok', digits.length === 10);
    if (digits.length === 10) clearErr(acct);
  });
  bank.addEventListener('input', () => { if (bank.value.trim().length > 1) clearErr(bank); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    if (bank.value.trim().length < 2) { setErr(bank, 'Which bank, my darling?'); ok = false; }
    if (!/^\d{10}$/.test(acct.value)) { setErr(acct, "That's not 10 digits yet."); ok = false; }
    if (!ok) return;

    sendBtn.classList.add('loading');
    msg.textContent = '';
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
      if (isLocal) {
        // Netlify Forms only exist once deployed; pretend locally so the flow can be previewed.
        await new Promise((r) => setTimeout(r, 900));
      } else {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      celebrate();
    } catch (_) {
      msg.textContent = "Hmm, that didn't send. Check your connection and try again?";
    } finally {
      sendBtn.classList.remove('loading');
    }
  });

  /* ---------- Thank-you ---------- */
  const done = $('#giftDone');
  const celebrate = () => {
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    const origin = originOf(done, .4);
    heartsBurst(origin, 36);
    shoot({ particleCount: 160, spread: 120, startVelocity: 50, origin });
    if (reduce) return;
    const end = Date.now() + 3000;
    (function frame() {
      shoot({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: .7 } });
      shoot({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: .7 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };
  $('#againBtn').addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(relight, reduce ? 0 : 900);
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbInner = $('#lbInner');
  const closeLb = () => {
    lb.hidden = true;
    lbInner.innerHTML = '';
    document.body.classList.remove('locked');
  };
  $$('.pol-media').forEach((btn) => {
    btn.addEventListener('click', () => {
      const media = document.createElement(btn.hasAttribute('data-video') ? 'video' : 'img');
      media.src = btn.dataset.full;
      if (media.tagName === 'VIDEO') {
        Object.assign(media, { controls: true, autoplay: true, playsInline: true, loop: true });
      } else {
        media.alt = btn.querySelector('img').alt;
      }
      lbInner.append(media);
      lb.hidden = false;
      document.body.classList.add('locked');
    });
  });
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
})();
