'use client';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useEffect, useState } from 'react'; // Add these

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [origin, setOrigin] = useState(''); // State to hold the domain

  // This only runs in the browser
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="border-2 border-red-900 p-8 rounded-lg bg-zinc-900 text-center max-w-md w-full">
        <h1 className="text-3xl font-serif text-red-700 mb-2 tracking-widest uppercase">Payment Received</h1>
        <p className="text-zinc-400 mb-8 italic">Present this credential at the haven entrance.</p>

        <div className="bg-white p-4 inline-block rounded-md mb-6">
          {sessionId && origin ? (
            <QRCodeSVG 
              value={`${origin}/scanner?id=${sessionId}`} 
              size={200}
              level="H"
            />
          ) : (
            <div className="w-[200px] h-[200px] bg-zinc-800 flex items-center justify-center">
              <p className="text-sm text-zinc-500">Generating Essence...</p>
            </div>
          )}
        </div>

        <div className="text-left text-sm space-y-2 border-t border-zinc-800 pt-6">
          <p><span className="text-red-700 font-bold uppercase">ID:</span> {sessionId?.slice(-12)}</p>
          <p><span className="text-red-700 font-bold uppercase">Status:</span> Authorized</p>
        </div>

        <Link href="/" className="mt-8 inline-block text-zinc-500 hover:text-red-500 underline text-sm transition">
          Return to Shadows
        </Link>
      </div>
    </main>
  );
}