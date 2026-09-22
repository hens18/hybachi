// Shared behavior: nav, reveal-on-scroll, 3D hero tilt + reel.
(() => {
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle) toggle.addEventListener("click", () => links.classList.toggle("open"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---- Hero ----
  const screen = document.getElementById("screen");
  if (!screen) return;

  // Mouse-driven 3D tilt
  const hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    screen.style.transform = `rotateY(${-14 + x * 22}deg) rotateX(${6 - y * 16}deg)`;
  });
  hero.addEventListener("mouseleave", () => { screen.style.transform = ""; });

  // Video takes over when assets/video/hero-loop.mp4 exists; otherwise the image reel loops.
  const video = document.getElementById("heroVideo");
  const reel = document.getElementById("reel");
  const steps = document.getElementById("reelSteps");
  const pill = document.getElementById("pill");
  const dishName = document.getElementById("dishName");
  const frames = [...reel.querySelectorAll("img")];
  const stepEls = [...steps.children];
  const pillBtns = [...pill.querySelectorAll("button")];
  const names = ["Filet Mignon &amp; Noodles", "Filet Mignon &amp; Shrimp", "Hibachi Burrito"];
  let i = 0, timer;

  const show = (n) => {
    i = n % frames.length;
    frames.forEach((f, k) => f.classList.toggle("on", k === i));
    stepEls.forEach((s, k) => s.classList.toggle("on", k === i));
    pillBtns.forEach((b, k) => b.classList.toggle("on", k === i));
    dishName.innerHTML = names[i];
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 3200); };

  pillBtns.forEach((b) => b.addEventListener("click", () => { show(+b.dataset.i); start(); }));
  start();

  video.addEventListener("loadeddata", () => {
    video.hidden = false;
    reel.hidden = true;
    clearInterval(timer);
    // Advance the Cooked / Packed / Served labels in step with the video.
    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const k = Math.min(2, Math.floor((video.currentTime / video.duration) * 3));
      stepEls.forEach((s, j) => s.classList.toggle("on", j === k));
    });
  });
  video.load();
})();

// ---- Reviews carousel: drifts left to right; the card nearest the center is spotlighted ----
(() => {
  const marquee = document.getElementById("marquee");
  if (!marquee || typeof REVIEWS === "undefined") return;
  const track = document.getElementById("marqueeTrack");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const card = (r) => `
    <article class="mq-card">
      <div class="mq-top">
        <div class="avatar">${esc(r.name[0])}</div>
        <div><h3>${esc(r.name)}</h3><span>${esc(r.location)}</span></div>
      </div>
      <div class="mq-meta"><span class="stars">${"★".repeat(r.rating)}<span class="off">${"★".repeat(5 - r.rating)}</span></span> <span>${fmt(r.date)} · ${esc(r.source)}</span></div>
      ${r.text
        ? `<p class="mq-text">&ldquo;${esc(r.text.replace(/\s*\n\s*\n\s*/g, " "))}&rdquo;</p>`
        : `<p class="mq-text mq-empty">${r.badge ? esc(r.badge) + ". " : ""}Full review on Yelp.</p>`}
      ${r.photos?.length ? `<img src="${esc(r.photos[0])}" alt="Food photo from ${esc(r.name)}'s review" loading="lazy">` : ""}
      <a class="mq-more" href="${r.text ? "reviews.html" : YELP_URL}"${r.text ? "" : ' target="_blank" rel="noopener"'}>Read more &rarr;</a>
    </article>`;

  const set = [...REVIEWS].sort((a, b) => b.date.localeCompare(a.date)).map(card).join("");
  // Enough copies to fill wide screens, then doubled so the loop is seamless.
  const copies = Math.max(1, Math.ceil((window.innerWidth * 1.5) / (REVIEWS.length * 340)));
  track.innerHTML = set.repeat(copies * 2);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    marquee.classList.add("static");
    return;
  }

  const cards = [...track.children];
  const SPEED = 40; // px per second
  const period = () => cards[cards.length / 2].offsetLeft - cards[0].offsetLeft;
  let half = period();
  let x = 0, last = performance.now(), paused = false, visible = true;

  marquee.addEventListener("mouseenter", () => (paused = true));
  marquee.addEventListener("mouseleave", () => (paused = false));
  marquee.addEventListener("focusin", () => (paused = true));
  marquee.addEventListener("focusout", () => (paused = false));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(marquee);
  window.addEventListener("resize", () => (half = period()));

  let spot = null;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      if (!paused) x = (x + SPEED * dt) % half;
      // Moving right: start shifted left by one full set, drift toward 0.
      track.style.transform = `translate3d(${x - half}px,0,0)`;
      const mid = window.innerWidth / 2;
      let best = null, bestD = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (best !== spot) { spot?.classList.remove("spot"); best.classList.add("spot"); spot = best; }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
