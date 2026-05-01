export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-red-700 p-8">
      <h1 className="text-6xl font-bold mb-4 tracking-tighter">THE KINDRED GATHERING</h1>
      <p className="text-xl italic mb-8 text-gray-400">Chicago by Night: A Monthly Masquerade LARP</p>
      <a href="/store" className="px-6 py-3 border border-red-700 hover:bg-red-900 hover:text-white transition">
        Enter the Haven (Store)
      </a>
    </main>
  );
}