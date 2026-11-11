import { colors } from "@/lib/catalog.mjs";
import type { Review } from "@/lib/reviews";

// Illustrative data only. Render with the visible demo disclosure; never merge into genuine reviews.
const demoNames = [
  "Doru P.",
  "Ilinca R.",
  "Adelina Munteanu",
  "Vlad C.",
  "Cezara Dima",
  "Anca L.",
  "Sorin M.",
  "Irina Pavel",
  "Radu T.",
  "Oana S.",
  "Teodora N.",
  "Rareș Banu",
  "Diana F.",
  "Cătălin B.",
  "Mara D.",
  "Anamaria Dobre",
  "Lavinia C.",
  "Mihnea R.",
  "Ioana V.",
  "Cosmin P.",
  "Nicoleta Sava",
  "Andreea T.",
  "Dragoș M.",
  "Bianca N.",
  "Miruna Dinu",
  "Lucian A.",
  "Corina V.",
  "Ștefan L.",
  "Iulia Rusu",
  "Alina D.",
  "Sabina M.",
  "Tudor C.",
  "Simona Vasile",
  "Raluca F.",
  "Cristian N.",
  "Daria S.",
  "Roxana Petrescu",
  "Florin R.",
  "Camelia B.",
  "Viorica T.",
  "Sergiu P.",
];
const demoTexts = [
  "Exemplu de recenzie despre nuanța aleasă. Aici poate apărea o impresie despre potrivirea în dormitor.",
  "Exemplu de mesaj scurt despre experiența de cumpărare.",
  "Exemplu de recenzie despre conținutul setului și dimensiuni.",
  "Exemplu de impresie după primirea comenzii. Textul real va aparține clientului.",
  "Exemplu de mesaj despre detaliile preferate ale produsului.",
  "Exemplu de recenzie despre folosirea lenjeriei. Clientul poate adăuga și o fotografie proprie.",
  "Exemplu de observație despre ambalare și livrare.",
  "Exemplu de recomandare pentru alegerea culorii. Recenzia autentică va fi publicată cu acordul autorului.",
];
export const reviewExamples: Review[] = Array.from(
  { length: 41 },
  (_, index) => {
    const color = colors[index % colors.length];
    return {
      id: `demo-${index + 1}`,
      displayName: demoNames[index],
      rating: 5,
      text: index % 4 === 1 ? "" : demoTexts[index % demoTexts.length],
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
