// Visitor helpers: live open/closed status, the closest truck, the phone action bar, menu jumps.
(() => {
  // ---- Open now: both trucks are open nightly 6 PM to midnight, Miami time ----
  const OPEN_H = 18, CLOSE_H = 24;
  const miamiNow = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", hour: "numeric", minute: "numeric", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => +parts.find((p) => p.type === t).value;
    return { h: get("hour") % 24, m: get("minute") };
  };
  const status = () => {
    const { h, m } = miamiNow();
    const mins = h * 60 + m, open = OPEN_H * 60, close = CLOSE_H * 60;
    if (mins >= open && mins < close) {
      const left = close - mins;
      return { open: true, text: left <= 45 ? `Open now, closes in ${left} min` : "Open now until midnight", short: "Open now" };
    }
    const until = open - mins;
    return { open: false, text: until <= 60 ? `Closed now, opens in ${until} min` : "Closed now, opens at 6 PM", short: until <= 60 ? `Opens in ${until} min` : "Opens at 6 PM" };
  };
  const pill = document.querySelector("[data-open-status]");
  const badge = document.querySelector("[data-open-badge]");
  const paint = () => {
    const s = status();
    if (pill) {
      pill.textContent = s.text;
      pill.closest("li")?.classList.toggle("is-open", s.open);
      pill.closest("li")?.classList.toggle("is-closed", !s.open);
    }
    if (badge) {
      badge.textContent = s.short;
      badge.hidden = false;
      badge.classList.toggle("is-open", s.open);
    }
  };
  paint();
  setInterval(paint, 60 * 1000);

  // ---- Which truck is closer? Uses the visitor's location once, only when they ask ----
  const btn = document.getElementById("nearestBtn");
  const msg = document.getElementById("nearestMsg");
  const locs = [...document.querySelectorAll(".location[data-lat]")];
  if (btn && msg && locs.length && "geolocation" in navigator) {
    btn.hidden = false;
    const miles = (a, b) => {
      const R = 3958.8, rad = (d) => (d * Math.PI) / 180;
      const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    btn.addEventListener("click", () => {
      btn.disabled = true;
      msg.textContent = "Finding you…";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const ranked = locs
            .map((el) => ({ el, d: miles(me, { lat: +el.dataset.lat, lng: +el.dataset.lng }) }))
            .sort((a, b) => a.d - b.d);
          const best = ranked[0];
          const name = best.el.querySelector(".loc-name").textContent.trim();
          const dist = best.d < 1 ? "under a mile away" : `about ${Math.round(best.d)} mi away`;
          locs.forEach((el) => el.classList.toggle("closest", el === best.el));
          msg.textContent = `${name} is closer, ${dist}.`;
          btn.disabled = false;
        },
        (err) => {
          msg.textContent = err.code === err.PERMISSION_DENIED
            ? "Location is off, so pick the truck you're nearest below."
            : "Couldn't find your location. Pick a truck below.";
          btn.disabled = false;
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  // ---- Phone action bar: appears once the hero's contact info scrolls away ----
  const bar = document.getElementById("actionBar");
  const heroCopy = document.querySelector(".hero-copy");
  if (bar && heroCopy) {
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("show", show);
      document.body.classList.toggle("has-action-bar", show);
    }).observe(heroCopy);
  }

  // ---- Menu filter: pick a category and it becomes the only thing on the menu, centered.
  //      "Full menu" (or picking the same category again) brings everything back. ----
  const menuFull = document.getElementById("menuFull");
  const menuBtns = [...document.querySelectorAll(".menu-jump button")];
  if (menuFull && menuBtns.length) {
    const cols = [...menuFull.querySelectorAll(".menu-col")];
    const show = (id) => {
      const one = id !== "all" && cols.some((c) => c.id === id);
      menuFull.classList.toggle("filtered", one);
      cols.forEach((c) => {
        const on = one && c.id === id;
        c.classList.toggle("active", on);
        c.hidden = one && !on;
      });
      menuBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.show === (one ? id : "all"))));
      // Keep the chosen section in view without jumping past the buttons.
      const bar = document.querySelector(".menu-jump");
      const top = bar.getBoundingClientRect().top + scrollY - 90;
      if (Math.abs(scrollY - top) > 40) scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    menuBtns.forEach((b) => b.addEventListener("click", () => {
      const already = b.getAttribute("aria-pressed") === "true";
      show(already && b.dataset.show !== "all" ? "all" : b.dataset.show);
    }));
  }
})();
