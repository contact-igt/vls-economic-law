import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const siteUrl = "https://economiclaws.vlslawacademy.com";
const title = "Economic Laws & Practice | VLS Law Academy";
const description = "VLS Law Academy's Economic Laws & Practice programme covering the fundamental economic laws and adjudication-related areas identified in Module 11, including PMLA, Benami Transactions, FEMA and COFEPOSA.";

// viewport-fit=cover lets the sticky dock honour the iOS/Android safe-area insets.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), title, description, alternates: { canonical: "/" },
  openGraph: { title, description, url: siteUrl, siteName: "VLS Law Academy", type: "website", images: ["/assets/vls/brand/vls-logo.png"] },
  twitter: { card: "summary", title, description, images: ["/assets/vls/brand/vls-logo.png"] },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${inter.variable} h-full antialiased`}><body className="min-h-full flex flex-col bg-vls-off-white text-vls-black">{children}<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /></body></html>;
}
