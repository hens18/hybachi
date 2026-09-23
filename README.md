# Myami Bachi website

One-page site for Myami Bachi, the hibachi food truck at 12750 SW 128th St, Miami.
Plain HTML, CSS and JavaScript. No build step: open `index.html` or serve the folder.

## Layout

```
index.html              the whole site (video hero, menu, how it's made, reviews, social, find the truck, the line FAQ)
css/styles.css          all styles
js/
  hero.js               background hero video (pauses off screen, respects reduced motion)
  main.js               nav, reveals, reviews carousel, social section
  reviews.js            full review list, rating summary and filters
  reviews-data.js       EDIT HERE to add or change reviews
  social-data.js        EDIT HERE to add TikTok / Instagram links and on-page clips
assets/                 everything the page loads
  img/                  food, truck, logo, hero poster, step photos
  img/reviews/          photos from customer reviews
  video/hero-loop.mp4   hero background video, looping
  video/social/         TikTok clips played in the "As seen on" section (posters in img/social/)
source/                 originals, NOT loaded by the page and NOT published
  higgsfield/           raw AI generations (hero video, start frame, step photos, ending frame)
  photos/               reference photos (menu board)
  social/               original TikTok downloads
```

## Hosting

GitHub Pages, deployed by `.github/workflows/pages.yml` on every push. The workflow publishes
only `index.html`, `css/`, `js/` and `assets/`; `source/` stays in the repo and is never published.
Live at https://hens18.github.io/hybachi/ once Settings > Pages > Source is set to "GitHub Actions".

## Re-making the web files from `source/`

```
# hero background video
ffmpeg -i source/higgsfield/hero-video-raw.mp4 -vf scale=1920:-2 -c:v libx264 -crf 24 -preset slow -g 48 \
  -pix_fmt yuv420p -movflags +faststart -an assets/video/hero-loop.mp4

# hero poster (must match the video's first frame)
ffmpeg -i source/higgsfield/hero-start-frame.png -vf scale=1920:-2 -q:v 2 assets/img/hero-poster.jpg

# step photos
for s in cooked packed served; do
  ffmpeg -i source/higgsfield/step-$s.png -vf scale=1920:-2 -q:v 3 assets/img/step-$s.jpg
done
```

Some imagery is AI generated (hero video, poster, step photos); the food, truck and review photos are real.
