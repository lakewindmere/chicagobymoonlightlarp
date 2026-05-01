export default function InformationPage() {
    return (
        <main className="min-h-screen bg-black text-zinc-300 p-8 md:p-24">
            <div className="max-w-4xl mx-auto">

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

                    <section>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
                            <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
                            The Rules of Engagement
                        </h2>
                        <div className="space-y-4 text-lg leading-relaxed font-light text-zinc-400 pl-16">
                            <p>
                                Treat everyone with respect and kindness, both in-character and out-of-character.
                            </p>
                            <p>
                                Promote a physically and emotionally safe environment.
                            </p>
                            <p>
                                Foster an environment where all members feel valued and welcome.
                            </p>
                            <p>
                                Engage in good faith roleplay that values the consent of everyone involved, both in and out of scene.
                            </p>
                            <p>
                                Promote a game you enjoy, and others will enjoy as well.
                            </p>
                            <p>
                                The full list of rules, behaviors, and incident reporting are available on the Discord.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
                            <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
                            Logistics & Arrival
                        </h2>
                        <div className="space-y-4 text-lg leading-relaxed font-light text-zinc-400 pl-16">
                            <p>
                                Doors open at 5:00PM. If you are new and need help creating your character or working on an existing character,
                                our Head Storyteller holds character workshops starting a 6:00PM. All participants are expected to arrive by 6:30PM.
                                At 6:50PM we being Out-Of-Character pre-LARP announcmenets.
                                The LARP starts at 7:00PM with In-Character announcements from The Court.
                                The LARP ends at 11:00PM.
                                We ask for assistance cleaning up after the LARP ends.
                            </p>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center">
                            <span className="w-12 h-[1px] bg-red-700 mr-4"></span>
                            Location
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed font-light text-zinc-400 pl-16">
                            <div>
                                <p className="text-zinc-100 font-serif text-2xl mb-1 uppercase tracking-tighter">Palette & Chisel Academy of Fine Arts</p>
                                <p className="text-red-700 font-mono text-sm uppercase tracking-[0.2em]">1012 N Dearborn St, Chicago, IL 60610</p>
                            </div>

                            <div className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.620465279487!2d-87.63279982424987!3d41.901018763979366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd34e7250a9e1%3A0xed583c9f6fcf7398!2sThe%20Palette%20%26%20Chisel%20Academy%20of%20Fine%20Arts!5e0!3m2!1sen!2sus!4v1777666323967!5m2!1sen!2sus"
                                    width="100%"
                                    height="100%"
                                    style={{
                                        border: 0,
                                        filter: 'grayscale(1) invert(1) contrast(1.2) opacity(0.8)'
                                    }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}