// Renders the full review list on the homepage from REVIEWS (js/reviews-data.js).
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stars = (n) => "★".repeat(Math.round(n)) + `<span class="off">${"★".repeat(5 - Math.round(n))}</span>`;
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const paras = (t) => t.split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("");
const byDate = (a, b) => b.date.localeCompare(a.date);

(() => {
  const list = document.getElementById("reviewList");
  if (!list) return;

  // Summary
  const total = REVIEWS.length;
  const avg = total ? REVIEWS.reduce((a, r) => a + r.rating, 0) / total : 0;
  document.getElementById("avg").textContent = total ? avg.toFixed(1) : "–";
  document.getElementById("avgStars").innerHTML = stars(avg);
  document.getElementById("count").textContent = `${total} review${total === 1 ? "" : "s"}`;
  document.getElementById("bars").innerHTML = [5, 4, 3, 2, 1].map((n) => {
    const c = REVIEWS.filter((r) => r.rating === n).length;
    return `<div class="bar"><span>${n}★</span><i style="--w:${total ? (c / total) * 100 : 0}%"></i><span>${c}</span></div>`;
  }).join("");

  // Cards
  const render = (f) => {
    const rows = REVIEWS
      .filter((r) => f === "all" || (f === "photos" ? r.photos?.length : f === "low" ? r.rating <= 3 : r.rating === +f))
      .sort(byDate);
    list.innerHTML = rows.length ? rows.map((r) => `
      <article class="review">
        <header>
          <div class="avatar">${esc(r.name[0])}</div>
          <div>
            <h3>${esc(r.name)}</h3>
            <span class="src">${esc(r.location)} · ${esc(r.source)}</span>
          </div>
        </header>
        <div><span class="stars">${stars(r.rating)}</span> <time datetime="${esc(r.date)}">${fmtDate(r.date)}</time></div>
        ${r.text ? paras(r.text) : `<p class="muted-note">${r.badge ? esc(r.badge) + ". " : ""}<a href="${YELP_URL}" target="_blank" rel="noopener">Read the full review on Yelp &rarr;</a></p>`}
        ${r.photos?.length ? `<div class="review-photos">${r.photos.map((p) => `<img src="${esc(p)}" alt="Food photo from ${esc(r.name)}'s review" loading="lazy">`).join("")}</div>` : ""}
      </article>`).join("") : `<p style="color:var(--muted)">No reviews match this filter yet.</p>`;
  };

  document.getElementById("filters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
    render(b.dataset.f);
  });
  render("all");
})();
