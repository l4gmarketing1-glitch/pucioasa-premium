import { colors } from "@/lib/catalog.mjs";
import type { Review } from "@/lib/reviews";

// Illustrative data only. Render with the visible demo disclosure; never merge into genuine reviews.
// Full names supplied by the owner; abbreviated names remain layout examples.
const presentationNames = [
  "Doru P.",
  "Ilinca R.",
  "Marinela Proca",
  "Vlad C.",
  "Andreea Radu",
  "Anca L.",
  "Sorin M.",
  "Ileana Vicla",
  "Radu T.",
  "Oana S.",
  "Teodora N.",
  "Olimpia Condrut",
  "Diana F.",
  "Cătălin B.",
  "Mara D.",
  "Jeni Visan",
  "Lavinia C.",
  "Mihnea R.",
  "Ioana V.",
  "Cosmin P.",
  "Ardeleanu Gabriel",
  "Andreea T.",
  "Dragoș M.",
  "Bianca N.",
  "Petrosan Cristi",
  "Lucian A.",
  "Corina V.",
  "Ștefan L.",
  "Stela Cernat",
  "Alina D.",
  "Sabina M.",
  "Tudor C.",
  "Silvia Dicu",
  "Raluca F.",
  "Cristian N.",
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
let nextText = 0;
export const reviewExamples: Review[] = Array.from(
  { length: 41 },
  (_, index) => {
    const color = colors[index % colors.length];
    return {
      id: `demo-${index + 1}`,
      displayName: presentationNames[index],
      rating: 5,
      text: index % 4 === 1 ? "" : (suppliedReviewTexts[nextText++] ?? ""),
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
