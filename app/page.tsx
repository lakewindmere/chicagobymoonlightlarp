'use client';

import Link from 'next/link';

export default function Home() {
  return (
    /* 
      The height is 100vh minus the top nav (approx 104px) and bottom footer (approx 64px).
      Using overflow-hidden here ensures the red accent stays at the bottom of the viewport 
      without creating a scrollable area.
    */
    <main className="relative flex flex-col items-center justify-center h-[calc(100vh-175px)] bg-black p-6 overflow-hidden">
      
      <div className="text-center space-y-12 max-w-2xl z-10">
        {/* The Punched-Up Subtitle */}
        <div className="space-y-2">
          <h2 className="text-red-700 font-serif font-black uppercase tracking-[0.3em] text-4xl md:text-6xl leading-tight drop-shadow-[0_5px_15px_rgba(185,28,28,0.3)]">
            A Monthly Larp <br />
            <span className="text-zinc-200">Event</span>
          </h2>
        </div>

        {/* The Purchase Action */}
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

      {/* 
         The Red Accent: 
         We position this 'absolute' so it sits at the very bottom of the main area, 
         just above your fixed footer.
      */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent opacity-50"></div>
      
    </main>
  );
}