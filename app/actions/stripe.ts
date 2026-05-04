'use server'
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store`,
  });

  redirect(session.url!);
}

export async function getActiveProducts() {
  const products = await stripe.products.list({ active: true });
  const allPrices = await stripe.prices.list({ active: true });

  return products.data.map((product) => {
    const productPrices = allPrices.data
      .filter(p => p.product === product.id)
      .map(p => ({
        id: p.id,
        label: p.lookup_key || p.metadata.size || 'Standard',
        unit_amount: p.unit_amount ? p.unit_amount / 100 : 0
      }))
      // Sort prices from lowest to highest
      .sort((a, b) => a.unit_amount - b.unit_amount);

    return {
      productId: product.id,
      name: product.name,
      // Use the first (lowest) price for the display
      priceId: productPrices[0]?.id || '', 
      price: productPrices[0]?.unit_amount || 0, 
      variants: productPrices,
      image: product.images[0] || null,
      icon: product.metadata.icon || '🩸',
      category: product.metadata.category || 'Other',
      description: product.description,
    };
  });
}

export async function checkSessionForTickets(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Check if any line item description contains "Admission" or matches your ticket criteria
    const hasTickets = session.line_items?.data.some(item => 
      item.description?.toLowerCase().includes('ticket')
    );

    return { hasTickets };
  } catch (error) {
    console.error("Error verifying session:", error);
    return { hasTickets: false };
  }
}