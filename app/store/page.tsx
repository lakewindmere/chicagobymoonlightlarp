'use client';

import Link from 'next/link';
import { handleCheckout } from '../actions/checkout';

export default function Home() {
    // Example ticket tiers - you can later fetch these from Supabase or Stripe
    const ticketTiers = [
        { id: 'standard', name: 'Admission', price: '$25', icon: '🩸', priceId: 'price_1TSJcrIwzBgGm4Tdfjlj1MEZ' }
    ];
    const merchItems = [
        { id: 'shirt-1', name: 'Domain Tee', price: '$30', icon: '👕' },
        { id: 'hoodie-1', name: 'Haven Hoodie', price: '$55', icon: '🧥' },
        { id: 'pin-1', name: 'Clan Sigil', price: '$15', icon: '🪙' },
    ];

    return (
        <main className="relative flex flex-col items-center min-h-[calc(100vh-168px)] bg-black p-6 overflow-x-hidden">

            {/* Subtitle Section */}
            <div className="text-center mt-12 mb-16 space-y-2">
                <h2 className="text-red-700 font-serif font-black uppercase tracking-[0.3em] text-4xl md:text-6xl leading-tight drop-shadow-[0_5px_15px_rgba(185,28,28,0.3)]">
                    Night <br />
                    <span className="text-zinc-200">Market</span>
                </h2>
                <p className="text-zinc-500 font-serif italic text-lg tracking-widest">
                    LARP Tickets & Merch
                </p>
            </div>
            {/* --- TICKET SECTION --- */}
            <section className="w-full max-w-5xl mb-24">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800"></div>
                    <h3 className="text-zinc-500 font-serif uppercase tracking-[0.4em] text-xs">LARP Tickets</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ticketTiers.map((tier) => (
                        <button
                            key={tier.id}
                            // Bind ensures the priceId is passed correctly on click
                            onClick={handleCheckout.bind(null, tier.priceId)}
                            className="group relative aspect-square bg-zinc-900/30 border border-zinc-800 hover:border-red-700 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer w-full"
                        >
                            <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/5 transition-colors"></div>
                            <div className="relative z-10 flex flex-col items-center text-center p-6">
                                <span className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110">
                                    {tier.icon}
                                </span>
                                <h4 className="text-zinc-100 font-serif uppercase tracking-[0.2em] text-lg mb-1">{tier.name}</h4>
                                <p className="text-red-700 font-mono font-bold">{tier.price}</p>
                            </div>
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                        </button>
                    ))}
                </div>
            </section>

            {/* --- MERCH SECTION --- */}
            <section className="w-full max-w-5xl">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800"></div>
                    <h3 className="text-zinc-500 font-serif uppercase tracking-[0.4em] text-xs">Relics & Attire</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchItems.map((item) => (
                        <Link
                            key={item.id}
                            href={`/merch/${item.id}`}
                            className="group relative aspect-square bg-zinc-900/30 border border-zinc-800 hover:border-red-700 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/5 transition-colors"></div>
                            <div className="relative z-10 flex flex-col items-center text-center p-6">
                                <span className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110">
                                    {item.icon}
                                </span>
                                <h4 className="text-zinc-100 font-serif uppercase tracking-[0.2em] text-lg mb-1">{item.name}</h4>
                                <p className="text-red-700 font-mono font-bold">{item.price}</p>
                            </div>
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                        </Link>
                    ))}
                </div>
            </section>
            {/* Red Accent at bottom */}
            <div className="mt-20 w-48 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent opacity-50"></div>
        </main>
    );
}