export default function InformationPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Page Title */}
        <header className="mb-20 border-b border-red-900/30 pb-10">
          <h1 className="text-6xl md:text-8xl font-serif font-black uppercase tracking-[0.3em] text-red-700 leading-none">
            The <br />
            <span className="text-zinc-100">Protocol</span>
          </h1>
          <p className="mt-6 text-zinc-500 font-serif italic text-xl tracking-widest">
            "Order must be maintained, even in the shadows."
          </p>
        </header>

        <div className="space-y-20">
          
          {/* Section 1: Rules */}
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
              <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
              The Rules of Engagement
            </h2>
            <div className="space-y-4 text-lg leading-relaxed font-light text-zinc-400 pl-16">
              <p>
                Safety and immersion are our primary pillars. All participants must adhere to the 
                "Touch-and-Go" policy: no physical contact is permitted without explicit verbal 
                consent during roleplay.
              </p>
              <p>
                We utilize a simplified rock-paper-scissors system for conflict resolution, 
                ensuring the story keeps moving without the need for complex dice rolls in the dark.
              </p>
            </div>
          </section>

          {/* Section 2: Logistics */}
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
              <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
              Logistics & Arrival
            </h2>
            <div className="space-y-4 text-lg leading-relaxed font-light text-zinc-400 pl-16">
              <p>
                The gathering commences at 9:00 PM. Please arrive at the side entrance 
                of the venue for credential scanning. Ensure your QR code is ready 
                on your mobile device or printed clearly.
              </p>
              <p>
                Costuming is mandatory. We ask that all guests remain in character 
                from the moment they pass through the threshold of the haven.
              </p>
            </div>
          </section>

          {/* Section 3: Ethics */}
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
              <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
              Community Conduct
            </h2>
            <div className="space-y-4 text-lg leading-relaxed font-light text-zinc-400 pl-16">
              <p>
                Our Chronicle is an inclusive space. Harassment, discrimination, or 
                out-of-character aggression will result in immediate exile from the 
                event without a refund. Respect the players as much as you fear the characters.
              </p>
            </div>
          </section>

        </div>

        {/* Decorative Footer Element */}
        <footer className="mt-32 pt-10 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 font-serif text-sm uppercase tracking-[0.5em]">
            Chicago In Moonlight — MMXXVI
          </p>
        </footer>

      </div>
    </main>
  );
}