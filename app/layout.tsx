import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Navbar } from "./components/navbar";
import "./globals.css";
import { CartProvider, useCart } from "./context/CartContext";
import { Footer } from "./components/footer";
import { Cinzel_Decorative } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzelDecorative = Cinzel_Decorative({
  weight: '700', // This is the "Bold" weight
  subsets: ['latin'],
  variable: '--font-cinzel-decorative', // Defining a CSS variable
});

export const metadata: Metadata = {
  title: "Chicago In Moonlight",
  description: "A World of Darkness LARP Experience",
  icons: {
    icon: '/favicon.ico', // or '/icon.png' if you renamed it
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-black pb-20">
        <CartProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}