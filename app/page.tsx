'use client';

import Link from 'next/link';

export default function Home() {
  return (
    /* h-[calc(100vh-104px)] subtracts the height of your two-tier navbar 
       to ensure zero vertical scrolling on the screen */
    <main className="flex flex-col items-center justify-center h-[calc(100vh-104px)] bg-black p-6 overflow-hidden">
      
      <div className="text-center space-y-12 max-w-2xl">
        
        {/* The Punched-Up Subtitle */}
        <div className="space-y-2">
          <h2 className="text-zinc-200 font-serif font-black uppercase tracking-[0.3em] text-4xl md:text-6xl leading-tight drop-shadow-[0_5px_15px_rgba(185,28,28,0.3)]">
            Monthly Larp Event <br />
          </h2>
        </div>
        <div>
          <Link 
            href="/store" 
            className="group relative inline-block px-12 py-5 bg-red-700 text-black font-serif font-black uppercase tracking-[0.2em] text-xl transition-all hover:bg-red-600 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(185,28,28,0.4)]"
          >
            Purchase Your Ticket
            <span className="absolute inset-0 border border-black/20 m-1"></span>
          </Link>
        </div>

      </div>

      {/* Decorative Floor Detail to ground the page without scrolling */}
      <div className="absolute bottom-10 w-32 h-[1px] bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
    </main>
  );
}