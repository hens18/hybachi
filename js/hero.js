// Scroll-scrubbed hero: the film plays forward as you scroll down and back as you scroll up.
// The 3D neon frame flattens to full screen over the first stretch of scroll.
(() => {
  const hero = document.getElementById("heroScrub");
  if (!hero) return;

  const VIDEO_URL = "assets/video/hero-scrub.mp4";
  const VIDEO_BYTES = 6000000; // fallback when Content-Length is missing; update to the real size
  const POSTER = "assets/img/hero-poster.jpg";
  const POSTER_FALLBACK = "assets/img/truck.jpg";
  // The approved Higgsfield generations. Used straight from Higgsfield until the
  // local copies above are added to assets/ (the local files always win).
  const HF = "https://d8j0ntlcm91z4.cloudfront.net/user_3DIPB9u9Vmf3aGnCOqwMyZykmRt/";
  const REMOTE_VIDEO = HF + "hf_20260922_193309_d63d6182-ee11-4cc4-9fb7-68986ae25f23.mp4";
  const REMOTE_POSTER = HF + "hf_20260922_192551_67b4fba9-7f34-465a-9908-3c04566ff176.png";

  // Must match the media queries in css/styles.css character for character.
  const GATES = [
    "(max-width: 720px)",
    "(orientation: portrait) and (max-width: 1024px)",
    "(orientation: portrait) and (pointer: coarse)",
    "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
    "(prefers-reduced-motion: reduce)",
  ];

  const stage = document.getElementById("stage");
  const video = document.getElementById("heroVideo");
  const posterLayer = document.getElementById("poster");
  const ring = document.getElementById("ring");

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => {
    const t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function rng(seed) {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  // ---- Split headlines into word and character spans (seeded, so identical on every load) ----
  hero.querySelectorAll(".split").forEach((el, n) => {
    const fx = el.closest(".band").dataset.fx;
    const text = el.textContent;
    const rand = rng(97 + n * 31);
    const words = text.split(" ");
    const sr = `<span class="sr-only">${text}</span>`;
    let ci = 0;
    const total = text.replace(/ /g, "").length;
    const vis = words.map((w, wi) => {
      const wth = fx === "drift" ? (wi / words.length) * 0.5 : fx === "rise" ? (wi / words.length) * 0.4 : 0;
      const chars = [...w].map((ch) => {
        const th = fx === "flicker" ? rand() * 0.55 : (ci / total) * 0.3;
        ci++;
        return `<span class="c" style="--th:${th.toFixed(3)}">${ch}</span>`;
      }).join("");
      return `<span class="w" style="--th:${wth.toFixed(3)}">${chars}</span>`;
    }).join(" ");
    el.innerHTML = `${sr}<span aria-hidden="true">${vis}</span>`;
  });

  const bands = [...hero.querySelectorAll(".band")].map((el, i, all) => ({
    el,
    a: +el.dataset.a,
    b: +el.dataset.b,
    ramp: el.dataset.ramp ? +el.dataset.ramp : null,
    first: i === 0,
    last: i === all.length - 1,
    op: -1,
    k: -1,
  }));

  // ---- Progress through the pinned hero, 0..1 ----
  function heroProgress() {
    const range = hero.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp(-hero.getBoundingClientRect().top / range, 0, 1);
  }

  // Band one assembles on load, then scroll takes over.
  let loadK = 0;
  (function loadRamp(start) {
    const step = (now) => {
      loadK = clamp((now - start) / 900, 0, 1);
      if (scrubOn) updateCaptions(shown);
      if (loadK < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })(performance.now());

  let lastF = -1;
  function updateCaptions(p) {
    // The frame flattens over the first 16 percent of the scroll.
    const f = smoothstep(p, 0, 0.16);
    if (Math.abs(f - lastF) > 0.002 || ((f === 0 || f === 1) && f !== lastF)) { stage.style.setProperty("--f", f.toFixed(4)); lastF = f; }

    for (const b of bands) {
      const edge = Math.min(0.02, (b.b - b.a) / 3);
      const inn = b.first ? (p <= b.b ? 1 : 0) : smoothstep(p, b.a, b.a + edge);
      const out = b.last ? 1 : 1 - smoothstep(p, b.b - edge, b.b);
      const op = b.first ? (1 - smoothstep(p, b.b - edge, b.b)) : inn * out;
      let k = clamp((p - b.a) / (b.ramp || Math.min(0.025, (b.b - b.a) * 0.35)), 0, 1);
      if (b.first) k = Math.max(k, loadK);
      if (Math.abs(op - b.op) > 0.004) {
        b.el.style.opacity = op.toFixed(3);
        b.el.classList.toggle("live", op > 0.05);
        b.op = op;
      }
      if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1)) {
        b.el.style.setProperty("--k", k.toFixed(3));
        b.k = k;
      }
    }
  }

  // ---- Gated seeks: never write currentTime while a seek is in flight ----
  let seekBusy = false, pendingTime = null;
  function requestSeek(t) {
    if (!video.duration) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = t;
  }
  video.addEventListener("seeked", () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  video.addEventListener("error", () => {
    seekBusy = false; pendingTime = null;
    if (!triedRemote) streamRemote(); else failVideo();
  });

  // ---- Eased display time, frame-rate independent; the loop rests when converged ----
  let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (Math.abs(target - shown) < 0.0005) {
      shown = target; rafId = null; lastTick = 0;
    } else {
      rafId = requestAnimationFrame(tick);
    }
    requestSeek(shown * (video.duration || 0));
    updateCaptions(shown);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([e]) => {
    heroOnScreen = e.isIntersecting;
    if (heroOnScreen && scrubOn) onScroll();
  }).observe(hero);

  // ---- Poster first, then the video streams in behind an honest progress ring ----
  let heroInit = false;
  function initHeroOnce() {
    if (heroInit) return;
    heroInit = true;
    let started = false;
    const startBlobFetch = () => {
      if (started) return;
      started = true;
      loadHeroBlob().catch(streamRemote);
    };
    // Poster: local copy, then the Higgsfield frame, then the real truck photo.
    const posters = [POSTER, REMOTE_POSTER, POSTER_FALLBACK];
    const tryPoster = () => {
      const src = posters.shift();
      if (!src) { startBlobFetch(); return; }
      const img = new Image();
      img.onload = () => { posterLayer.style.backgroundImage = `url('${src}')`; startBlobFetch(); };
      img.onerror = tryPoster;
      img.src = src;
    };
    tryPoster();
    setTimeout(startBlobFetch, 4000);
  }

  async function loadHeroBlob() {
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: "low", signal: ctrl.signal });
    if (!res.ok) throw new Error("video " + res.status);
    const total = Number(res.headers.get("Content-Length")) || VIDEO_BYTES;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0, lastRing = 0;
    stage.classList.add("loading");
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value);
      got += value.length;
      const frac = Math.min(1, got / total);
      const now = performance.now();
      if (now - lastRing > 100 || frac === 1) {
        lastRing = now;
        ring.style.setProperty("--ld", Math.round(126 * (1 - frac)));
      }
    }
    clearTimeout(watchdog);
    ring.style.setProperty("--ld", 0);
    video.src = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    video.load();
    video.addEventListener("canplay", () => {
      requestSeek(heroProgress() * video.duration);
      stage.classList.remove("loading");
      stage.classList.add("video-ready");
    }, { once: true });
  }

  // No local copy: stream the approved video straight from Higgsfield.
  // Browsers play and seek it without CORS; it swaps to the local file once that exists.
  let triedRemote = false;
  function streamRemote() {
    if (triedRemote) { failVideo(); return; }
    triedRemote = true;
    stage.classList.add("loading");
    ring.style.setProperty("--ld", 60);
    video.preload = "auto";
    video.src = REMOTE_VIDEO;
    video.load();
    video.addEventListener("loadeddata", () => {
      requestSeek(heroProgress() * video.duration);
      stage.classList.remove("loading");
      stage.classList.add("video-ready");
    }, { once: true });
  }

  function failVideo() {
    stage.classList.remove("loading");
    stage.classList.add("video-failed"); // the poster carries the journey; captions still play
  }

  // ---- Live gate: static hero on phones, upright tablets, and reduced motion ----
  let scrubOn = false;
  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    addEventListener("scroll", onScroll, { passive: true });
    bands.forEach((b) => { b.op = -1; b.k = -1; });
    lastF = -1;
    shown = target = heroProgress();
    updateCaptions(shown);
    onScroll();
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener("scroll", onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function applyHeroMode() {
    if (GATES.some((q) => matchMedia(q).matches)) disableScrub();
    else enableScrub();
  }

  // Reduced motion flipped on mid-visit: finish every drawn and revealed element.
  function pinToFinalStates() {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    document.getElementById("skyline")?.classList.add("drawn");
  }

  const MQLS = GATES.map((q) => matchMedia(q));
  MQLS.forEach((m) => m.addEventListener("change", applyHeroMode));
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    if (e.matches) pinToFinalStates();
    applyHeroMode();
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) pinToFinalStates();
  applyHeroMode();
})();
