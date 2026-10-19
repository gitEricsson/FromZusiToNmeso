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

  /* ---------- Candles: lights out, make a wish, blow (mic or hold), one trick candle ---------- */
  const cake = $('#cake'), blowBtn = $('#blowBtn'), blowLabel = $('.blow-label'), wish = $('#wishText'), cue = $('#scrollCue');
  const hero = $('.hero'), heroContent = $('.hero-content'), blowWrap = $('.blow-wrap');
  const countdown = $('#countdown'), hint = $('#blowHint'), trickNote = $('#trickNote');
  const flames = $$('.flame', cake), leans = $$('.lean', cake), smokes = $$('.smoke', cake);
  const IDLE_LABEL = blowLabel.innerHTML;
  const DURABILITY = [0.7, 1.25, 0.95]; // seconds of steady breath each candle takes
  const TRICK_DURABILITY = 0.5;
  // idle → dark (countdown) → blowing → between → trick → done
  let state = 'idle';
  let lit = [true, true, true];
  let acc = [0, 0, 0];
  let holding = false, breath = 0, mic = null, lastT = 0, blowStart = 0;
  let trickReadyAt = 0; // the trick candle ignores breath until she has paused and blown again

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
  const litCount = () => lit.filter(Boolean).length;
  const setLight = () => {
    cake.style.setProperty('--lit', litCount() / 3);
    heroContent.style.setProperty('--glow', Math.max(.12, litCount() / 3));
  };
  // centre the candlelight on the middle flame
  const aimLight = () => {
    const box = heroContent.getBoundingClientRect(), f = flames[1].getBoundingClientRect();
    heroContent.style.setProperty('--cx', `${f.left + f.width / 2 - box.left}px`);
    heroContent.style.setProperty('--cy', `${f.top + f.height / 2 - box.top}px`);
  };
  addEventListener('resize', () => { if (hero.classList.contains('dark')) aimLight(); });

  /* microphone: only loudness is read, nothing is recorded, and it stops as soon as the candles are out */
  const startMic = async () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext || !Ctx) return;
    const ctx = new Ctx(); // created inside the tap so mobile browsers let it run
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (state === 'idle' || state === 'done') { stream.getTracks().forEach((t) => t.stop()); ctx.close(); return; }
      await ctx.resume();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      mic = { ctx, stream, analyser, data: new Float32Array(analyser.fftSize), floor: .01 };
      if (state === 'blowing' || state === 'trick') showBlowPrompt();
    } catch (_) {
      ctx.close();
    }
  };
  const micLevel = () => {
    if (!mic) return 0;
    mic.analyser.getFloatTimeDomainData(mic.data);
    let sum = 0;
    for (const v of mic.data) sum += v * v;
    const rms = Math.sqrt(sum / mic.data.length);
    if (state === 'dark') { mic.floor = mic.floor * .9 + rms * .1; return 0; } // learn the room's noise during the countdown
    return Math.min(1, Math.max(0, (rms - mic.floor * 2 - .015) / .12));
  };
  const stopMic = () => {
    if (!mic) return;
    mic.stream.getTracks().forEach((t) => t.stop());
    mic.ctx.close();
    mic = null;
  };

  const showBlowPrompt = () => {
    hint.textContent = mic ? 'into your phone, or hold the button' : 'press and hold the button';
    hint.classList.add('show');
  };
  const progress = () => (state === 'trick'
    ? Math.min(1, acc[1] / TRICK_DURABILITY)
    : DURABILITY.reduce((sum, d, i) => sum + (lit[i] ? Math.min(1, acc[i] / d) : 1), 0) / 3);

  const loop = (now) => {
    if (state === 'idle' || state === 'done') return;
    const dt = Math.min(.05, (now - lastT) / 1000);
    lastT = now;
    const input = Math.max(holding ? 1 : 0, micLevel());
    breath += (input - breath) * (input > breath ? .35 : .12);
    leans.forEach((el, i) => {
      const b = lit[i] ? breath : 0;
      el.style.setProperty('--lean', (b * (22 + i * 5) + (Math.random() - .5) * b * 16).toFixed(1));
      el.style.setProperty('--squash', b.toFixed(2));
    });
    if (state === 'trick' && trickReadyAt === Infinity && breath < .15) trickReadyAt = now + 900;
    if ((state === 'blowing' || (state === 'trick' && now >= trickReadyAt)) && breath > .3) {
      lit.forEach((on, i) => {
        if (!on) return;
        acc[i] += dt * breath;
        if (acc[i] >= (state === 'trick' ? TRICK_DURABILITY : DURABILITY[i])) snuff(i);
      });
      blowBtn.style.setProperty('--p', progress());
    }
    if (state === 'blowing' && !hint.dataset.nudged && now - blowStart > 7000 && breath < .1) {
      hint.textContent = mic ? 'a little harder, or hold the button' : 'press and hold the button';
      hint.dataset.nudged = '1';
    }
    requestAnimationFrame(loop);
  };

  const snuff = (i) => {
    lit[i] = false;
    acc[i] = 0;
    flames[i].classList.remove('relit');
    flames[i].classList.add('out');
    restart(smokes[i], 'go');
    setLight();
    if (litCount()) return;
    if (state === 'blowing') trickCandle();
    else finish();
  };

  const trickCandle = async () => {
    state = 'between';
    hint.classList.remove('show');
    blowBtn.style.setProperty('--p', 0);
    wish.textContent = 'WISH MADE…';
    await wait(1000);
    if (state !== 'between') return;
    lit[1] = true;
    flames[1].classList.remove('out');
    restart(flames[1], 'relit');
    setLight();
    trickNote.classList.add('show');
    wish.textContent = 'ONE MORE TIME';
    trickReadyAt = Infinity;
    state = 'trick';
  };

  const celebrateCake = () => {
    const origin = originOf(cake, .2);
    shoot({ particleCount: 130, spread: 95, startVelocity: 45, origin });
    setTimeout(() => shoot({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: .85 } }), 250);
    setTimeout(() => shoot({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: .85 } }), 400);
    setTimeout(() => heartsBurst(origin, 18), 650);
    cue.classList.add('show');
  };

  const finish = async () => {
    state = 'done';
    stopMic();
    holding = false;
    trickNote.classList.remove('show');
    hint.classList.remove('show');
    blowBtn.classList.remove('holdable', 'holding');
    blowBtn.style.removeProperty('--p');
    blowBtn.disabled = true;
    blowLabel.textContent = 'CANDLES OUT';
    leans.forEach((el) => { el.style.removeProperty('--lean'); el.style.removeProperty('--squash'); });
    await wait(800);
    hero.classList.remove('dark');
    restart(hero, 'lights-on');
    document.body.classList.remove('locked');
    wish.textContent = 'WISH SEALED. NO TAKE-BACKS.';
    await wait(450);
    celebrateCake();
  };

  // reduced motion: one tap, candles out, no dark room or countdown
  const quickBlow = () => {
    state = 'done';
    lit = [false, false, false];
    flames.forEach((f) => f.classList.add('out'));
    setLight();
    blowBtn.disabled = true;
    blowLabel.textContent = 'CANDLES OUT';
    wish.textContent = 'WISH SEALED. NO TAKE-BACKS.';
    celebrateCake();
  };

  const startRitual = async () => {
    if (state !== 'idle') return;
    if (reduce) return quickBlow();
    state = 'dark';
    document.body.classList.add('locked');
    aimLight();
    setLight();
    hero.classList.remove('lights-on');
    hero.classList.add('dark');
    blowWrap.classList.add('counting');
    wish.textContent = 'CLOSE YOUR EYES AND MAKE A WISH…';
    startMic();
    lastT = performance.now();
    requestAnimationFrame(loop);
    await wait(1600);
    for (const n of ['3', '2', '1']) {
      if (state !== 'dark') return;
      countdown.textContent = n;
      restart(countdown, 'tick');
      await wait(1000);
    }
    if (state !== 'dark') return;
    countdown.textContent = '';
    blowWrap.classList.remove('counting');
    blowLabel.textContent = 'HOLD TO BLOW';
    blowBtn.classList.add('holdable');
    wish.textContent = 'NOW BLOW';
    state = 'blowing';
    blowStart = performance.now();
    showBlowPrompt();
  };

  const relight = () => {
    stopMic();
    state = 'idle';
    lit = [true, true, true];
    acc = [0, 0, 0];
    breath = 0;
    holding = false;
    flames.forEach((f) => { f.classList.remove('out'); restart(f, 'relit'); });
    setLight();
    hero.classList.remove('dark', 'lights-on');
    blowWrap.classList.remove('counting');
    blowBtn.disabled = false;
    blowBtn.classList.remove('holdable', 'holding');
    blowLabel.innerHTML = IDLE_LABEL;
    trickNote.classList.remove('show');
    hint.classList.remove('show');
    delete hint.dataset.nudged;
    wish.textContent = 'MAKE A WISH!!';
    cue.classList.remove('show');
  };

  const canBlow = () => state === 'blowing' || state === 'trick';
  const press = (e) => {
    if (!canBlow()) return;
    e.preventDefault();
    try { blowBtn.setPointerCapture(e.pointerId); } catch (_) { /* keyboard or synthetic event */ }
    holding = true;
    blowBtn.classList.add('holding');
    if (mic && mic.ctx.state === 'suspended') mic.ctx.resume();
  };
  const release = () => { holding = false; blowBtn.classList.remove('holding'); };
  blowBtn.addEventListener('pointerdown', press);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => blowBtn.addEventListener(t, release));
  blowBtn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(e); });
  blowBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') release(); });
  blowBtn.addEventListener('contextmenu', (e) => { if (canBlow()) e.preventDefault(); });
  blowBtn.addEventListener('click', startRitual);
  cake.addEventListener('click', startRitual);

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

  /* ---------- Gift form (emails Omozusi via the send-gift function) ---------- */
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
      const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
      if (isLocal) {
        // The plain local server has no functions; pretend so the flow can be previewed.
        await new Promise((r) => setTimeout(r, 900));
      } else {
        const res = await fetch('/.netlify/functions/send-gift', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bank: bank.value.trim(),
            account_number: acct.value,
            bot: form.elements['bot-field'].value,
          }),
        });
        if (!res.ok) throw new Error(`send-gift ${res.status}: ${await res.text()}`);
      }
      celebrate();
    } catch (err) {
      console.error(err);
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
