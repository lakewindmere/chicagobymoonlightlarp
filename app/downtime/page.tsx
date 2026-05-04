'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LZString from 'lz-string';
import { Cinzel } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });


export default function DowntimePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleTransmit = async () => {
        setIsSubmitting(true);

        const charId = character?.uid;

        console.log('character uid', character?.uid)

        if (!charId) {
            console.error("Character ID is missing. Cannot submit downtime.");
            alert("Error: Character profile not found. Please refresh and try again.");
            return;
        }

        try {
            const { error } = await supabase
                .from('downtime_submissions')
                .insert([{
                    character_id: charId,
                    submission_month: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
                    content: { downtimes, domainData, plotOptIn },
                    is_resolved: false
                }]);

            if (error) throw error;

            // Switch to success view
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Transmission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [character, setCharacter] = useState<any>(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // 1, 2, or 3
    const [direction, setDirection] = useState(0);
    // State for all 3 Actions
    const [downtimes, setDowntimes] = useState([
        { text: '', st: '' },
        { text: '', st: '' },
        { text: '', st: '' }
    ]);

    const [domainData, setDomainData] = useState({
        feedingRoutine: '', // Now bundles location and routine
        predatorMethod: '', // Predator type and how they feed
        domainLocation: '', // Physical domain description
        domainConfirmed: false, // Prince/Herald acceptance check
    });

    const [plotOptIn, setPlotOptIn] = useState({
        riskLevel: 1,
        objectives: [] as string[],
        optInDetails: '', // Details related to opt-in choices
        involvementNotes: '', // Specific DTAs/Traits for plot involvement
        hasTroublemaker: false, // Troublemaker Flaw notation
    });

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkExistingSubmission = async () => {
            if (!character?.id) return;

            setIsChecking(true);
            const currentMonthYear = `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;

            try {
                console.log(currentMonthYear, character.uid);
                const { data, error } = await supabase
                    .from('downtime_submissions')
                    .select('id')
                    .eq('character_id', character.uid)
                    .eq('submission_month', currentMonthYear)
                    .maybeSingle(); // Returns null instead of an error if no row is found
                console.log(data);
                if (data) {
                    setIsSubmitted(true); // If a record exists, jump straight to the Success/View screen
                }
            } catch (err) {
                console.error("Error checking submissions:", err);
            } finally {
                setIsChecking(false);
            }
        };

        checkExistingSubmission();
    }, [character]);

    const paginate = (newDirection: number) => {
        const next = currentPage + newDirection;
        if (next >= 1 && next <= 2) {
            setDirection(newDirection);
            setCurrentPage(next);
        }
    };

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    );

    const handleCloudSearch = async () => {
        if (!searchEmail || !searchName) return;
        setIsSearching(true);

        const { data, error } = await supabase
            .from('character_registry')
            .select('*')
            .eq('player_email', searchEmail)
            .ilike('character_name', `%${searchName}%`);
        console.log("Search Results:", data, error);
        if (data) setSearchResults(data);
        if (error) console.error(error);
        setIsSearching(false);
    };

    // --- OPTION B: Load via File ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                setCharacter(data);
            } catch (e) { alert("Invalid Dossier File"); }
        };
        reader.readAsText(file);
    };


    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto py-24 text-center space-y-8 font-geist"
            >
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="h-24 w-24 rounded-full border border-red-900/50 flex items-center justify-center bg-red-950/5 shadow-[0_0_50px_rgba(153,27,27,0.1)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className={`${cinzel.className} text-4xl tracking-widest text-zinc-100`}>
                        DTAs <span className="text-red-700 font-black">Submitted</span>
                    </h2>
                    <div className="h-[1px] w-48 bg-zinc-900 mx-auto"></div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        Your actions for the {new Date().toLocaleString('default', { month: 'long' })} cycle have been sent to the Storytelling staff.
                    </p>
                </div>
            </motion.div>
        );
    }

    // --- THE GATED UI ---
    if (!character) {
        return (
            <main className="min-h-screen bg-black text-zinc-400 p-8 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full space-y-12">

                    {/* Header */}
                    <div>
                        <h1 className={`${cinzel.className} text-3xl uppercase tracking-[0.2em] text-red-700 mb-2`}>
                            Select <span className="text-zinc-100">Character</span>
                        </h1>
                        <p className="text-[10px] tracking-widest text-zinc-600 border-b border-zinc-900 pb-4">
                            If you have not created a character dossier, please do so in the Character Creation tab before submitting downtime actions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Left Side: File Upload */}
                        <div className="space-y-6 border-r border-zinc-900 pr-12">
                            <h2 className={`${cinzel.className} text-xs uppercase tracking-[0.2em] text-zinc-200`}>Local Archive</h2>
                            <p className="text-[10px] leading-relaxed text-zinc-500">Upload your local dossier</p>
                            <input type="file" id="dossier-up" accept=".json" className="hidden" onChange={handleFileUpload} />
                            <button
                                onClick={() => document.getElementById('dossier-up')?.click()}
                                className="w-full py-3 border border-zinc-800 text-zinc-400 uppercase tracking-widest text-[9px] hover:bg-zinc-900 hover:text-white transition-all"
                            >
                                Upload Dossier
                            </button>
                        </div>

                        {/* Right Side: Cloud Search */}
                        <div className="space-y-4">
                            <h2 className={`${cinzel.className} text-xs uppercase tracking-[0.2em] text-zinc-200`}>Cloud Registry</h2>
                            <div className="space-y-3">
                                <input
                                    placeholder="Player Email"
                                    className="w-full bg-transparent border-b border-zinc-900 p-2 text-[10px] focus:outline-none focus:border-red-900"
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                />
                                <input
                                    placeholder="Character Name"
                                    className="w-full bg-transparent border-b border-zinc-900 p-2 text-[10px] focus:outline-none focus:border-red-900"
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                                <button
                                    onClick={handleCloudSearch}
                                    className="w-full py-3 border border-zinc-800 text-zinc-400 uppercase tracking-widest text-[9px] hover:bg-zinc-900 hover:text-white transition-all"
                                >
                                    {isSearching ? 'Querying...' : 'Search Registry'}
                                </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="mt-4 border border-zinc-800 bg-zinc-950 p-2 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[8px] tracking-widest text-zinc-600 mb-2 px-2">Select Identity:</p>
                                    {searchResults.map(res => (
                                        <button
                                            key={res.id}
                                            onClick={() => setCharacter(res.character_data)}
                                            className="w-full text-left px-3 py-2 text-[10px] tracking-widest hover:bg-red-900 hover:text-black transition-colors"
                                        >
                                            {res.character_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        );
    }

    if (isChecking) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-24 text-center font-geist">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-700 animate-pulse">
                    Authenticating Character Dossier...
                </p>
            </div>
        );
    }

    // --- ACTIVE DOWNTIME FORM ---
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <AnimatePresence mode="wait" custom={direction}>
                {/* Page 01: Narrative Actions */}
                {currentPage === 1 && (
                    <motion.div
                        key="page1"
                        custom={direction}
                        initial={{ x: direction > 0 ? 500 : -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction < 0 ? 500 : -500, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="space-y-12"
                    >
                        {/* Main Page Header */}
                        <div>
                            <h1 className={`${cinzel.className} text-3xl uppercase tracking-[0.2em] text-red-700 mb-2`}>
                                Downtime <span className="text-zinc-100">Actions</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 border-b border-zinc-900 pb-4">
                                Submission Cycle: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}                            </p>
                        </div>

                        {/* Information Blurbs Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Amount of Actions */}
                            <section className="space-y-3">
                                <h2 className={`${cinzel.className} text-sm text-zinc-100 tracking-widest border-b border-red-900/30 pb-2`}>
                                    Amount of Actions
                                </h2>
                                <div className="text-[11px] leading-relaxed tracking-wider text-zinc-500 space-y-2">
                                    <p>You are allowed <span className="text-zinc-300">three downtime actions</span> between games. Staff will notify you of results via email.</p>
                                    <p>Describe your character's intent clearly; overloading an entry with too much activity may cause the action to fail.</p>
                                    <p>Action order only matters if one relies on the outcome of a previous entry.</p>
                                </div>
                            </section>

                            {/* Backgrounds & Scenes */}
                            <section className="space-y-3">
                                <h2 className={`${cinzel.className} text-sm text-zinc-100 tracking-widest border-b border-red-900/30 pb-2`}>
                                    Backgrounds & Assets
                                </h2>
                                <div className="text-[11px] leading-relaxed tracking-wider text-zinc-500 space-y-2">
                                    <p>Utilizing <span className="text-zinc-300">Backgrounds</span> is recommended to minimize personal risk and avoid being "stuck" at a location.</p>
                                    <p>Using the same Ally, Contact, or Retainer multiple times in a cycle risks harm to them.</p>
                                    <p>Should an asset suffer harm due to your orders, you gain <span className="text-red-800 font-bold">1 Stain</span>.</p>
                                </div>
                            </section>

                            {/* Shared Actions & Combat */}
                            <section className="space-y-3">
                                <h2 className={`${cinzel.className} text-sm text-zinc-100 tracking-widest border-b border-red-900/30 pb-2`}>
                                    Shared Actions & Combat
                                </h2>
                                <div className="text-[11px] leading-relaxed tracking-wider text-zinc-500 space-y-2">
                                    <p>Shared efforts require <span className="text-zinc-300">both players</span> to use an action to confirm presence and consent.</p>
                                    <p>Combat against non-consenting parties is resolved as a <span className="text-red-700">Live Scene</span> before gameplay.</p>
                                    <p>Utilize the Boon economy to secure help or muscle for your objectives.</p>
                                </div>
                            </section>
                        </div>

                        {/* Narrative Inputs */}
                        <div className="space-y-16 pt-8">
                            {[0, 1, 2].map((i) => (
                                <section key={i} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                            Action 0{i + 1}
                                        </h3>
                                        <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] tracking-widest text-zinc-500 font-medium">
                                            Description of intent
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={downtimes[i].text}
                                            onChange={(e) => {
                                                const newDt = [...downtimes];
                                                newDt[i].text = e.target.value;
                                                setDowntimes(newDt);
                                            }}
                                            className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                            placeholder="Describe what your character is doing, the backgrounds you are utilizing, and what you hope to achieve..."
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                                            Requested Storyteller
                                        </label>
                                        <input
                                            type="text"
                                            value={downtimes[i].st}
                                            onChange={(e) => {
                                                const newDt = [...downtimes];
                                                newDt[i].st = e.target.value;
                                                setDowntimes(newDt);
                                            }}
                                            className="bg-transparent border-b border-zinc-900 text-zinc-300 py-2 text-[13px] tracking-wide focus:outline-none focus:border-red-900 w-full md:w-72 transition-colors"
                                            placeholder="Preferred Storyteller (optional)"
                                        />
                                    </div>
                                </section>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Page 02: Feeding & Domain */}
                {currentPage === 2 && (
                    <motion.div
                        key="page2"
                        custom={direction}
                        initial={{ x: direction > 0 ? 500 : -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction < 0 ? 500 : -500, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="space-y-12"
                    >
                        {/* Page Header */}
                        <div>
                            <h1 className={`${cinzel.className} text-3xl font-black tracking-[0.2em] text-red-700 mb-2`}>
                                Feeding & <span className="text-zinc-100 font-light">Domain</span>
                            </h1>
                            <p className="text-[10px] tracking-widest text-zinc-600 border-b border-zinc-900 pb-4">
                                Submission Cycle: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                            </p>
                        </div>

                        {/* Section 1: Feeding Routine */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Feeding Routine
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest">
                                    Where will you be feeding? Note any deviations from your usual routine.
                                    The Rack is available at Roger's Park and Millennium Park.
                                </p>
                                <textarea
                                    rows={4}
                                    value={domainData.feedingRoutine}
                                    onChange={(e) => setDomainData({ ...domainData, feedingRoutine: e.target.value })}
                                    className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                    placeholder="Specify location or Rack details..."
                                />
                            </div>
                        </section>

                        {/* Section 2: Predator Methodology */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Predator Methodology
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest">
                                    Identify your character's predator type and describe how it will be applied to your feeding this cycle.
                                </p>
                                <textarea
                                    rows={3}
                                    value={domainData.predatorMethod}
                                    onChange={(e) => setDomainData({ ...domainData, predatorMethod: e.target.value })}
                                    className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                    placeholder="Describe the application of your predator type..."
                                />
                            </div>
                        </section>

                        {/* Section 3: Domain Location */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Domain Location
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest">
                                    Describe the physical boundaries and current status of your claimed territory.
                                </p>
                                <textarea
                                    rows={4}
                                    value={domainData.feedingRoutine}
                                    onChange={(e) => setDomainData({ ...domainData, domainLocation: e.target.value })}
                                    className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                    placeholder="Specify the location of your domain and haven..."
                                />
                            </div>
                        </section>

                        {/* Domain Confirmation (Footer of the page) */}
                        <section className="pt-6">
                            <button
                                onClick={() => setDomainData({ ...domainData, domainConfirmed: !domainData.domainConfirmed })}
                                className={`w-full flex items-center gap-4 px-6 py-4 border transition-all ${domainData.domainConfirmed ? 'border-red-900/50 bg-red-950/5 text-red-500 shadow-[0_0_15px_rgba(153,27,27,0.1)]' : 'border-zinc-900 text-zinc-600 hover:border-zinc-800'
                                    }`}
                            >
                                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${domainData.domainConfirmed ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-zinc-800'
                                    }`} />
                                <span className="text-[10px] tracking-widest text-left">
                                    The Prince and Herald have been formally notified and have accepted this domain claim
                                </span>
                            </button>
                        </section>
                    </motion.div>
                )}

                {/* Page 03: Plot Opt-In */}
                {currentPage === 3 && (
                    <motion.div
                        key="page3"
                        custom={direction}
                        initial={{ x: direction > 0 ? 500 : -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction < 0 ? 500 : -500, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="space-y-12"
                    >
                        {/* Page Header */}
                        <div>
                            <h1 className={`${cinzel.className} text-3xl font-black tracking-[0.2em] text-red-700 mb-2`}>
                                Plot <span className="text-zinc-100 font-light">Engagement</span>
                            </h1>
                            <p className="text-[10px] tracking-widest text-zinc-600 border-b border-zinc-900 pb-4">
                                Submission Cycle: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                            </p>
                        </div>

                        {/* Section 1: Risk Tolerance */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Risk Tolerance
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest italic border-l border-zinc-900 pl-4">
                                    Substantial consequences are narrative-focused and negotiable. Final Death is never on the table in a downtime action without further player choice.
                                </p>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setPlotOptIn({ ...plotOptIn, riskLevel: num })}
                                            className={`w-10 h-10 border transition-all text-[11px] ${plotOptIn.riskLevel === num
                                                ? 'border-red-700 text-red-500 bg-red-950/5'
                                                : 'border-zinc-900 text-zinc-600 hover:border-zinc-700'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <span className="ml-4 text-[10px] tracking-widest text-zinc-500 italic">
                                        {plotOptIn.riskLevel === 1 ? 'No Risk, Information Only' :
                                            plotOptIn.riskLevel === 2 ? 'Low Risk, Some Reward' :
                                                plotOptIn.riskLevel === 3 ? 'Moderate Risk, Standard Narrative Involvement' :
                                                    plotOptIn.riskLevel === 4 ? 'What could go wrong?' :
                                                        plotOptIn.riskLevel === 5 ? 'I\'m willing to accept substantial consequences' :
                                                            'Standard Narrative Risk'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Operational Objectives */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Operational Objectives
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {['Information', 'Want Help Being Added to a Plot', 'Want Help Adding Players to a Plot I\'m In', 'A Plot I\'m In Has Hit a Dead End'].map((label) => (
                                        <button
                                            key={label}
                                            onClick={() => {
                                                const next = plotOptIn.objectives.includes(label) ? plotOptIn.objectives.filter(l => l !== label) : [...plotOptIn.objectives, label];
                                                setPlotOptIn({ ...plotOptIn, objectives: next });
                                            }}
                                            className={`flex items-center gap-4 p-4 border text-left transition-all ${plotOptIn.objectives.includes(label) ? 'border-red-900/50 bg-red-950/5 text-red-500' : 'border-zinc-900 text-zinc-500 hover:border-zinc-800'
                                                }`}
                                        >
                                            <div className={`h-1.5 w-1.5 rounded-full ${plotOptIn.objectives.includes(label) ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-zinc-800'}`} />
                                            <span className="text-[10px] uppercase tracking-widest">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Narrative Integration */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className={`${cinzel.className} text-xl tracking-widest text-red-700`}>
                                    Narrative Integration
                                </h3>
                                <div className="h-[1px] flex-grow bg-zinc-900/50"></div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest">
                                        Provide details related to your plot opt-in selections or any character traits you wish to involve more deeply.
                                    </p>
                                    <textarea
                                        rows={4}
                                        value={plotOptIn.optInDetails}
                                        onChange={(e) => setPlotOptIn({ ...plotOptIn, optInDetails: e.target.value })}
                                        className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                        placeholder="Details regarding your involvement..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] leading-relaxed text-zinc-500 tracking-widest">
                                        Are there specific actions or traits you want to be more involved in plots?
                                    </p>
                                    <textarea
                                        rows={3}
                                        value={plotOptIn.involvementNotes}
                                        onChange={(e) => setPlotOptIn({ ...plotOptIn, involvementNotes: e.target.value })}
                                        className="w-full bg-transparent border border-zinc-900 p-6 text-[14px] tracking-wide leading-relaxed text-zinc-300 focus:outline-none focus:border-red-900/40 transition-all"
                                        placeholder="Specific traits or action focus..."
                                    />
                                </div>

                                {/* Troublemaker Flag */}
                                <button
                                    onClick={() => setPlotOptIn({ ...plotOptIn, hasTroublemaker: !plotOptIn.hasTroublemaker })}
                                    className={`w-full flex items-center gap-4 px-6 py-4 border transition-all ${plotOptIn.hasTroublemaker ? 'border-red-900/50 bg-red-950/5 text-red-500 shadow-[0_0_15px_rgba(153,27,27,0.1)]' : 'border-zinc-900 text-zinc-600 hover:border-zinc-800'
                                        }`}
                                >
                                    <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${plotOptIn.hasTroublemaker ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-zinc-800'
                                        }`} />
                                    <span className="text-[10px] uppercase tracking-widest text-left">
                                        Character possesses the "Troublemaker" flaw
                                    </span>
                                </button>
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FIXED NAVIGATION FLOOR */}
            <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col items-center gap-8 font-geist">
                <div className="flex items-center gap-10">

                    {/* Back Arrow - Minimalist & Elegant */}
                    <button
                        type="button"
                        onClick={() => {
                            if (currentPage > 1) {
                                setDirection(-1);
                                setCurrentPage(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 1}
                        className={`group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] transition-all ${currentPage === 1 ? 'opacity-0 pointer-events-none' : 'text-zinc-600 hover:text-red-600'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Vitae Droplet Indicators */}
                    <div className="flex items-center gap-6">
                        {[1, 2, 3].map((dot) => (
                            <button
                                key={dot}
                                type="button"
                                onClick={() => {
                                    setDirection(dot > currentPage ? 1 : -1);
                                    setCurrentPage(dot);
                                }}
                                className="relative flex items-center justify-center"
                            >
                                {/* The Outer Glow / Aura */}
                                {currentPage === dot && (
                                    <motion.div
                                        layoutId="vitae-glow"
                                        className="absolute inset-0 w-8 h-8 bg-red-900/20 blur-xl rounded-full"
                                    />
                                )}

                                {/* The Droplet */}
                                <motion.div
                                    animate={{
                                        scale: currentPage === dot ? 1.2 : 1,
                                        backgroundColor: currentPage === dot ? "#b91c1c" : "#18181b", // red-700 to zinc-900
                                    }}
                                    className={`h-3 w-3 rounded-full border transition-colors duration-700 ${currentPage === dot
                                        ? 'border-red-500 shadow-[0_0_15px_rgba(185,28,28,0.6)]'
                                        : 'border-zinc-800'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Next/Transmit Button */}
                    {currentPage < 3 ? (
                        <button
                            type="button"
                            onClick={() => {
                                setDirection(1);
                                setCurrentPage(currentPage + 1);
                            }}
                            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-zinc-600 hover:text-red-600 transition-all"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleTransmit}
                            disabled={isSubmitting}
                            className={`${cinzel.className} bg-red-950/10 border border-red-900/50 px-8 py-2 text-red-700 text-[11px] tracking-[0.2em] font-bold hover:bg-red-700 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(153,27,27,0.1)] disabled:opacity-50 disabled:cursor-wait`}
                        >
                            {isSubmitting ? "Saving..." : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}