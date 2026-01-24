import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Optimisation de la police pour un rendu haut de gamme
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// ✅ Metadata SEO (sans viewport)
export const metadata: Metadata = {
  title: "FRAID | Fullstack Developer & DevOps Enthusiast",
  description:
    "Portfolio professionnel de FRAID - Étudiant en informatique appliquée à la Hochschule Worms",
};

// ✅ Viewport export séparé (Next.js 15 compliant)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617", // slate-950 (bonus pro)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col`}
      >
        {/* Navbar globale */}
        <Navbar />

        {/* grow = flex-grow (recommandé Tailwind) */}
        <main className="grow">
          {children}
        </main>

        {/* Footer global */}
        <Footer />
      </body>
    </html>
  );
}
