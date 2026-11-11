// Add only genuine, consented reviews after manually checking the purchase in Stripe.
// Keep order references and other private customer data out of this public collection.
export type Review = {
  id: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  colorName: string;
  publishedAt: string;
};

export const reviews: Review[] = [];
