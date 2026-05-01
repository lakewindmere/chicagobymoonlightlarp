import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Initialize Supabase with Service Role Key (to bypass RLS for this system task)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers(); 
  const signature = headerPayload.get('Stripe-Signature') as string;

  let event;

  try {
    // 1. Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Handle the "checkout.session.completed" event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    // Extract data to save to Supabase
    const ticketData = {
      stripe_session_id: session.id,
      user_email: session.customer_details?.email,
      ticket_type: 'Standard', // You can pull specific product names from session.line_items
      event_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      is_consumed: false,
    };

    // 3. Insert into Supabase
    const { error } = await supabase
      .from('tickets')
      .insert([ticketData]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return new NextResponse('Database Error', { status: 500 });
    }
  }

  return new NextResponse('Success', { status: 200 });
}