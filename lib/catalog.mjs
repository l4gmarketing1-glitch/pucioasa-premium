export const product = {
  id: "lenjerie-6-piese",
  name: "Lenjerii de pat Pucioasa Premium · 6 piese",
  material: "Damasc Fine",
  amount: 14900,
  referenceAmount: 19900,
  currency: "ron",
};
// Stable variant IDs match the original numbered supplier photographs.
export const colors = [
  {
    id: "v01",
    name: "Roz pudrat",
    hex: "#edd1d0",
    image: "/products/1.jpg",
  },
  {
    id: "v02",
    name: "Gri taupe",
    hex: "#9c8d88",
    image: "/products/2.jpg",
  },
  {
    id: "v03",
    name: "Vișiniu",
    hex: "#4c1624",
    image: "/products/3.jpg",
  },
  {
    id: "v04",
    name: "Bej nisipiu",
    hex: "#c2b3ae",
    image: "/products/4.jpg",
  },
  {
    id: "v05",
    name: "Roz cenușiu",
    hex: "#927f7b",
    image: "/products/5.jpg",
  },
  {
    id: "v06",
    name: "Gri ardezie",
    hex: "#6d6769",
    image: "/products/6.jpg",
  },
  {
    id: "v07",
    name: "Verde smarald",
    hex: "#326755",
    image: "/products/7.jpg",
  },
  {
    id: "v08",
    name: "Turcoaz",
    hex: "#257373",
    image: "/products/8.jpg",
  },
  {
    id: "v09",
    name: "Roz liliac",
    hex: "#dcb6c3",
    image: "/products/9.jpg",
  },
  {
    id: "v10",
    name: "Gri perlat",
    hex: "#98979d",
    image: "/products/10.jpg",
  },
  {
    id: "v11",
    name: "Somon",
    hex: "#da9a8e",
    image: "/products/11.jpg",
  },
  {
    id: "v12",
    name: "Verde mentă",
    hex: "#8eb6ad",
    image: "/products/12.jpg",
  },
  {
    id: "v13",
    name: "Albastru azur",
    hex: "#4890a6",
    image: "/products/13.jpg",
  },
  {
    id: "v14",
    name: "Verde salvie",
    hex: "#688279",
    image: "/products/14.jpg",
  },
  {
    id: "v15",
    name: "Ivoriu",
    hex: "#ece0c6",
    image: "/products/15.jpg",
  },
  {
    id: "v16",
    name: "Turcoaz intens",
    hex: "#026f74",
    image: "/products/16.jpg",
  },
  {
    id: "v17",
    name: "Negru",
    hex: "#08070d",
    image: "/products/17.jpg",
  },
  {
    id: "v18",
    name: "Alb",
    hex: "#f0f0f0",
    image: "/products/18.jpg",
  },
  {
    id: "v19",
    name: "Gri antracit",
    hex: "#595c61",
    image: "/products/19.jpg",
  },
];
export function validateSelection(input) {
  if (
    !input ||
    !colors.some((c) => c.id === input.color) ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 5
  )
    return null;
  return { color: input.color, quantity: input.quantity };
}
export function activeDeadline(value, now = Date.now()) {
  const end = Date.parse(value || "");
  return Number.isFinite(end) && end > now ? end : null;
}

// A discount is derived only from a supplied reference price, never from a desired badge.
export function referenceDiscount(value) {
  if (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value))
    return null;
  const amount = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(amount) || amount <= product.amount) return null;
  const percent = Math.round(((amount - product.amount) / amount) * 100);
  return percent > 0 && percent < 100 ? { amount, percent } : null;
}
