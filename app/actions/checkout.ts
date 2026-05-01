'use server'
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleCheckout(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId, 
        quantity: 1,
      },
    ],
    mode: 'payment',
    // Change these to your actual domain later
    success_url: `{baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `{baseUrl}/store`,
  });

  if (session.url) {
    redirect(session.url);
  }
}