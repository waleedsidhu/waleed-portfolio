/* ============================================================
   app.js — animations, transitions, lightbox, perf tweaks
   ============================================================ */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helpers ---------- */
  const qs = (s, sc=document) => sc.querySelector(s);
  const qsa = (s, sc=document) => Array.from(sc.querySelectorAll(s));

  function setActiveNav() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    qsa('.nav-link').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if ((path === '' && href.endsWith('index.html')) || path === href) {
        a.classList.add('text-indigo-300');
      } else {
        a.classList.remove('text-indigo-300');
      }
    });
  }

  /* ---------- Hero entrance ---------- */
  function initHero() {
    if (prefersReduced || !window.gsap) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const img   = qs('.hero-img');
    const name  = qs('.hero-name'); // now <h1> on home
    const title = qs('.hero-title');
    const sub   = qs('.hero-sub');  // now <h3> on home
    const ctas  = qsa('.hero-ctas > *');

    if (img)   tl.from(img,   { y: 24, opacity: 0, duration: 0.7 });
    if (name)  tl.from(name,  { y: 22, opacity: 0, duration: 0.6 },  '-=0.45');
    if (title) tl.from(title, { y: 28, opacity: 0, duration: 0.65 }, '-=0.45');
    if (sub)   tl.from(sub,   { y: 18, opacity: 0, duration: 0.55 }, '-=0.35');
    if (ctas.length) {
      tl.fromTo(
        ctas,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, clearProps: 'transform' },
        '-=0.25'
      );
    }
  }

  /* ---------- Scroll reveals & counters ---------- */
  function initPageAnimations() {
    if (prefersReduced) return;

    if (window.gsap && window.ScrollTrigger) {
      qsa('.reveal').forEach(el => {
        gsap.fromTo(el,
          { y: 18, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true }
          }
        );
      });

      qsa('[data-counter]').forEach(el => {
        const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: target, duration: 1.2, ease: 'power1.out',
          snap: { innerText: 1 },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });
    } else {
      const io = new IntersectionObserver((e) => {
        e.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            target.style.transition = 'transform .6s ease, opacity .6s ease';
            target.style.transform = 'translateY(0)';
            target.style.opacity = '1';
            io.unobserve(target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px' });

      qsa('.reveal').forEach(el => {
        el.style.transform = 'translateY(14px)';
        el.style.opacity = '0';
        io.observe(el);
      });
    }
  }

  /* ---------- Lightbox (achievements) ---------- */
  function initLightbox() {
    const lb = qs('#lightbox');
    if (!lb) return;

    const img = qs('#lightbox-img');
    const cap = qs('#lightbox-cap');
    const close = qs('#lightbox-close');

    const open = (src, caption) => {
      img.src = src;
      cap.textContent = caption || '';
      lb.classList.remove('hidden');
      document.documentElement.style.overflow = 'hidden';
    };
    const hide = () => {
      lb.classList.add('hidden');
      document.documentElement.style.overflow = '';
    };

    qsa('.gallery-item img').forEach(el => {
      el.loading = el.loading || 'lazy';
      el.decoding = 'async';
      el.addEventListener('click', () => {
        const caption = el.closest('.gallery-item')?.getAttribute('data-caption') || '';
        open(el.currentSrc || el.src, caption);
      });
    });

    close?.addEventListener('click', hide);
    lb.addEventListener('click', (e) => { if (e.target === lb) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  }

  /* ---------- Lazy images ---------- */
  function initLazyImages() {
    qsa('img').forEach(img => {
      if (img.classList.contains('hero-img')) return; // keep hero eager
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  /* ---------- Hover lift + subtle tilt on images ---------- */
  function initHoverEffects() {
    if (prefersReduced) return;

    const targets = [
      ...qsa('.hero-img'),
      ...qsa('.gallery-item img')
    ];

    targets.forEach(el => {
      let raf = null;
      const bounds = () => el.getBoundingClientRect();

      function onMove(e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const b = bounds();
          const px = (e.clientX - b.left) / b.width - 0.5;
          const py = (e.clientY - b.top) / b.height - 0.5;
          const rx = py * -6;
          const ry = px * 6;
          el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px) scale(1.02)`;
        });
      }
      function onLeave() {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      }

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    });
  }

  /* ---------- Swup transitions ---------- */
  const overlayEnter = () => {
    if (prefersReduced || !window.gsap) return { eventCallback: (_, cb) => cb && cb() };
    return gsap.timeline().to('#transition-overlay', { yPercent: -100, duration: 0.7, ease: 'power3.inOut' });
  };
  const overlayExit = () => {
    if (prefersReduced || !window.gsap) return { eventCallback: (_, cb) => cb && cb() };
    return gsap.timeline()
      .set('#transition-overlay', { yPercent: 100 })
      .to('#transition-overlay', { yPercent: 0, duration: 0.7, ease: 'power3.inOut' });
  };

  /* ---------- Boot ---------- */
  function boot() {
    initHero();
    initPageAnimations();
    initLightbox();
    initLazyImages();
    initHoverEffects();
    setActiveNav();
  }

  document.addEventListener('DOMContentLoaded', () => {
    boot();

    // Swup page transitions
    const swup = new Swup({
      containers: ['#swup'],
      plugins: [ new SwupJsPlugin([{
        from: '(.*)', to: '(.*)',
        in: (next) => overlayEnter().eventCallback?.('onComplete', next) || next(),
        out: (next) => overlayExit().eventCallback?.('onComplete', next) || next()
      }]) ]
    });

    // Re-init after each content replace
    swup.hooks.on('content:replace', () => {
      if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(t => t.kill());
      boot();
    });
  });
})();
