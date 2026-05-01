import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chicago In Moonlight",
  description: "A World of Darkness LARP Experience",
};

function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-50 shadow-2xl">
        {/* Primary Banner */}
        <nav className="w-full bg-red-700 py-3 px-6 border-b border-black">
          <div className="max-w-7xl mx-auto flex justify-center">
            <Link 
              href="/" 
              className="text-black font-serif font-black uppercase tracking-[0.25em] text-xl hover:opacity-70 transition-opacity text-center"
            >
              Chicago In Moonlight
            </Link>
          </div>
        </nav>

        {/* Secondary Menu */}
        <nav className="w-full bg-black py-2 px-6 border-b border-zinc-900">
          <div className="max-w-7xl mx-auto flex justify-center space-x-8">
            <Link href="/store" className="text-red-700 font-serif text-sm uppercase tracking-widest hover:text-red-500">Store</Link>
            <Link href="/information" className="text-red-700 font-serif text-sm uppercase tracking-widest hover:text-red-500">Information</Link>
          </div>
        </nav>
      </header>

      {/* NEW: Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-zinc-800 py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Left: Discord Link */}
          <a 
            href="https://discord.gg/azmy2b8Wk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 group"
          >
            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-[#5865F2] transition-colors">
              <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor" className="text-zinc-400 group-hover:text-white">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.06,72.06,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.06,16.15,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.72-27.42-4.59-51.1-19.34-72.14ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
            </div>
            <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-200 transition-colors">
              Join the Camarilla
            </span>
          </a>

          {/* Right: Email Link */}
          <a 
            href="mailto:chicagoinmoonlight@gmail.com" 
            className="group flex items-center space-x-3"
          >
             <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-red-700 transition-colors">
              Send a Missive
            </span>
            <div className="p-2 border border-zinc-800 group-hover:border-red-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-red-700"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
          </a>

        </div>
      </footer>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-black pb-20"> {/* pb-20 added so footer doesn't cover content */}
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}