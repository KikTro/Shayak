import type { Metadata, Viewport } from "next";
import { Inter_Tight, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NoiseOverlay } from "@/components/layout/NoiseOverlay";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Sahayak · Community Intelligence",
    template: "%s · Sahayak",
  },
  description:
    "A multi-agent AI platform that discovers builders, connects them with purpose, and keeps developer communities alive. Built in memory of Kiran Mishra.",
  openGraph: {
    title: "Sahayak · Community Intelligence",
    description:
      "A multi-agent AI platform for developer communities. Built in memory of Kiran Mishra.",
    type: "website",
    siteName: "Sahayak",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahayak · Community Intelligence",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <NoiseOverlay />
        <Navbar />
        <main id="main" className="pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
