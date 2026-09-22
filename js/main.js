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
  const names = ["Steak &amp; Yakisoba", "Steak &amp; Shrimp Combo", "Hibachi Burrito"];
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
