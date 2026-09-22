// Background hero video: loops behind the headline.
// Paused when scrolled away or the tab is hidden; reduced motion keeps the still poster.
(() => {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let onScreen = true;

  const sync = () => {
    if (reduce.matches || !onScreen || document.hidden) {
      video.pause();
    } else {
      const p = video.play();
      if (p) p.catch(() => {}); // autoplay blocked: the poster stays, which is fine
    }
  };

  if (reduce.matches) video.removeAttribute("autoplay");
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(video);
  document.addEventListener("visibilitychange", sync);
  reduce.addEventListener("change", sync);

  // If the video can't load, hide it so the poster background shows cleanly.
  video.addEventListener("error", () => video.closest(".hero-video").classList.add("no-video"), true);
})();
