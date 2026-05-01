'use server'
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

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
    success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/store`,
  });

  if (session.url) {
    redirect(session.url);
  }
}