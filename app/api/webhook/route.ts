import { stripe } from '@/lib/stripe';
import { Resend } from 'resend';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin override
);

export async function POST(req: Request) {
    const body = await req.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('Stripe-Signature') as string;


    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;

        // 1. Fetch full line items to parse quantities and descriptions
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // 2. Identify Tickets and calculate total quantity for Supabase
        const ticketItems = lineItems.data.filter(item =>
            item.description?.toLowerCase().includes('ticket')
        );


        const totalTicketsPurchased = ticketItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
        const hasTickets = totalTicketsPurchased > 0;


        if (hasTickets) {
            // 3a. Separate Donation items from Regular items
            const donationItem = ticketItems.find(item =>
                item.description?.toLowerCase().includes('donation ticket')
            );

            const regularItems = ticketItems.filter(item =>
                !item.description?.toLowerCase().includes('donation ticket')
            );

            // 3b. Handle Donation Ticket Increment
            if (donationItem) {
                const purchasedDonationQty = donationItem.quantity || 0;

                // Fetch the current total for 'Donation Ticket'
                const { data: existingDonation } = await supabase
                    .from('tickets')
                    .select('id, quantity')
                    .eq('ticket_type', 'Donation Ticket')
                    .maybeSingle(); // Returns null if not found instead of throwing an error

                if (existingDonation) {
                    // Update existing record
                    await supabase
                        .from('tickets')
                        .update({ quantity: existingDonation.quantity + purchasedDonationQty })
                        .eq('id', existingDonation.id);
                } else {
                    // Create the first donation record if it doesn't exist
                    await supabase.from('tickets').insert([{
                        stripe_session_id: session.id,
                        user_email: 'ghoulbot@chicago-in-moonlight.com',
                        ticket_type: 'Donation Ticket',
                        quantity: purchasedDonationQty,
                        redeemed_count: 0,
                        event_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
                    }]);
                }
            }

            // 3c. Handle Regular Tickets (Standard Logic)
            if (regularItems.length > 0) {
                const regularQty = regularItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
                await supabase.from('tickets').insert([{
                    stripe_session_id: session.id,
                    user_email: session.customer_details?.email,
                    ticket_type: regularItems[0]?.description || 'General Admission',
                    quantity: regularQty,
                    redeemed_count: 0,
                    event_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
                }]);
            }
        }

        // 4. Send Confirmation Email via Resend
        try {
            // Create the QR link if they bought tickets
            const qrLink = hasTickets
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id=${session.id}`
                : null;

            await resend.emails.send({
                from: 'Chicago In Moonlight <contact@chicago-in-moonlight.com>',
                to: session.customer_details.email,
                subject: hasTickets ? 'Your Digital Credential & Order Manifest' : 'Night Market Order Confirmed',
                react: OrderConfirmationEmail({
                    customerName: session.customer_details?.name || 'Kindred',
                    orderId: session.id,
                    items: lineItems.data,
                    total: session.amount_total,
                    qrLink: qrLink
                }),
            });
        } catch (emailError) {
            console.error("Resend Email Error:", emailError);
        }
    }

    return new Response('Webhook Handled', { status: 200 });
}