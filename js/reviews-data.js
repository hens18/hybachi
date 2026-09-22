// Shared review data, used by the homepage reviews carousel and the full review list.
// To add a review, copy one entry and fill it in. Blank lines in `text`
// become paragraph breaks. `photos` is optional. Leave `text` empty when you
// only have the rating; the card then links to the full review on Yelp.
const YELP_URL = "https://www.yelp.com/biz/myami-bachi-miami";

const REVIEWS = [
  {
    name: "Christian M.",
    location: "Cutler Bay, FL",
    rating: 5,
    date: "2026-01-11",
    source: "Yelp",
    text: "Best food in dade county been coming here forever and the food never changed and always taste the best",
  },
  {
    name: "Paloma M.",
    location: "Miami, FL",
    rating: 4,
    date: "2024-06-15",
    source: "Yelp",
    text: "Come with me to Myami Bachi, a Hibachi food truck located in Kendall. I came across them on my feed a couple of months back and finally had the chance to try them. I tried their Hibachi Burrito with chicken and their fried rice alone. I was very impressed with how delicious this wrap was. The taste was excellent, and the sauce ratio was good. Their service was excellent and quick.\n\nOverall, Myami Bachi was delicious, and I will be back for the wrap and to try some of their other plates.",
    photos: ["assets/img/reviews/paloma-burrito.jpg", "assets/img/reviews/paloma-rice.jpg"],
  },
  {
    name: "Lauren N.",
    location: "Miami, FL",
    rating: 4,
    date: "2024-02-26",
    source: "Yelp",
    text: "The first time we heard of Myami Bachi was for the Instagram-famous hibachi burrito. It did not disappoint!\n\nThe food truck is located a bit off the beaten path, in a shopping plaza with other food trucks.\n\nThe first thing you notice is the LINE (which, as we know, is always a good sign). The line moved fairly quickly, but it did take about 40 minutes.\n\nThe people working (hard) were kind and helpful when ordering. We ordered shrimp hibachi burritos and a steak hibachi platter with rice and veggies.\n\nAfter ordering, it took about another 40 minutes to get our food. We actually liked the shrimp more than the steak. The wrap was tasty, moist, and filled with flavor. I disagree with the other reviews that their wasnt enough sauce-- i could taste both sauces adequately. The steak bowl was okay, but not as good as the wrap.\n\nMy advice-- bring good company because it is a long wait. I don't think I would return by myself, although the wrap was delicious. Would love to see this on Uber eats and Door Dash.",
    photos: ["assets/img/reviews/lauren-burrito.jpg", "assets/img/reviews/lauren-steak.jpg"],
  },
  {
    name: "Donna V.",
    location: "Los Angeles, CA",
    rating: 5,
    date: "2024-02-17",
    source: "Yelp",
    text: "I ordered the Habachi Steak and Chicken Bowls, wings and the chicken dumplings and they were delicious! The wings were crispy, sweet and tasty. Highly recommend",
  },
  {
    name: "Kelly R.",
    location: "Miami, FL",
    rating: 4,
    date: "2023-12-10",
    source: "Yelp",
    badge: "First to review",
    text: "",
  },
];
