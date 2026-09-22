// Shared behavior: nav, reveal-on-scroll, skyline draw, hidden-tab pause.
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

  // Skyline draws itself when it scrolls into view.
  const sky = document.getElementById("skyline");
  if (sky) {
    const path = sky.querySelector("path");
    const len = Math.ceil(path.getTotalLength());
    sky.style.setProperty("--len", len);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { sky.classList.add("drawn"); o.disconnect(); } }, { threshold: 0.4 }).observe(sky);
  }

  // Pause every CSS loop while the tab is hidden.
  document.addEventListener("visibilitychange", () => document.body.classList.toggle("paused", document.hidden));

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
