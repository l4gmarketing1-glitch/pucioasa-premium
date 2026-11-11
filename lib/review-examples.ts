import { colors } from "@/lib/catalog.mjs";
import type { Review } from "@/lib/reviews";

// Illustrative data only. Render with the visible demo disclosure; never merge into genuine reviews.
// All 41 display names supplied by the owner; no invented names remain.
const presentationNames = [
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
// Messages supplied by the store owner; name/text pairings and ratings remain illustrative.
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
export const reviewExamples: Review[] = Array.from(
  { length: 41 },
  (_, index) => {
    const color = colors[index % colors.length];
    const previousText =
      index % 4 === 1 ? "" : (suppliedReviewTexts[nextText++] ?? "");
    return {
      id: `demo-${index + 1}`,
      displayName: presentationNames[index],
      rating: 5,
      text: suppliedNamedTexts[presentationNames[index]] ?? previousText,
      colorName: color.name,
      publishedAt: "2026-11-11",
      ...([0, 16, 32].includes(index)
        ? {
            image: {
              src: color.image,
              alt: `Fotografie de produs pentru exemplul demonstrativ ${index + 1}`,
              kind: "product" as const,
            },
          }
        : {}),
    };
  },
);
