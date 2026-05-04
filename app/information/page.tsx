'use client';

import { Cinzel, Cinzel_Decorative } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });
const cinzelDeco = Cinzel_Decorative({ subsets: ['latin'], weight: ['700'] });

function getEventDates(year: number) {
    const dates = [];
    const tbdDates = [
        new Date(year, 9, 31).toDateString(), // October 31
        new Date(year, 11, 26).toDateString() // December 26
    ];

    for (let month = 0; month < 12; month++) {
        const date = new Date(year, month + 1, 0);
        while (date.getDay() !== 6) {
            date.setDate(date.getDate() - 1);
        }

        dates.push({
            date: new Date(date),
            isTBD: tbdDates.includes(date.toDateString())
        });
    }
    return dates;
}

export default function InformationPage() {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const eventDates = getEventDates(currentYear);

    return (
        <main className="min-h-screen bg-black text-zinc-400 p-8 md:p-24">
            <div className="max-w-4xl mx-auto">

                {/* Unified Header */}
                <header className="mb-24 border-b border-red-900/20 pb-12 text-center md:text-left">
                    <h1 className={`${cinzel.className} text-4xl md:text-5xl font-normal uppercase tracking-[0.6em] text-red-700/80`}>
                        Information
                    </h1>
                    <p className={`${cinzel.className} mt-6 text-zinc-600 italic text-base tracking-[0.3em]`}>
                        "Order must be maintained, even in the shadows."
                    </p>
                </header>

                <div className="space-y-32">

                    {/* Rules Section */}
                    <section>
                        <h2 className={`${cinzel.className} text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-red-700 mb-10 flex items-center`}>
                            <span className="w-12 h-[1px] bg-red-700 mr-6"></span>
                            The Rules of Engagement
                        </h2>
                        <div className="space-y-6 text-base md:text-lg leading-relaxed font-light pl-4 md:pl-16 border-l border-zinc-900">
                            {[
                                "Treat everyone with respect and kindness, both in-character and out-of-character.",
                                "Promote a physically and emotionally safe environment.",
                                "Foster an environment where all members feel valued and welcome.",
                                "Engage in good faith roleplay that values the consent of everyone involved, both in and out of scene.",
                                "Promote a game you enjoy, and others will enjoy as well.",
                                "The full list of rules, behaviors, and incident reporting are available on the Discord."
                            ].map((rule, i) => (
                                <p key={i} className="hover:text-zinc-200 transition-colors duration-300">{rule}</p>
                            ))}
                        </div>
                    </section>

                    {/* Schedule Section */}
                    <section>
                        <h2 className={`${cinzel.className} text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-red-700 mb-10 flex items-center`}>
                            <span className="w-12 h-[1px] bg-red-700 mr-6"></span>
                            {currentYear} Gathering Schedule
                        </h2>

                        {/* We REMOVE cinzel from this container to let the site's default font take over */}
                        <div className="space-y-12 pl-4 md:pl-16 border-l border-zinc-900">
                            <p className="text-base md:text-lg leading-relaxed text-zinc-400 font-light">
                                Elysium is held on the last Saturday of every month. The following dates are the scheduled gatherings for this cycle:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {eventDates.map((item, index) => {
                                    const isPast = item.date < today;

                                    return (
                                        <div
                                            key={index}
                                            className={`flex justify-between items-center p-5 border transition-all duration-500 ${isPast
                                                    ? 'opacity-20 grayscale border-transparent'
                                                    : 'bg-zinc-950 border-red-900/20 hover:border-red-700/50 shadow-lg'
                                                }`}
                                        >
                                            {/* Left: Month */}
                                            <span className={`${cinzel.className} uppercase tracking-widest text-sm ${isPast ? 'line-through' : 'text-zinc-200'}`}>
                                                {item.date.toLocaleDateString('en-US', { month: 'long' })}
                                            </span>

                                            {/* Right: Date + TBD Status */}
                                            <div className="flex flex-col items-end">
                                                <span className={`font-mono text-xl leading-none ${isPast ? 'line-through text-zinc-600' : 'text-red-700 font-bold'}`}>
                                                    {item.date.toLocaleDateString('en-US', { day: 'numeric' })}
                                                </span>

                                                {item.isTBD && !isPast && (
                                                    <span className={`${cinzel.className} text-[10px] tracking-[0.2em] text-zinc-500 uppercase mt-1`}>
                                                        TBD
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Timing Section */}
                    <section>
                        <h2 className={`${cinzel.className} text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-red-700 mb-10 flex items-center`}>
                            <span className="w-12 h-[1px] bg-red-700 mr-6"></span>
                            Timing
                        </h2>
                        <div className="space-y-6 text-base md:text-lg leading-relaxed pl-4 md:pl-16 border-l border-zinc-900">
                            <p>
                                Doors open at <span className="text-red-700 font-bold">5:00 PM</span>. For Kindred new to the city, our Head Storyteller holds character workshops at <span className="text-zinc-200">6:00 PM</span>.
                            </p>
                            <p>
                                All participants must arrive by <span className="text-zinc-200">6:30 PM</span>. Out-of-Character announcements begin at <span className="text-zinc-200">6:50 PM</span>, with the Court convening strictly at <span className="text-red-700 font-bold">7:00 PM</span>.
                            </p>
                            <p className="text-zinc-500 italic">
                                The evening concludes at 11:00 PM. We appreciate assistance in restoring the haven to its original state.
                            </p>
                        </div>
                    </section>

                    {/* Location Section */}
                    <section className="pb-24">
                        <h2 className={`${cinzel.className} text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-red-700 mb-10 flex items-center`}>
                            <span className="w-12 h-[1px] bg-red-700 mr-6"></span>
                            Location
                        </h2>
                        <div className="space-y-8 pl-4 md:pl-16">
                            <div>
                                <p className={`${cinzel.className} text-zinc-100 text-3xl mb-2 uppercase tracking-tighter`}>Palette & Chisel Academy of Fine Arts</p>
                                <p className="text-red-700 font-mono text-sm uppercase tracking-[0.3em]">1012 N Dearborn St, Chicago, IL 60610</p>
                            </div>

                            <div className="w-full h-96 bg-zinc-900 border border-red-900/20 rounded-sm overflow-hidden shadow-2xl relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.6586392067!2d-87.63223282346!3d41.90128917124016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd34e12720931%3A0x6968058444e99ef3!2sPalette%20%26%20Chisel%20Academy%20of%20Fine%20Arts!5e0!3m2!1sen!2sus!4v1700000000000"
                                    width="100%"
                                    height="100%"
                                    style={{
                                        border: 0,
                                        filter: 'grayscale(1) invert(0.9) contrast(1.2) opacity(0.8)'
                                    }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                <div className="absolute inset-0 pointer-events-none border border-red-900/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}