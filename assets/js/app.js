/* app.js — animations, transitions, lightbox, perf tweaks, and LinkedIn badge footer injection */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========= Animations ========= */
  function initHero() {
    if (prefersReduced || !window.gsap) return;
    const img = document.querySelector(".hero-img");
    const title = document.querySelector(".hero-title");
    const sub = document.querySelector(".hero-sub");
    const ctas = document.querySelectorAll(".hero-ctas > *");

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (img) tl.from(img, { y: 18, opacity: 0, duration: 0.6 });
    if (title) tl.from(title, { y: 22, opacity: 0, duration: 0.6 }, "-=0.35");
    if (sub) tl.from(sub, { y: 16, opacity: 0, duration: 0.55 }, "-=0.35");
    if (ctas.length) tl.from(ctas, { y: 12, opacity: 0, duration: 0.45, stagger: 0.07 }, "-=0.25");
  }

  function initPageAnimations() {
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;
    // Scroll reveals
    document.querySelectorAll(".reveal").forEach((el) => {
      gsap.fromTo(el, { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", once: true }
      });
    });

    // Counters (optional if present)
    document.querySelectorAll("[data-counter]").forEach((el) => {
      const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target, duration: 1.2, ease: "power1.out",
        snap: { innerText: 1 },
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });
  }

  /* ========= Lightbox ========= */
  function initLightbox() {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    const img = document.getElementById("lightbox-img");
    const cap = document.getElementById("lightbox-cap");
    const close = document.getElementById("lightbox-close");

    const open = (src, caption) => {
      img.src = src;
      cap.textContent = caption || "";
      lb.classList.remove("hidden");
    };
    const hide = () => lb.classList.add("hidden");

    document.querySelectorAll(".gallery-item img").forEach((el) => {
      el.loading = el.loading || "lazy";
      el.decoding = "async";
      el.addEventListener("click", () => {
        const caption = el.closest(".gallery-item")?.getAttribute("data-caption") || "";
        open(el.currentSrc || el.src, caption);
      });
    });

    close?.addEventListener("click", hide);
    lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  }

  /* ========= Lazy images (global) ========= */
  function initLazyImages() {
    document.querySelectorAll("img").forEach((img) => {
      if (img.classList.contains("hero-img")) return; // keep hero eager
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }

  /* ========= Active nav highlight ========= */
  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(a => {
      const href = a.getAttribute("href");
      if ((path === "" && href === "index.html") || path === href) {
        a.classList.add("text-indigo-300");
      } else {
        a.classList.remove("text-indigo-300");
      }
    });
  }

  /* ========= LinkedIn badge in footer (small) =========
     - Injects a single, small badge into the persisted footer.
     - Hides any other badges elsewhere to avoid duplicates.
  */
  function ensureLinkedInBadge() {
    const footerRow = document.querySelector("footer .max-w-6xl");
    if (!footerRow) return;

    // Hide any non-footer badges to keep one canonical badge
    document.querySelectorAll(".LI-profile-badge").forEach(el => {
      if (!el.closest("footer")) el.style.display = "none";
    });

    // Already added?
    if (document.getElementById("li-badge-mini")) return;

    // Build mini container
    const wrap = document.createElement("div");
    wrap.id = "li-badge-mini";
    wrap.className = "li-mini";

    // Frame for scaling
    const frame = document.createElement("div");
    frame.className = "li-frame";

    // Badge markup (medium size → then scaled down via CSS)
    frame.innerHTML = `
      <div class="badge-base LI-profile-badge"
           data-locale="en_US"
           data-size="medium"
           data-theme="light"
           data-type="HORIZONTAL"
           data-vanity="muhammadwaleedakhtar"
           data-version="v1">
        <a class="badge-base__link LI-simple-link"
           href="https://pk.linkedin.com/in/muhammadwaleedakhtar?trk=profile-badge">
          LinkedIn
        </a>
      </div>
    `;

    wrap.appendChild(frame);
    footerRow.appendChild(wrap); // adds as a small block at the end (right side on desktop)

    // Ensure the LinkedIn script exists once
    const src = "https://platform.linkedin.com/badges/js/profile.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.defer = true; s.type = "text/javascript";
      document.body.appendChild(s);
      s.onload = () => { if (window.LIRenderAll) window.LIRenderAll(); };
    } else {
      // Re-render in case the badge was added after script load (Swup, etc.)
      if (window.LIRenderAll) window.LIRenderAll();
    }
  }

  /* ========= Swup page transitions ========= */
  const overlayEnter = () => {
    if (prefersReduced || !window.gsap) return { eventCallback: (_, cb) => cb && cb() };
    return gsap.timeline().to("#transition-overlay", { yPercent: -100, duration: 0.7, ease: "power3.inOut" });
  };
  const overlayExit = () => {
    if (prefersReduced || !window.gsap) return { eventCallback: (_, cb) => cb && cb() };
    return gsap.timeline().set("#transition-overlay", { yPercent: 100 })
      .to("#transition-overlay", { yPercent: 0, duration: 0.7, ease: "power3.inOut" });
  };

  /* ========= Boot ========= */
  document.addEventListener("DOMContentLoaded", () => {
    initHero();
    initPageAnimations();
    initLightbox();
    initLazyImages();
    setActiveNav();
    ensureLinkedInBadge();

    // Swup (smooth transitions)
    const swup = new Swup({
      containers: ["#swup"],
      plugins: [ new SwupJsPlugin([{
        from: "(.*)", to: "(.*)",
        in: (next) => overlayEnter().eventCallback?.("onComplete", next) || next(),
        out: (next) => overlayExit().eventCallback?.("onComplete", next) || next()
      }]) ]
    });

    // Re-init after content replacement
    swup.hooks.on("content:replace", () => {
      if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(t => t.kill());
      if (window.gsap) gsap.set("#transition-overlay", { yPercent: -100 });
      initHero();
      initPageAnimations();
      initLightbox();
      initLazyImages();
      setActiveNav();
      // Footer is persisted; badge is injected once
    });

    // PWA: service worker (optional)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(()=>{});
      });
    }
  });
})();
