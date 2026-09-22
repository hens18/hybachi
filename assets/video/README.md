Hero files the site expects (from the approved Higgsfield generations):

- assets/video/hero-scrub.mp4   approved Kling 3.0 video, re-encoded for scrubbing:
  ffmpeg -i raw.mp4 -c:v libx264 -crf 18 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an assets/video/hero-scrub.mp4
- assets/img/hero-poster.jpg    first frame of hero-scrub.mp4 (the truck with the MYAMI Bachi sign)
- assets/img/hero-ending.jpg    last frame (the sizzling grill)
- assets/img/step-cooked.jpg, step-packed.jpg, step-served.jpg   the three How it's made stills, about 1920px wide

Until they land, the page falls back to the real truck and food photos.
