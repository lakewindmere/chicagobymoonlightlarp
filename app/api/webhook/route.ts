import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { EmailTemplate } from '@/components/email-template';
import { render } from '@react-email/render';
import React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;

        const scanUrl = `${baseUrl}/scanner?id=${session.id}`;
        const qrCodeData = await QRCode.toDataURL(scanUrl, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            margin: 2
        });

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const productName = lineItems.data[0]?.description || 'Standard';

        const ticketData = {
            stripe_session_id: session.id,
            user_email: session.customer_details?.email,
            ticket_type: productName,
            event_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            is_consumed: false,
        };

        const { error: dbError } = await supabase
            .from('tickets')
            .insert([ticketData]);

        if (dbError) {
            console.error('Supabase Insert Error:', dbError);
            return new NextResponse('Database Error', { status: 500 });
        }

        const userEmail = session.customer_details?.email;
        const userName = session.customer_details?.name || 'Guest';

        if (userEmail) {
            const emailHtml = await render(
                React.createElement(EmailTemplate, {
                    name: userName,
                    orderId: session.id,
                })
            );

            await resend.emails.send({
                from: 'Chicago in Moonlight <contact@chicago-in-moonlight.com>',
                to: [userEmail],
                subject: 'Chicago In Moonlight Admission Ticket',
                html: emailHtml,
            });
        }
    }

    return new NextResponse('Success', { status: 200 });
}