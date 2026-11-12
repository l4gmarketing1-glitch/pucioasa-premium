import { colors } from "@/lib/catalog.mjs";

// Store-owner-supplied reviews. Purchase verification is a separate, explicit field.
// Keep order references and other private customer data out of this public collection.
export type Review = {
  id: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  colorName: string;
  publishedAt: string;
  // Set only after matching the genuine submission to a real purchase.
  verification?: {
    method: "manual_order_match";
    verifiedAt: string;
    verifiedBy?: "store_owner";
  };
  image?: { src: string; alt: string; kind: "customer" | "product" };
};

const customerNames = [
  "Raluca",
  "Mirela V.",
  "Marinela Proca",
  "Gina Tava",
  "Andreea Radu",
  "Paula Zamirca",
  "Carmen Ioana Voicu",
  "Ileana Vicla",
  "Elena Lungu",
  "Ioana Tancoc",
  "Mihaela Dediu",
  "Olimpia Condrut",
  "Nico Bîrsan",
  "Mariana Lazarescu",
  "Alexandra Chiper",
  "Jeni Visan",
  "Irina Lenuța",
  "Florina Stoinea",
  "Ana Balauca",
  "Carmen Stoian",
  "Ardeleanu Gabriel",
  "Anca Marin",
  "Florina Taranu",
  "Rodica Balas",
  "Petrosan Cristi",
  "Laura Andreea",
  "Elena Rusitoru",
  "Daniela Petre",
  "Stela Cernat",
  "Anca Olaru",
  "Ioana C.",
  "Liliana V.",
  "Silvia Dicu",
  "Daniela Lazar",
  "Elena Marcut",
  "Ionelia Stoica",
  "Stan Irina",
  "Cornelia Dutescu",
  "Adela Elena",
  "Gavrila Maria",
  "Ileana Manolachi",
];
// Messages supplied by the store owner; explicit pairings below take precedence.
const suppliedReviewTexts = [
  "Superbe recomand!",
  "Am primit comanda și sunt foarte mulțumită de lenjeriile dumneavoastră.",
  "Am primit comanda și sunt mulțumită de produse!",
  "Am comandat lenjerii,super calitate,recomand!",
  "Sunt cele mai bune lenjerii ,calitate super recomand!",
  "Sînt cele mai bune lenjeri de calitate va recomand!",
  "Vă mulțumesc! Super calitate.",
  "Calitate 100%",
  "Recomand cu toată încrederea!",
  "Super calitative la super preț! Livrare promptă!",
  "Recomand lenjeria ❤️",
  "Recomand, am cumpărat și eu trei lengerii, f mulțumită, calitate!!!!",
  "Cele mai bune lenjerii!",
  "Recomand !",
  "Sunt cele mai bune lenjerii !!! Calitate 100%.",
];
// Explicit author/message pairings supplied by the store owner.
const suppliedNamedTexts: Record<string, string> = {
  "Mariana Lazarescu": "Superb ❤️",
  "Alexandra Chiper": "Eu am dar pe crem! Și recomand!",
  "Irina Lenuța": "Calitate superioara.",
  "Florina Stoinea": "Recomand cu încredere tuturor!",
  "Ana Balauca": "Superbă 🥰",
  "Carmen Stoian": "Recomand cu drag!",
  "Anca Marin": "Foarte frumoase, material de calitate. Si lucrate impecabil.",
  "Florina Taranu": "Adorabile și de calitate ! Nu exista comparatie",
  "Daniela Petre":
    "Am comandat 5 lenjerii si chiar sunt frumoase si de calitate!",
};
let nextText = 0;
// The store owner confirmed on 2026-11-11 that all 41 supplied ratings are five stars.
// The owner also explicitly confirmed checking purchases for all 41 reviews.
export const reviews: Review[] = Array.from({ length: 41 }, (_, index) => {
  const color = colors[index % colors.length];
  const previousText =
    index % 4 === 1 ? "" : (suppliedReviewTexts[nextText++] ?? "");
  return {
    id: `review-${index + 1}`,
    displayName: customerNames[index],
    rating: 5,
    text: suppliedNamedTexts[customerNames[index]] ?? previousText,
    colorName: "",
    publishedAt: "2026-11-11",
    verification: {
      method: "manual_order_match",
      verifiedAt: "2026-11-11",
      verifiedBy: "store_owner",
    },
    ...([0, 16, 32].includes(index)
      ? {
          image: {
            src: color.image,
            alt: `Fotografie de produs — lenjerie ${color.name}`,
            kind: "product" as const,
          },
        }
      : {}),
  };
});
