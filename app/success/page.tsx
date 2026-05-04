'use client';

import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useEffect, useState, Suspense, useRef } from 'react'; // Added Suspense
import { useCart } from '../context/CartContext';
import { checkSessionForTickets } from '../actions/stripe';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  const [hasTicket, setHasTicket] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

useEffect(() => {
    async function verifyOrder() {
      if (sessionId) {
        // 1. Clear the cart
        if (!hasCleared.current) {
          clearCart();
          hasCleared.current = true;
        }

        // 2. Check Stripe for tickets
        const result = await checkSessionForTickets(sessionId);
        setHasTicket(result?.hasTickets ?? false);
      }
      setLoading(false);
    }

    verifyOrder();
  }, [sessionId, clearCart]);

  if (loading) {
    return <p className="text-red-700 animate-pulse font-serif">Verifying transaction...</p>;
  }

  return (
    <div className="border-2 border-red-900 p-8 rounded-lg bg-zinc-900 text-center max-w-md w-full">
      <h1 className="text-3xl font-serif text-red-700 mb-2 tracking-widest uppercase">
        {hasTicket ? 'Payment Received' : 'Transaction Complete'}
      </h1>
      
      {hasTicket ? (
        <>
          <p className="text-zinc-400 mb-8 italic">Present this credential at Elysium for entrance.</p>
          <div className="bg-white p-4 inline-block rounded-md mb-6">
            <QRCodeSVG
              value={`${baseUrl}/scanner?id=${sessionId}`}
              size={200}
              level="H"
            />
          </div>
          <div className="text-left text-sm space-y-2 border-t border-zinc-800 pt-6">
            <p><span className="text-red-700 font-bold uppercase">ID:</span> {sessionId?.slice(-12)}</p>
          </div>
        </>
      ) : (
        <div className="py-12">
          <p className="text-zinc-300 font-serif italic text-lg mb-4">
            "Your contribution is noted. Your artifacts will be prepared."
          </p>
          <p className="text-zinc-500 text-sm">
            Thank you for your purchase. You will receive an email confirmation shortly.
          </p>
        </div>
      )}

      <Link href="/" className="mt-8 inline-block text-zinc-500 hover:text-red-500 underline text-sm transition">
        Return to Shadows
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <Suspense fallback={<p className="text-red-700 font-serif">Loading Ritual...</p>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}