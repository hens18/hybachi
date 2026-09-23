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
      src: "assets/video/social/late-night.mp4",
      poster: "assets/img/social/late-night.jpg",
      title: "Late-night hibachi craving",
      credit: "@myamibachi",
      creditUrl: "https://www.tiktok.com/@myamibachi",
    },
    {
      src: "assets/video/social/steak-burrito-review.mp4",
      poster: "assets/img/social/steak-burrito-review.jpg",
      title: "Steak burrito and wings, rated",
      credit: "@ronb.insight",
      creditUrl: "https://www.tiktok.com/@ronb.insight",
    },
    {
      src: "assets/video/social/burrito-build.mp4",
      poster: "assets/img/social/burrito-build.jpg",
      title: "Now in Wynwood",
      credit: "@myamibachi",
      creditUrl: "https://www.tiktok.com/@myamibachi",
    },
    {
      src: "assets/video/social/shrimp-and-burrito.mp4",
      poster: "assets/img/social/shrimp-and-burrito.jpg",
      title: "Shrimp, burrito and a yum yum dip",
      credit: "@miami.bucketlist",
      creditUrl: "https://www.tiktok.com/@miami.bucketlist",
    },
    {
      src: "assets/video/social/have-you-had-one.mp4",
      poster: "assets/img/social/have-you-had-one.jpg",
      title: "Have you had a hibachi burrito?",
      credit: "@myamibachi",
      creditUrl: "https://www.tiktok.com/@myamibachi",
    },
    {
      src: "assets/video/social/plate-review.mp4",
      poster: "assets/img/social/plate-review.jpg",
      title: "A hibachi plate, rated in the car",
      credit: "@ozzieratesfood",
      creditUrl: "https://www.tiktok.com/@ozzieratesfood",
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
