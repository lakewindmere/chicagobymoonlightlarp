'use server'
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import { CartItem } from '../context/CartContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleCartCheckout(items: CartItem[]) {
  // Create the string for the dashboard
  const orderSummary = items.map(item => `${item.name} (x${item.quantity})`).join(', ');

  const session = await stripe.checkout.sessions.create({
    line_items: items.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    mode: 'payment',
    // 1. Metadata for the Session object
    metadata: {
      order_details: orderSummary,
    },
    // 2. Metadata for the Payment Intent (the actual charge)
    payment_intent_data: {
      metadata: {
        order_details: orderSummary,
      }
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
  });

  if (session.url) {
    redirect(session.url);
  }
}