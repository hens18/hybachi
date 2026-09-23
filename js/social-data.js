// "As seen on TikTok and Instagram" section. Edit here and the section fills itself in.
// A platform with an empty `profile` and no `posts` is hidden; if everything is empty, the whole section hides.
// `posts` are links to individual videos or reels: { url: "...", label: "Short caption" }.
// `clips` are videos played right on the site: { src, poster, title, credit, creditUrl }.
const SOCIAL = {
  tiktok: {
    handle: "@myamibachi",
    profile: "https://www.tiktok.com/@myamibachi",
    posts: [
      { url: "https://www.tiktok.com/@myamibachi/video/7276902647947332906", label: "The iconic hibachi burrito" },
    ],
  },
  instagram: {
    handle: "@myamibachi",
    profile: "https://www.instagram.com/myamibachi/",
    posts: [],
  },
  clips: [
    {
      src: "assets/video/social/viral-burrito.mp4",
      poster: "assets/img/social/viral-burrito.jpg",
      title: "The viral hibachi burrito",
      credit: "@gabynjohnny",
      creditUrl: "https://www.tiktok.com/@gabynjohnny",
    },
    {
      src: "assets/video/social/burrito-build.mp4",
      poster: "assets/img/social/burrito-build.jpg",
      title: "How the burrito gets built",
      credit: "@myamibachi",
      creditUrl: "https://www.tiktok.com/@myamibachi",
    },
    {
      src: "assets/video/social/taste-test.mp4",
      poster: "assets/img/social/taste-test.jpg",
      title: "The taste test",
      credit: "",
      creditUrl: "",
    },
  ],
};
