import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Bengali, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-bengali",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "KhataVoice | Voice Ledger, Inventory & Credit Recovery for Kiranas",
  description:
    "AI-powered multilingual voice ledger, atomic inventory sync, and credit trust scoring platform for India's neighborhood retail merchants.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF7700",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${notoSansBengali.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="font-sans min-h-screen bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
