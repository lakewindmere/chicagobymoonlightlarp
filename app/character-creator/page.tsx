'use client';

import { Cinzel } from 'next/font/google';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AttributeDots from './attributeDots';
import LZString from 'lz-string';
import { createClient } from '@supabase/supabase-js';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });

const deserialize = (str: string) => {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(str);
        return decompressed ? JSON.parse(decompressed) : null;
    } catch (e) {
        console.error("Deserialization failed:", e);
        return null;
    }
};

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CharacterCreator() {

    const syncToSupabase = async (fullState: any) => {
        const { error } = await supabase
            .from('character_registry')
            .upsert({
                unique_id: uniqueId, // Use the ID stored in state
                player_email: oocData.playerEmail,
                character_name: identity.name,
                character_data: fullState,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'unique_id' // This ensures we update instead of creating duplicates
            });

        if (error) {
            console.error('Supabase Sync Error:', error.message);
        }
    };

    const searchParams = useSearchParams();
    const router = useRouter();

    const [isFinalized, setIsFinalized] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    const saveCharacterToFile = () => {
        const fullState = {
            uid: uniqueId,
            ooc: oocData,
            id: identity,
            at: attrs,
            bp: bloodPotency,
            sk: skills,
            ds: disciplineSlots,
            me: merits,
            fl: flaws,
            bg: backgrounds,
            ad: advantages,
            xp: xp,
            timestamp: new Date().toISOString()
        };

        // Create a blob and a download link
        const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Naming the file based on the character/player name
        const fileName = `Dossier_${oocData.playerName || 'Unknown'}.json`.replace(/\s+/g, '_');

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    useEffect(() => {
        const dataParam = searchParams.get('data');
        console.log(dataParam);
        if (dataParam) {
            const savedState = deserialize(dataParam);
            if (savedState) {
                if (savedState.uid) setUniqueId(savedState.uid);
                if (savedState.id) setIdentity(savedState.id);
                if (savedState.ooc) setOocData(savedState.ooc);
                if (savedState.at) setAttrs(savedState.at);
                if (savedState.bp) setBloodPotency(savedState.bp);
                if (savedState.sk) setSkills(savedState.sk);
                if (savedState.ds) setDisciplineSlots(savedState.ds);
                if (savedState.me) setMerits(savedState.me);
                if (savedState.fl) setFlaws(savedState.fl);
                if (savedState.bg) setBackgrounds(savedState.bg);
                if (savedState.ad) setAdvantages(savedState.ad);
                if (savedState.xp) setXp(savedState.xp);
            }
        }
    }, [searchParams]);

    const handleFinalize = async () => {
        const fullState = {
            uid: uniqueId,
            id: identity,
            ooc: oocData,
            bp: bloodPotency,
            at: attrs,
            sk: skills,
            ds: disciplineSlots,
            me: merits,
            fl: flaws,
            bg: backgrounds,
            ad: advantages,
            xp: xp
        };

        await syncToSupabase(fullState);

        const jsonString = JSON.stringify(fullState);
        const compressed = LZString.compressToEncodedURIComponent(jsonString);
        const newUrl = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
        setShareUrl(newUrl);
        setIsFinalized(true);
        window.scrollTo(0, 0);
    };

    const [loadStatus, setLoadStatus] = useState<'idle' | 'success'>('idle');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    const loadCharacterFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const savedState = JSON.parse(event.target?.result as string);

                // Map everything back to state
                if (savedState.uid) setUniqueId(savedState.uid);
                if (savedState.at) setAttrs(savedState.at);
                if (savedState.id) setIdentity(savedState.id);
                if (savedState.bp) setBloodPotency(savedState.bp);
                if (savedState.sk) setSkills(savedState.sk);
                if (savedState.ooc) setOocData(savedState.ooc);
                if (savedState.ds) setDisciplineSlots(savedState.ds);
                if (savedState.me) setMerits(savedState.me);
                if (savedState.fl) setFlaws(savedState.fl);
                if (savedState.bg) setBackgrounds(savedState.bg);
                if (savedState.ad) setAdvantages(savedState.ad);
                if (savedState.xp) setXp(savedState.xp);

                setLoadStatus('success');
                setTimeout(() => setLoadStatus('idle'), 3000);
            } catch (err) {
                console.error("Error parsing character file:", err);
                alert("Invalid character file. Please ensure it is a proper .json Ledger file.");
            }
        };
        reader.readAsText(file);
    };

    const [identity, setIdentity] = useState({
        name: '',
        clan: '',
        generation: '',
        predatorType: '',
        huntingPool: '',
        compulsion: '',
        clanBane: '',
        baneSeverity: 0, // Usually 0-5 dots
    });

    const updateIdentity = (field: string, value: string | number) => {
        setIdentity(prev => ({ ...prev, [field]: value }));
    };

    const [attrs, setAttrs] = useState({
        strength: 1, dexterity: 1, stamina: 1,
        charisma: 1, manipulation: 1, composure: 1,
        intelligence: 1, wits: 1, resolve: 1
    });

    const updateAttr = (name: string, val: number) => {
        setAttrs(prev => ({ ...prev, [name]: val }));
    };

    const [bloodPotency, setBloodPotency] = useState(0);

    // Inside CharacterCreator component
    const [skills, setSkills] = useState({
        // Physical Skills
        athletics: 0, brawl: 0, crafts: 0,
        drive: 0, marksmanship: 0, melee: 0,
        larceny: 0, stealth: 0, survival: 0,
        // Social Skills
        animalKen: 0, etiquette: 0, insight: 0,
        intimidation: 0, leadership: 0, performance: 0,
        persuasion: 0, streetwise: 0, subterfuge: 0,
        // Mental Skills 
        academics: 0, awareness: 0, finance: 0,
        investigation: 0, medicine: 0, occult: 0,
        politics: 0, science: 0, technology: 0
    });

    const updateSkill = (name: string, val: number) => {
        setSkills(prev => ({ ...prev, [name]: val }));
    };

    const updatePowerName = (slotIndex: number, levelIndex: number, name: string) => {
        const newSlots = [...disciplineSlots];
        newSlots[slotIndex].powers[levelIndex] = name;
        setDisciplineSlots(newSlots);
    };

    const [disciplineSlots, setDisciplineSlots] = useState(
        Array(6).fill(null).map(() => ({
            type: '',
            value: 0, // Track the dots (0-5)
            powers: ['', '', '', '', '']
        }))
    );

    const updateDisciplineType = (slotIndex: number, type: string) => {
        setDisciplineSlots(prev => prev.map((slot, i) =>
            i === slotIndex ? { ...slot, type } : slot
        ));
    };

    const updateDisciplineValue = (slotIndex: number, value: number) => {
        setDisciplineSlots(prev => prev.map((slot, i) =>
            i === slotIndex ? { ...slot, value } : slot
        ));
    };

    const disciplineOptions = [
        "Animalism", "Auspex", "Blood Sorcery", "Celerity", "Dominate",
        "Fortitude", "Obfuscate", "Oblivion", "Potence", "Presence",
        "Protean", "Thin-Blood Alchemy"
    ];

    const [humanity, setHumanity] = useState(7);
    const healthMax = attrs.stamina + 3; // Health = Stamina + 3
    const willpowerMax = attrs.resolve + attrs.composure; // Willpower = Resolve + Composure

    const [backgrounds, setBackgrounds] = useState(
        Array(13).fill(null).map(() => ({ name: '', dots: 0 }))
    );

    const [advantages, setAdvantages] = useState(
        Array(13).fill(null).map(() => ({ name: '', dots: 0 }))
    );

    const updateBackground = (index: number, field: 'name' | 'dots', value: string | number) => {
        const newItems = [...backgrounds];
        (newItems[index] as any)[field] = value;
        setBackgrounds(newItems);
    };

    const updateAdvantage = (index: number, field: 'name' | 'dots', value: string | number) => {
        const newItems = [...advantages];
        (newItems[index] as any)[field] = value;
        setAdvantages(newItems);
    };

    // Inside CharacterCreator component
    const [merits, setMerits] = useState(
        Array(13).fill(null).map(() => ({ name: '', dots: 0 }))
    );

    const [flaws, setFlaws] = useState(
        Array(13).fill(null).map(() => ({ name: '', dots: 0 }))
    );

    const updateMerit = (index: number, field: 'name' | 'dots', value: string | number) => {
        setMerits(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const updateFlaw = (index: number, field: 'name' | 'dots', value: string | number) => {
        setFlaws(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const [xp, setXp] = useState({
        total: 65,
        spent: 60
    });

    const unspentXp = xp.total - xp.spent;

    const [uniqueId, setUniqueId] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            // If we don't have an ID from a loaded file or URL, create one
            if (!uniqueId) {
                setUniqueId(crypto.randomUUID());
            }
        }
    }, [isMounted]);

    const handleReset = () => {
        if (!isMounted) return;
        if (window.confirm("Strike this record?")) {
            window.location.href = window.location.pathname; // A cleaner "soft" refresh
        }
    };

    const [oocData, setOocData] = useState({
        playerName: '',
        playerEmail: ''
    });

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    if (isFinalized) {
        return (
            <main className="min-h-screen bg-black text-zinc-400 p-4 md:p-12 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-zinc-950 border border-red-900/50 p-8 rounded-sm shadow-[0_0_50px_rgba(153,27,27,0.2)] text-center">

                    {/* Header */}
                    <h1 className={`${cinzel.className} text-3xl font-black uppercase tracking-[0.2em] text-red-700 mb-2`}>
                        Dossier <span className="text-zinc-100 font-light">Compiled</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-8 border-b border-zinc-900 pb-4">
                        Chicago Registry // {oocData.playerName || "Unknown Subject"}
                    </p>

                    {/* Visual Dossier Icon/Placeholder */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-32 border-2 border-zinc-800 relative flex items-center justify-center group bg-black">
                            <div className="absolute inset-2 border border-zinc-900"></div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-red-900/40 group-hover:text-red-700 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className={`${cinzel.className} text-[11px] text-zinc-500 leading-relaxed uppercase tracking-widest`}>
                            Your digital record is ready. Download the <span className="text-zinc-200">Dossier</span> file to your device. Please hold to this record for submitting your Down Time Actions and referencing In-Game.
                        </p>

                        <div className="pt-6 flex flex-col gap-3">
                            {/* Primary Action: Download */}
                            <button
                                onClick={saveCharacterToFile}
                                className="bg-red-950/20 border border-red-700 py-4 text-red-700 uppercase tracking-[0.3em] text-xs font-bold hover:bg-red-700 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(153,27,27,0.2)]"
                            >
                                Download Dossier
                            </button>

                            {/* Secondary Actions */}
                            <div className="flex justify-between items-center mt-2 px-1">
                                <button
                                    onClick={() => setIsFinalized(false)}
                                    className="text-[9px] uppercase tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors italic"
                                >
                                    ← Return to Editor
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="text-[9px] uppercase tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors italic"
                                >
                                    {copied ? "Link Copied" : "Copy Backup URL"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-[9px] text-zinc-800 uppercase tracking-widest">
                    Registry ID: {btoa(oocData.playerEmail || "anon").substring(0, 8)}
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-zinc-400 p-4 md:p-12">
            <div className="max-w-5xl mx-auto">

                {/* Main Page Header */}
                <header className="mb-10 border-b border-red-900/30 pb-6">
                    <h1 className={`${cinzel.className} text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-red-700 leading-none`}>
                        The <span className="text-zinc-100">Dossier</span>
                    </h1>
                    <p className="mt-2 text-zinc-600 italic tracking-[0.2em] uppercase text-[10px]">
                        Chicago Camarilla Census Record // Identity & Blood
                    </p>

                    <div className="flex flex-col items-end">
                        <div className="flex gap-2">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                id="file-load"
                                accept="image/*"
                                className="hidden"
                                onChange={loadCharacterFromFile}
                            />

                            {/* Load Button */}
                            <button
                                type="button"
                                onClick={() => document.getElementById('file-load')?.click()}
                                className={`uppercase tracking-[0.3em] text-[9px] transition-all duration-300 py-1 px-3 border flex items-center gap-2 ${loadStatus === 'success'
                                    ? 'bg-green-950/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                    : 'text-zinc-500 border-zinc-900 hover:border-zinc-700 bg-zinc-950/50'
                                    }`}
                            >
                                {loadStatus === 'success' ? '● Loaded' : 'Load Dossier'}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-zinc-500 hover:text-red-700 uppercase tracking-[0.3em] text-[9px] transition-colors duration-300 py-1 px-3 border border-zinc-900 hover:border-red-900/50 bg-zinc-950/50"
                            >
                                Reset Form
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mb-12 border-l-2 border-red-700/50 pl-6 py-1 max-w-3xl">
                    <p className={`text-xs md:text-sm leading-relaxed text-zinc-300 tracking-wide`}>
                        This ledger is provided as a tool for personal record-keeping and tracking your character's evolution.
                        Please note that submitting this form <span className="text-red-700 font-bold">does not officially verify</span> your stats or mechanical accuracy.
                    </p>
                    <p className={`text-xs md:text-sm leading-relaxed text-zinc-500 tracking-wide mt-2`}>
                        If you have questions regarding character creation or need assistance with the rules,
                        our <span className="text-zinc-300 italic">Storytellers</span> are available to help in the community Discord.
                    </p>
                </div>

                <form className="space-y-12">
                    <section className="bg-zinc-900/10 border border-zinc-800/40 p-4 md:p-6 rounded-sm mb-12 relative overflow-hidden">
                        {/* Subtle background label for OOC */}
                        <div className="absolute top-2 right-4 pointer-events-none opacity-5">
                            <span className={`${cinzel.className} text-4xl font-black uppercase tracking-tighter text-zinc-500`}>OOC</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="group flex flex-col">
                                <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 group-focus-within:text-zinc-200 transition-colors mb-2 italic">
                                    Player Name (Out of Character)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    value={oocData.playerName}
                                    onChange={(e) => setOocData({ ...oocData, playerName: e.target.value })}
                                    className="bg-transparent border-b border-zinc-800 text-zinc-200 text-sm py-1 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-900"
                                    required
                                />
                            </div>

                            <div className="group flex flex-col">
                                <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 group-focus-within:text-zinc-200 transition-colors mb-2 italic">
                                    Registry Email (Links to Tickets)
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={oocData.playerEmail}
                                    onChange={(e) => setOocData({ ...oocData, playerEmail: e.target.value })}
                                    className="bg-transparent border-b border-zinc-800 text-zinc-200 text-sm py-1 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-900"
                                    required
                                />
                            </div>
                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                            {/* Full Name */}
                            <div className="md:col-span-2 group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Character Name</label>
                                <input
                                    type="text"
                                    value={identity.name}
                                    onChange={(e) => updateIdentity('name', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                            {/* Clan Selection */}
                            <div className="group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Clan</label>
                                <input
                                    type="text"
                                    value={identity.clan}
                                    onChange={(e) => updateIdentity('clan', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors placeholder:text-zinc-900"
                                />
                            </div>

                            {/* Generation */}
                            <div className="group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Generation</label>
                                <input
                                    type="text"
                                    value={identity.generation}
                                    onChange={(e) => updateIdentity('generation', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                            {/* Predator Type */}
                            <div className="md:col-span-2 group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Predator Type</label>
                                <input
                                    type="text"
                                    value={identity.predatorType}
                                    onChange={(e) => updateIdentity('predatorType', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                            {/* Hunting Pool */}
                            <div className="md:col-span-2 group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Hunting Pool</label>
                                <input
                                    type="text"
                                    value={identity.huntingPool}
                                    onChange={(e) => updateIdentity('huntingPool', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                            {/* Clan Bane */}
                            <div className="md:col-span-2 group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Clan Bane</label>
                                <input
                                    type="text"
                                    value={identity.clanBane}
                                    onChange={(e) => updateIdentity('clanBane', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                            {/* Bane Severity (Dots) */}
                            <div className="group flex flex-col justify-end">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-2">Bane Severity</label>
                                <AttributeDots
                                    value={identity.baneSeverity}
                                    onChange={(val) => updateIdentity('baneSeverity', val)}
                                    max={5}
                                />
                            </div>

                            {/* Compulsion */}
                            <div className="md:col-span-4 group">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-focus-within:text-red-700 transition-colors">Compulsion</label>
                                <input
                                    type="text"
                                    value={identity.compulsion}
                                    onChange={(e) => updateIdentity('compulsion', e.target.value)}
                                    className="w-full bg-transparent border-b border-zinc-900 text-zinc-100 py-1 focus:outline-none focus:border-red-900 transition-colors"
                                />
                            </div>

                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl mt-12">
                        <div className="mb-8">
                            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-red-700 flex items-center`}>
                                <span className="w-8 h-[1px] bg-red-700 mr-4"></span>
                                Attributes
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 pb-12 border-b border-zinc-900/50">

                            {/* Health (Calculated)  */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 italic">Health (Stamina + 3)</label>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl font-mono font-bold text-zinc-100 drop-shadow-[0_0_10px_rgba(185,28,28,0.4)]">
                                        {healthMax}
                                    </span>
                                    <div className="flex space-x-1 opacity-50">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className={`w-2 h-4 border ${i < healthMax ? 'bg-zinc-100/20 border-zinc-500' : 'border-zinc-800'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Willpower (Calculated) [cite: 73] */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 italic">Willpower (Res + Com)</label>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl font-mono font-bold text-zinc-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                        {willpowerMax}
                                    </span>
                                    <div className="flex space-x-1 opacity-50">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className={`w-2 h-4 border ${i < willpowerMax ? 'bg-zinc-100/20 border-zinc-500' : 'border-zinc-800'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Humanity (Editable)  */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Humanity</label>
                                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-zinc-900">
                                    <AttributeDots
                                        value={humanity}
                                        onChange={(val) => setHumanity(val)}
                                        max={10}
                                    />
                                    <span className="text-xs font-mono text-zinc-500 ml-4">{humanity}/10</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Physical Section [cite: 17] */}
                            <div className="space-y-4">
                                <h3 className={`${cinzel.className} text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4`}>Physical</h3>
                                {[
                                    { id: 'strength', label: 'Strength' },
                                    { id: 'dexterity', label: 'Dexterity' },
                                    { id: 'stamina', label: 'Stamina' }
                                ].map(attr => (
                                    <div key={attr.id} className="flex justify-between items-center group">
                                        <label className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{attr.label}</label>
                                        <AttributeDots value={attrs[attr.id as keyof typeof attrs]} onChange={(val) => updateAttr(attr.id, val)} />
                                    </div>
                                ))}
                            </div>

                            {/* Social Section [cite: 19] */}
                            <div className="space-y-4">
                                <h3 className={`${cinzel.className} text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4`}>Social</h3>
                                {[
                                    { id: 'charisma', label: 'Charisma' },
                                    { id: 'manipulation', label: 'Manipulation' },
                                    { id: 'composure', label: 'Composure' }
                                ].map(attr => (
                                    <div key={attr.id} className="flex justify-between items-center group">
                                        <label className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{attr.label}</label>
                                        <AttributeDots value={attrs[attr.id as keyof typeof attrs]} onChange={(val) => updateAttr(attr.id, val)} />
                                    </div>
                                ))}
                            </div>

                            {/* Mental Section [cite: 20] */}
                            <div className="space-y-4">
                                <h3 className={`${cinzel.className} text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4`}>Mental</h3>
                                {[
                                    { id: 'intelligence', label: 'Intelligence' },
                                    { id: 'wits', label: 'Wits' },
                                    { id: 'resolve', label: 'Resolve' }
                                ].map(attr => (
                                    <div key={attr.id} className="flex justify-between items-center group">
                                        <label className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{attr.label}</label>
                                        <AttributeDots value={attrs[attr.id as keyof typeof attrs]} onChange={(val) => updateAttr(attr.id, val)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl mt-12">
                        <div className="col-span-12 mb-8">
                            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-red-700 flex items-center`}>
                                <span className="w-8 h-[1px] bg-red-700 mr-4"></span>
                                Skills
                            </h2>
                            <div className="h-[1px] w-full bg-gradient-to-r from-red-900/50 to-transparent mt-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Physical Skills [cite: 17, 21] */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4">Physical</h3>
                                {[
                                    { id: 'athletics', label: 'Athletics' }, { id: 'brawl', label: 'Brawl' },
                                    { id: 'crafts', label: 'Crafts' }, { id: 'drive', label: 'Drive' },
                                    { id: 'firearms', label: 'Firearms' }, { id: 'Larceny', label: 'Larceny' },
                                    { id: 'melee', label: 'Melee' }, { id: 'stealth', label: 'Stealth' },
                                    { id: 'survival', label: 'Survival' }
                                ].map(skill => (
                                    <div key={skill.id} className="flex justify-between items-center group">
                                        <label className="text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{skill.label}</label>
                                        <AttributeDots value={skills[skill.id as keyof typeof skills]} onChange={(val) => updateSkill(skill.id, val)} />
                                    </div>
                                ))}
                            </div>

                            {/* Social Skills [cite: 19, 21] */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4">Social</h3>
                                {[
                                    { id: 'animalKen', label: 'Animal Ken' }, { id: 'etiquette', label: 'Etiquette' },
                                    { id: 'insight', label: 'Insight' }, { id: 'intimidation', label: 'Intimidation' },
                                    { id: 'leadership', label: 'Leadership' }, { id: 'performance', label: 'Performance' },
                                    { id: 'persuasion', label: 'Persuasion' }, { id: 'streetwise', label: 'Streetwise' },
                                    { id: 'subterfuge', label: 'Subterfuge' }
                                ].map(skill => (
                                    <div key={skill.id} className="flex justify-between items-center group">
                                        <label className="text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{skill.label}</label>
                                        <AttributeDots value={skills[skill.id as keyof typeof skills]} onChange={(val) => updateSkill(skill.id, val)} />
                                    </div>
                                ))}
                            </div>

                            {/* Mental Skills [cite: 20, 21] */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase border-b border-zinc-900 pb-2 mb-4">Mental</h3>
                                {[
                                    { id: 'academics', label: 'Academics' }, { id: 'awareness', label: 'Awareness' },
                                    { id: 'finance', label: 'Finance' }, { id: 'investigation', label: 'Investigation' },
                                    { id: 'medicine', label: 'Medicine' }, { id: 'occult', label: 'Occult' },
                                    { id: 'politics', label: 'Politics' }, { id: 'science', label: 'Science' },
                                    { id: 'technology', label: 'Technology' }
                                ].map(skill => (
                                    <div key={skill.id} className="flex justify-between items-center group">
                                        <label className="text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100 transition-colors">{skill.label}</label>
                                        <AttributeDots value={skills[skill.id as keyof typeof skills]} onChange={(val) => updateSkill(skill.id, val)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl mt-12">
                        <div className="col-span-12 mb-8">
                            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-red-700 flex items-center`}>
                                <span className="w-8 h-[1px] bg-red-700 mr-4"></span>
                                Disciplines
                            </h2>
                            <div className="h-[1px] w-full bg-gradient-to-r from-red-900/50 to-transparent mt-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {disciplineSlots.map((slot, slotIdx) => {
                                // Waterfall Logic: Slot is locked if it's not the first slot 
                                // AND the slot before it has no Discipline Type selected.
                                const isSlotLocked = slotIdx > 0 && disciplineSlots[slotIdx - 1].type === "";

                                return (
                                    <div
                                        key={slotIdx}
                                        className={`space-y-6 p-5 border border-zinc-900/50 bg-black/40 rounded-sm relative transition-all duration-500 ${isSlotLocked ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'
                                            }`}
                                    >

                                        {/* Header: Dropdown + Dots */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                                                    Discipline Type
                                                </label>
                                                <AttributeDots
                                                    value={slot.value}
                                                    onChange={(val) => updateDisciplineValue(slotIdx, val)}
                                                />
                                            </div>

                                            <select
                                                value={slot.type}
                                                disabled={isSlotLocked}
                                                onChange={(e) => updateDisciplineType(slotIdx, e.target.value)}
                                                className="w-full bg-transparent border-b border-zinc-800 text-zinc-100 text-xs py-1 focus:outline-none focus:border-red-700 transition-colors appearance-none cursor-pointer uppercase tracking-widest"
                                            >
                                                <option className="bg-zinc-950" value="">Unknown / None</option>
                                                {disciplineOptions.map(opt => (
                                                    <option key={opt} className="bg-zinc-950" value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Leveled Powers (Level logic + Waterfall logic) */}
                                        <div className="space-y-4 pt-2">
                                            {slot.powers.map((power, lvlIdx) => {
                                                // A power input is disabled if the slot itself is locked 
                                                // OR if the dots assigned to this discipline are lower than the level.
                                                const isPowerDisabled = isSlotLocked || (lvlIdx + 1) > slot.value;

                                                return (
                                                    <div
                                                        key={lvlIdx}
                                                        className={`group flex flex-col transition-opacity duration-300 ${isPowerDisabled ? 'opacity-20 grayscale' : 'opacity-100'
                                                            }`}
                                                    >
                                                        <label className={`text-[8px] uppercase tracking-widest mb-1 transition-colors ${isPowerDisabled ? 'text-zinc-800' : 'text-zinc-600 group-focus-within:text-red-700'
                                                            }`}>
                                                            Level {lvlIdx + 1} Power
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder={isPowerDisabled ? "Locked" : "Select Power..."}
                                                            disabled={isPowerDisabled}
                                                            value={isPowerDisabled ? "" : power}
                                                            onChange={(e) => updatePowerName(slotIdx, lvlIdx, e.target.value)}
                                                            className="bg-transparent border-b border-zinc-900 text-zinc-300 text-[11px] py-1 focus:outline-none focus:border-red-800 transition-colors placeholder:text-zinc-900 disabled:cursor-not-allowed"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl mt-12">
                        {/* Section Header */}
                        <div className="col-span-12 mb-8">
                            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-red-700 flex items-center`}>
                                <span className="w-8 h-[1px] bg-red-700 mr-4"></span>
                                Backgrounds & Advantages
                            </h2>
                            <div className="h-[1px] w-full bg-gradient-to-r from-red-900/50 to-transparent mt-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">

                            {/* Left Column: Backgrounds [cite: 92] */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mb-4 pl-1 italic">Backgrounds</h3>
                                {backgrounds.map((item, idx) => {
                                    // Waterfall logic: Enable first row or if row above has text [cite: 92]
                                    const isLocked = idx > 0 && backgrounds[idx - 1].name.trim() === "";

                                    return (
                                        <div
                                            key={`bg-${idx}`}
                                            className={`flex items-center space-x-4 group border-b border-zinc-900/30 pb-1 transition-all duration-500 ${isLocked ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'
                                                }`}
                                        >
                                            <span className="text-[9px] font-mono text-zinc-800 w-4">{idx + 1}</span>
                                            <input
                                                type="text"
                                                placeholder={isLocked ? "" : "Identify Background..."}
                                                value={item.name}
                                                disabled={isLocked}
                                                onChange={(e) => updateBackground(idx, 'name', e.target.value)}
                                                className="flex-1 bg-transparent text-zinc-300 text-[11px] py-1 focus:outline-none focus:border-red-900 transition-colors placeholder:text-zinc-900 disabled:cursor-not-allowed"
                                            />
                                            <AttributeDots
                                                value={item.dots}
                                                onChange={(val) => updateBackground(idx, 'dots', val)}
                                                max={3}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column: Advantages / Disadvantages [cite: 93, 140, 141] */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mb-4 pl-1 italic">Advantages & Disadvantages</h3>
                                {advantages.map((item, idx) => {
                                    // Waterfall logic: Enable first row or if row above has text 
                                    const isLocked = idx > 0 && advantages[idx - 1].name.trim() === "";

                                    return (
                                        <div
                                            key={`adv-${idx}`}
                                            className={`flex items-center space-x-4 group border-b border-zinc-900/30 pb-1 transition-all duration-500 ${isLocked ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'
                                                }`}
                                        >
                                            <span className="text-[9px] font-mono text-zinc-800 w-4">{idx + 1}</span>
                                            <input
                                                type="text"
                                                placeholder={isLocked ? "" : "Identify Advantage/Flaw..."}
                                                value={item.name}
                                                disabled={isLocked}
                                                onChange={(e) => updateAdvantage(idx, 'name', e.target.value)}
                                                className="flex-1 bg-transparent text-zinc-300 text-[11px] py-1 focus:outline-none focus:border-red-900 transition-colors placeholder:text-zinc-900 disabled:cursor-not-allowed"
                                            />
                                            <AttributeDots
                                                value={item.dots}
                                                onChange={(val) => updateAdvantage(idx, 'dots', val)}
                                                max={3}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </section>
                    <section className="bg-zinc-950/20 border border-zinc-900 p-4 md:p-8 rounded-sm shadow-2xl mt-12">
                        {/* Section Header */}
                        <div className="col-span-12 mb-8">
                            <h2 className={`${cinzel.className} text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-red-700 flex items-center`}>
                                <span className="w-8 h-px bg-red-700 mr-4"></span>
                                Merits & Flaws
                            </h2>
                            <div className="h-px w-full bg-gradient-to-r from-red-900/50 to-transparent mt-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">

                            {/* Left Column: Merits */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mb-4 pl-1 italic font-bold">Merits</h3>
                                {merits.map((item, idx) => {
                                    const isLocked = idx > 0 && merits[idx - 1].name.trim() === "";

                                    return (
                                        <div
                                            key={`merit-${idx}`}
                                            className={`flex items-center space-x-4 group border-b border-zinc-900/30 pb-1 transition-all duration-500 ${isLocked ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'
                                                }`}
                                        >
                                            <span className="text-[9px] font-mono text-zinc-800 w-4">{idx + 1}</span>
                                            <input
                                                type="text"
                                                placeholder={isLocked ? "" : "Define Merit..."}
                                                value={item.name}
                                                disabled={isLocked}
                                                onChange={(e) => updateMerit(idx, 'name', e.target.value)}
                                                className="flex-1 bg-transparent text-zinc-300 text-[11px] py-1 focus:outline-none focus:border-red-900 transition-colors placeholder:text-zinc-900 disabled:cursor-not-allowed"
                                            />
                                            <AttributeDots
                                                value={item.dots}
                                                onChange={(val) => updateMerit(idx, 'dots', val)}
                                                max={5}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column: Flaws */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mb-4 pl-1 italic font-bold text-red-900">Flaws</h3>
                                {flaws.map((item, idx) => {
                                    const isLocked = idx > 0 && flaws[idx - 1].name.trim() === "";

                                    return (
                                        <div
                                            key={`flaw-${idx}`}
                                            className={`flex items-center space-x-4 group border-b border-zinc-900/30 pb-1 transition-all duration-500 ${isLocked ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'
                                                }`}
                                        >
                                            <span className="text-[9px] font-mono text-zinc-800 w-4">{idx + 1}</span>
                                            <input
                                                type="text"
                                                placeholder={isLocked ? "" : "Define Flaw..."}
                                                value={item.name}
                                                disabled={isLocked}
                                                onChange={(e) => updateFlaw(idx, 'name', e.target.value)}
                                                className="flex-1 bg-transparent text-zinc-300 text-[11px] py-1 focus:outline-none focus:border-red-900 transition-colors placeholder:text-zinc-900 disabled:cursor-not-allowed"
                                            />
                                            <AttributeDots
                                                value={item.dots}
                                                onChange={(val) => updateFlaw(idx, 'dots', val)}
                                                max={5}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </section>
                    <section className="bg-zinc-950/40 border border-red-900/20 p-6 md:p-8 rounded-sm shadow-2xl mt-16 border-t-2">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                            {/* Section Branding */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 border border-red-700 flex items-center justify-center rotate-45 group">
                                    <span className={`${cinzel.className} -rotate-45 text-red-700 font-bold group-hover:scale-110 transition-transform`}>XP</span>
                                </div>
                                <div>
                                    <h2 className={`${cinzel.className} text-lg font-bold uppercase tracking-[0.2em] text-zinc-100`}>
                                        Experience Ledger
                                    </h2>
                                </div>
                            </div>

                            {/* XP Controls */}
                            <div className="flex flex-wrap items-center justify-center gap-12">

                                {/* Total XP [cite: 164-166] */}
                                <div className="flex flex-col items-center group">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2 group-focus-within:text-red-700 transition-colors">Total XP</label>
                                    <input
                                        type="number"
                                        value={xp.total}
                                        onChange={(e) => setXp({ ...xp, total: parseInt(e.target.value) || 0 })}
                                        className="bg-transparent border-b border-zinc-800 text-zinc-100 text-2xl font-mono text-center w-20 focus:outline-none focus:border-red-700 transition-colors"
                                    />
                                </div>

                                {/* Spent XP [cite: 167-168] */}
                                <div className="flex flex-col items-center group">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2 group-focus-within:text-red-700 transition-colors">Spent XP</label>
                                    <input
                                        type="number"
                                        value={xp.spent}
                                        onChange={(e) => setXp({ ...xp, spent: parseInt(e.target.value) || 0 })}
                                        className="bg-transparent border-b border-zinc-800 text-zinc-100 text-2xl font-mono text-center w-20 focus:outline-none focus:border-red-700 transition-colors"
                                    />
                                </div>

                                {/* Unspent (Calculated) */}
                                <div className="flex flex-col items-center border-l border-zinc-900 pl-12">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-red-900 mb-2">Available</label>
                                    <div className="text-3xl font-mono font-black text-red-700 drop-shadow-[0_0_15px_rgba(185,28,28,0.4)]">
                                        {unspentXp}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Submit / Reset Ledger (Optional) */}
                    <div className="mt-12 flex justify-end space-x-6">
                        <button
                            type="button"
                            onClick={handleFinalize}
                            className="bg-red-950/20 border border-red-700 px-8 py-2 text-red-700 uppercase tracking-[0.3em] font-bold text-sm hover:bg-red-700 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(153,27,27,0.2)]"
                        >
                            Finalize Record
                        </button>
                    </div>
                </form>
            </div >
        </main >
    );
}