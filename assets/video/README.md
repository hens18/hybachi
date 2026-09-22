hero-scrub.mp4 is the approved Kling 3.0 hero, re-encoded for scroll scrubbing
(keyframe every 8 frames, no audio, 7.5 MB):

  ffmpeg -i raw.mp4 -c:v libx264 -crf 23 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an assets/video/hero-scrub.mp4

hero-poster.jpg and hero-ending.jpg in assets/img are its first and last frames.
Raw generations are kept out of the site folder so they never ship.
