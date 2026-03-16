import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const PLANS = {
  FREE: {
    name: "Free",
    sessions: 3,
    price: 0,
    priceId: null,
  },
  PRO: {
    name: "Pro",
    sessions: Infinity,
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const;

export type Plan = keyof typeof PLANS;
