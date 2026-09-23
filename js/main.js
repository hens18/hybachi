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
      <a class="mq-more" href="${r.text ? "#allReviews" : YELP_URL}"${r.text ? "" : ' target="_blank" rel="noopener"'}>Read more &rarr;</a>
    </article>`;

  const set = [...REVIEWS].sort((a, b) => b.date.localeCompare(a.date)).map(card).join("");
  // Enough copies to fill wide screens, then doubled so the loop is seamless.
  const copies = Math.max(1, Math.ceil((window.innerWidth * 1.5) / (REVIEWS.length * 340)));
  track.innerHTML = set.repeat(copies * 2);

  const cards = [...track.children];
  cards.forEach((c) => {
    c.tabIndex = 0;
    c.setAttribute("role", "button");
    c.setAttribute("aria-pressed", "false");
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let x = 0;

  // ---- Click a review to stop on it and highlight it; click it again (or anywhere else, or Esc) to resume ----
  let selected = null;
  let targetX = null; // where the track eases to so the chosen card sits in the middle
  const select = (card) => {
    if (selected) { selected.classList.remove("selected"); selected.setAttribute("aria-pressed", "false"); }
    selected = card;
    marquee.classList.toggle("has-selection", !!card);
    if (!card) { targetX = null; return; }
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
    if (!reduced) {
      const r = card.getBoundingClientRect();
      targetX = x - (r.left + r.width / 2 - window.innerWidth / 2);
    }
  };

  track.addEventListener("click", (e) => {
    // "Read more" opens the full review list below the carousel.
    const more = e.target.closest('a[href="#allReviews"]');
    if (more) {
      e.preventDefault();
      const all = document.getElementById("allReviews");
      all.open = true;
      all.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (e.target.closest("a")) return; // other links (Yelp) just open
    const card = e.target.closest(".mq-card");
    if (card) select(card === selected ? null : card);
  });
  track.addEventListener("keydown", (e) => {
    const card = e.target.closest(".mq-card");
    if (card && e.target === card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      select(card === selected ? null : card);
    }
  });
  document.addEventListener("click", (e) => { if (selected && !e.target.closest(".mq-card")) select(null); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && selected) select(null); });

  if (reduced) {
    marquee.classList.add("static");
    return;
  }

  const SPEED = 40; // px per second
  const period = () => cards[cards.length / 2].offsetLeft - cards[0].offsetLeft;
  let half = period();
  let last = performance.now(), visible = true;

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(marquee);
  window.addEventListener("resize", () => (half = period()));

  let spot = null;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      if (targetX !== null) {
        x += (targetX - x) * (1 - Math.pow(0.002, dt)); // ease the chosen card to the middle
      } else {
        x += SPEED * dt; // keeps drifting left to right unless a review is chosen
      }
      // Moving right: start shifted left by one full set; the duplicate set hides the wrap.
      const shown = ((x % half) + half) % half;
      track.style.transform = `translate3d(${shown - half}px,0,0)`;
      let best = selected;
      if (!best) {
        const mid = window.innerWidth / 2;
        let bestD = Infinity;
        for (const c of cards) {
          const r = c.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) { bestD = d; best = c; }
        }
      }
      if (best !== spot) { spot?.classList.remove("spot"); best.classList.add("spot"); spot = best; }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// ---- As seen on TikTok and Instagram: built from js/social-data.js ----
(() => {
  const section = document.getElementById("seen-on");
  if (!section || typeof SOCIAL === "undefined") return;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icons = {
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46V8.1A6.5 6.5 0 1 0 17 14.5V9.3a7 7 0 0 0 4 1.2v-3A4 4 0 0 1 17 3.5V3h-3z" fill="currentColor"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
  };
  const names = { tiktok: "TikTok", instagram: "Instagram" };
  const clips = SOCIAL.clips || [];
  const live = Object.entries(SOCIAL).filter(([k, v]) => k !== "clips" && (v.profile || v.posts?.length));
  if (!live.length && !clips.length) return;

  const link = (url, inner, cls) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>`;
  document.getElementById("socialGrid").innerHTML = live.map(([key, v]) => `
    <article class="social-card ${key} reveal">
      <header>
        <span class="social-icon">${icons[key] || ""}</span>
        <div><h3>${names[key] || key}</h3><span class="mono">${esc(v.handle || "")}</span></div>
      </header>
      ${v.posts?.length ? `<ul class="social-posts">${v.posts.map((p) => `<li>${link(p.url, `<span>${esc(p.label || "Watch the post")}</span><b>&rarr;</b>`, "social-post")}</li>`).join("")}</ul>` : ""}
      ${v.profile ? link(v.profile, `Follow ${esc(v.handle || "us")} on ${names[key] || key}`, "btn btn-ghost") : ""}
    </article>`).join("");
  // Clips play right on the page: silent and looping while on screen; tap one for sound.
  const clipBox = document.getElementById("socialClips");
  if (clipBox && clips.length) {
    const speaker = '<svg class="on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" fill="currentColor"/></svg><svg class="off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z" fill="currentColor"/></svg>';
    clipBox.innerHTML = clips.map((c) => `
      <figure class="clip reveal">
        <div class="phone">
          <video src="${esc(c.src)}" poster="${esc(c.poster)}" muted loop playsinline preload="none" aria-label="${esc(c.title)}"></video>
          <button class="sound" type="button" aria-label="Turn sound on for ${esc(c.title)}" aria-pressed="false">${speaker}</button>
        </div>
        <figcaption>
          <b>${esc(c.title)}</b>
          ${c.credit ? (c.creditUrl ? link(c.creditUrl, esc(c.credit), "credit") : `<span class="credit">${esc(c.credit)}</span>`) : ""}
        </figcaption>
      </figure>`).join("");
    clipBox.hidden = false;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const figs = [...clipBox.querySelectorAll(".clip")];
    const setSound = (fig, on) => {
      const v = fig.querySelector("video"), b = fig.querySelector(".sound");
      v.muted = !on;
      fig.classList.toggle("sound-on", on);
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", `${on ? "Turn sound off" : "Turn sound on"} for ${v.getAttribute("aria-label")}`);
    };
    const play = (v) => { const p = v.play(); if (p) p.catch(() => {}); };
    figs.forEach((fig) => {
      const v = fig.querySelector("video");
      // Tap anywhere on the phone: sound on for this clip (others go quiet), tap again for silent.
      fig.querySelector(".phone").addEventListener("click", () => {
        const on = !fig.classList.contains("sound-on");
        figs.forEach((f) => f !== fig && setSound(f, false));
        setSound(fig, on);
        if (on) play(v);
      });
      if (!reduced) {
        new IntersectionObserver(([e]) => {
          if (e.isIntersecting) play(v);
          else { v.pause(); if (fig.classList.contains("sound-on")) setSound(fig, false); }
        }, { threshold: 0.5 }).observe(v);
      }
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) figs.forEach((f) => f.querySelector("video").pause()); });
  }

  // The heading names only the platforms that have links.
  if (live.length) section.querySelector("h2").innerHTML = live.map(([key]) => names[key] || key).join(' <span class="amp">&amp;</span> ');
  section.hidden = false;
  section.querySelectorAll(".reveal").forEach((el) => new IntersectionObserver(([e], o) => { if (e.isIntersecting) { el.classList.add("in"); o.disconnect(); } }, { threshold: 0.15 }).observe(el));

  const foot = document.getElementById("footSocial");
  if (foot) foot.innerHTML = live.filter(([, v]) => v.profile).map(([key, v]) => ` &middot; ${link(v.profile, names[key] || key, "")}`).join("");
})();

// ---- Food cards: click or tap to pop one (same look as hover); click again, elsewhere, or Esc to let go ----
(() => {
  const items = [...document.querySelectorAll(".menu-grid .dish, .steps .step")];
  if (!items.length) return;
  let popped = null;
  const pop = (el) => {
    if (popped) { popped.classList.remove("popped"); popped.setAttribute("aria-pressed", "false"); }
    popped = el === popped ? null : el;
    if (popped) { popped.classList.add("popped"); popped.setAttribute("aria-pressed", "true"); }
  };
  items.forEach((el) => {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-pressed", "false");
    el.addEventListener("click", () => pop(el));
    el.addEventListener("keydown", (e) => {
      if (e.target === el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pop(el); }
    });
  });
  document.addEventListener("click", (e) => { if (popped && !e.target.closest(".menu-grid .dish, .steps .step")) pop(popped); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && popped) pop(popped); });
})();
