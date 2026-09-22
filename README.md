# Myami Bachi website

One-page site for Myami Bachi, the hibachi food truck at 12750 SW 128th St, Miami.
Plain HTML, CSS and JavaScript. No build step: open `index.html` or serve the folder.

## Layout

```
index.html              the whole site (hero, menu, how it's made, reviews, social, FAQ, find the truck)
css/styles.css          all styles
js/
  hero.js               scroll-scrubbed hero video in the 3D neon frame
  main.js               nav, reveals, reviews carousel, social section
  reviews.js            full review list, rating summary and filters
  reviews-data.js       EDIT HERE to add or change reviews
  social-data.js        EDIT HERE to add TikTok / Instagram links
assets/                 everything the page loads
  img/                  food, truck, logo, hero poster, step photos
  img/reviews/          photos from customer reviews
  video/hero-scrub.mp4  hero video, encoded for scroll scrubbing
source/                 originals, NOT loaded by the page
  higgsfield/           raw AI generations (hero video, start frame, step photos, ending frame)
  photos/               reference photos (menu board)
```

## Hosting

Publish the repository root. `source/` is not linked from the page; it is kept only as the
master copies used to make the files in `assets/`.

## Re-making the web files from `source/`

```
# hero video (keyframe every 8 frames so scrolling seeks cleanly)
ffmpeg -i source/higgsfield/hero-video-raw.mp4 -c:v libx264 -crf 23 -preset slow -g 8 -keyint_min 8 \
  -pix_fmt yuv420p -movflags +faststart -an assets/video/hero-scrub.mp4

# hero poster (must match the video's first frame)
ffmpeg -i source/higgsfield/hero-start-frame.png -vf scale=1920:-2 -q:v 2 assets/img/hero-poster.jpg

# step photos
for s in cooked packed served; do
  ffmpeg -i source/higgsfield/step-$s.png -vf scale=1920:-2 -q:v 3 assets/img/step-$s.jpg
done
```

Some imagery is AI generated (hero video, poster, step photos); the food, truck and review photos are real.
