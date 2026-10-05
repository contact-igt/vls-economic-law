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
  return <html lang="en" className={`${inter.variable} h-full antialiased`}><body className="min-h-full flex flex-col bg-vls-off-white text-vls-black">{children}<Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1320569916265124');fbq('track','PageView');`}</Script><noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1320569916265124&ev=PageView&noscript=1" alt="" /></noscript><Script id="microsoft-clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","ysywurjbm4");`}</Script><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /></body></html>;
}
