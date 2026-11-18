import type { Review, ReviewSummary } from "@/features/reviews/types";
import { scoreKeys } from "@/features/reviews/types";

function r(
  id: string,
  listingId: string,
  author: string,
  rating: number,
  scores: [number, number, number],
  text: string,
  stayNights: number,
  at: string,
  extra: Partial<Pick<Review, "lang" | "reply" | "stayId">> = {}
): Review {
  return {
    id,
    listingId,
    author,
    rating,
    scores: { accuracy: scores[0], cleanliness: scores[1], communication: scores[2] },
    text,
    stayNights,
    at,
    lang: "en",
    ...extra,
  };
}

/** Published reviews. Every one comes from a completed stay. Replace with real queries. */
export const reviews: Review[] = [
  r("rv-101", "bkk1-garden-condo", "Anna K.", 5, [5, 5, 5], "Exactly like the photos, and the garden view is lovely in the morning. Sokha answered every question within the hour.", 60, "2026-11-08", {
    reply: { text: "Thank you Anna! You were a pleasure to host.", at: "2026-11-09" },
  }),
  r("rv-102", "bkk1-garden-condo", "Marc D.", 5, [5, 5, 4], "Quiet building, fast wifi that really is fast. I worked from here for two months without a single problem.", 62, "2026-10-14"),
  r("rv-103", "bkk1-garden-condo", "Sophia R.", 4, [5, 4, 5], "Great location near the cafes. The air conditioner in the bedroom was a bit loud but was serviced the next day.", 30, "2026-09-21", {
    reply: { text: "Thanks for letting me know, we replaced the unit’s filter and it is much quieter now.", at: "2026-09-22" },
  }),
  r("rv-104", "bkk1-garden-condo", "Thida P.", 5, [5, 5, 5], "ផ្ទះស្អាតណាស់ ហើយម្ចាស់ផ្ទះរួសរាយ។ ដូចក្នុងរូបភាពទាំងស្រុង។", 30, "2026-08-30", { lang: "km" }),
  r("rv-105", "bkk1-garden-condo", "James T.", 5, [5, 5, 5], "Third time renting a condo in Phnom Penh, and this was the easiest. Checked in with the owner on the day, keys ready.", 90, "2026-07-12"),

  r("rv-111", "toul-kork-family-house", "Nathalie B.", 5, [5, 5, 5], "Plenty of space for our family of four, with a safe yard for the kids. The neighbours were friendly too.", 180, "2026-10-02"),
  r("rv-112", "toul-kork-family-house", "Kenji W.", 4, [5, 4, 4], "Very comfortable house. Hot water took a little while to heat up in the mornings, otherwise perfect.", 60, "2026-09-10"),
  r("rv-113", "toul-kork-family-house", "Pich S.", 5, [5, 5, 5], "ផ្ទះធំទូលាយ សមស្របសម្រាប់គ្រួសារ។ ម្ចាស់ផ្ទះឆ្លើយតបលឿនណាស់។", 90, "2026-07-28", { lang: "km" }),
  r("rv-114", "toul-kork-family-house", "Olivia H.", 4, [4, 4, 5], "Lovely place. Kitchen is smaller than I expected from the photos, but it had everything we needed.", 45, "2026-06-15"),

  r("rv-121", "riverside-studio", "Lucas F.", 5, [5, 5, 5], "Walk to the Royal Palace in ten minutes, and the river view in the evening is worth it.", 21, "2026-11-04"),
  r("rv-122", "riverside-studio", "Mia C.", 4, [3, 5, 5], "Clean and well placed. Be aware the balcony is shared with the next studio, which the photos don’t show.", 30, "2026-10-19", {
    reply: { text: "Thank you Mia. You are right, I will add a photo and a note to the listing.", at: "2026-10-20" },
  }),
  r("rv-123", "riverside-studio", "Hiro T.", 5, [5, 5, 4], "Ideal for a short stay. Self check-in was simple and the owner was easy to reach.", 10, "2026-09-30"),
  r("rv-124", "riverside-studio", "Sara M.", 4, [4, 4, 5], "Good value for the location. A bit of street noise on weekends.", 14, "2026-09-05"),
  r("rv-125", "riverside-studio", "Daniel O.", 3, [3, 4, 4], "Smaller than I pictured and the balcony isn’t private. The owner was fair about it.", 7, "2026-08-18"),
  r("rv-126", "riverside-studio", "Vuthy L.", 5, [5, 5, 5], "ស្ទូឌីយោស្អាត ទីតាំងល្អ ជិតទន្លេ។", 30, "2026-07-02", { lang: "km" }),

  r("rv-131", "bassac-service-apartment", "Elena G.", 5, [5, 5, 5], "Cleaning twice a week was a real bonus. The gym and pool are exactly as described.", 90, "2026-10-25"),
  r("rv-132", "bassac-service-apartment", "Tom A.", 5, [5, 5, 5], "Easily the best service apartment I have used in Phnom Penh at this price.", 60, "2026-09-18"),
  r("rv-133", "bassac-service-apartment", "Sreyneang K.", 4, [5, 4, 4], "Very convenient. Elevator wait times at peak hours are a little long.", 30, "2026-08-09"),
  r("rv-134", "bassac-service-apartment", "Paul E.", 5, [5, 5, 5], "Moved in with two suitcases, everything was ready. Would stay again.", 45, "2026-06-24"),

  r("rv-141", "toul-kork-student-room", "Chantha H.", 5, [5, 5, 5], "ជិតសាកលវិទ្យាល័យ ហើយថ្លៃសមរម្យ។ ម្ចាស់ផ្ទះយល់ចិត្តសិស្ស។", 120, "2026-10-12", { lang: "km" }),
  r("rv-142", "toul-kork-student-room", "Ryan L.", 5, [5, 5, 5], "Perfect for a semester. Quiet at night and a proper desk to study at.", 120, "2026-08-02"),
  r("rv-143", "toul-kork-student-room", "Lina V.", 4, [4, 5, 4], "Nice and clean. Shared bathroom gets busy in the mornings.", 60, "2026-06-30"),

  r("rv-151", "sen-sok-apartment", "Visal R.", 5, [5, 5, 5], "Spacious and bright. The owner helped us set up an internet plan on day one.", 90, "2026-09-26"),
  r("rv-152", "sen-sok-apartment", "Grace N.", 4, [4, 4, 5], "Good apartment, a little far from the centre but the building is quiet.", 60, "2026-07-19"),

  r("rv-161", "siem-reap-wooden-house", "Isabelle M.", 5, [5, 5, 5], "A beautiful traditional house with a garden. Waking up to the birds was the highlight of our stay.", 30, "2026-10-28", {
    reply: { text: "Thank you Isabelle, you are welcome back any time.", at: "2026-10-29" },
  }),
  r("rv-162", "siem-reap-wooden-house", "Ben S.", 5, [5, 4, 5], "Authentic and peaceful, ten minutes by tuk-tuk to the temples. Owner arranged a driver for us.", 21, "2026-09-14"),
  r("rv-163", "siem-reap-wooden-house", "Rotha C.", 5, [5, 5, 5], "ផ្ទះឈើស្អាតណាស់ ខ្យល់អាកាសស្រស់ស្រាយ។", 30, "2026-08-11", { lang: "km" }),
  r("rv-164", "siem-reap-wooden-house", "Yuki A.", 4, [4, 4, 5], "Charming, and cooler than the new buildings. Mosquito nets are a must in the evenings.", 14, "2026-07-06"),
  r("rv-165", "siem-reap-wooden-house", "Chris P.", 5, [5, 5, 5], "Everything matched the listing, from the kitchen to the garden.", 45, "2026-05-20"),

  r("rv-171", "kampot-river-room", "Amelie D.", 5, [5, 5, 5], "A calm room right by the river. Sunsets from the balcony every evening.", 30, "2026-08-24"),
  r("rv-172", "kampot-river-room", "Dara M.", 4, [5, 4, 4], "Simple, clean and cheap. Pepper farm tour arranged by the owner was a bonus.", 21, "2026-07-30"),
  r("rv-173", "kampot-river-room", "Noah W.", 5, [5, 5, 5], "Great stay and an even better host.", 14, "2026-06-12"),
];

const EMPTY: ReviewSummary = {
  count: 0,
  average: 0,
  distribution: [0, 0, 0, 0, 0],
  categories: { accuracy: 0, cleanliness: 0, communication: 0 },
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function summarize(list: Review[]): ReviewSummary {
  if (list.length === 0) return EMPTY;
  const avg = (pick: (r: Review) => number) => list.reduce((s, x) => s + pick(x), 0) / list.length;
  return {
    count: list.length,
    average: round1(avg((x) => x.rating)),
    distribution: [5, 4, 3, 2, 1].map((n) => list.filter((x) => x.rating === n).length),
    categories: Object.fromEntries(scoreKeys.map((k) => [k, round1(avg((x) => x.scores[k]))])) as ReviewSummary["categories"],
  };
}

/** Published reviews for one home, newest first. */
export function getReviews(listingId: string): Review[] {
  return reviews.filter((x) => x.listingId === listingId).sort((a, b) => b.at.localeCompare(a.at));
}

export function getReviewSummary(listingId: string): ReviewSummary {
  return summarize(getReviews(listingId));
}
