// Reviews data. Replace the placeholder entries below with real customer
// reviews (copy the text, first name + last initial, date, and star rating).
// Set `placeholder: false` (or delete the field) on real reviews so the
// "Placeholder" tag disappears. The summary score and bars are computed from
// this list automatically.
const REVIEWS = [
  {
    name: "Customer A.",
    rating: 5,
    date: "2026-09-01",
    source: "Yelp",
    text: "Placeholder review. Paste a real customer review here.",
    photo: "assets/img/combo-steak-shrimp.jpg",
    placeholder: true,
  },
  {
    name: "Customer B.",
    rating: 4,
    date: "2026-08-20",
    source: "Yelp",
    text: "Placeholder review. Paste a real customer review here.",
    photo: "assets/img/hibachi-burrito.jpg",
    placeholder: true,
  },
  {
    name: "Customer C.",
    rating: 5,
    date: "2026-08-12",
    source: "Google",
    text: "Placeholder review. Paste a real customer review here.",
    placeholder: true,
  },
  {
    name: "Customer D.",
    rating: 3,
    date: "2026-07-30",
    source: "Yelp",
    text: "Placeholder review. Paste a real customer review here.",
    photo: "assets/img/fried-rice.jpg",
    placeholder: true,
  },
];

(() => {
  const list = document.getElementById("reviewList");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stars = (n) => "★".repeat(Math.round(n)) + `<span class="off">${"★".repeat(5 - Math.round(n))}</span>`;
  const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
      .filter((r) => f === "all" || (f === "photos" ? r.photo : f === "low" ? r.rating <= 3 : r.rating === +f))
      .sort((a, b) => b.date.localeCompare(a.date));
    list.innerHTML = rows.length ? rows.map((r) => `
      <article class="review">
        ${r.placeholder ? '<span class="placeholder-flag">Placeholder</span>' : ""}
        <header>
          <div class="avatar">${esc(r.name[0])}</div>
          <div><h3>${esc(r.name)}</h3><time datetime="${esc(r.date)}">${fmt(r.date)}</time> <span class="src">· ${esc(r.source)}</span></div>
        </header>
        <div class="stars">${stars(r.rating)}</div>
        <p>${esc(r.text)}</p>
        ${r.photo ? `<img src="${esc(r.photo)}" alt="Photo from ${esc(r.name)}'s review" loading="lazy">` : ""}
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
