import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import "./globals.css";

const barlow = localFont({
  src: [
    { path: "../fonts/BarlowCondensed-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/BarlowCondensed-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

const geist = localFont({
  src: "../fonts/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

const description = "PPF en chrome delete. Vraag eenvoudig een offerte aan.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | PPF en chrome delete`,
    template: `%s | ${site.name}`,
  },
  description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: site.name,
    title: `${site.name} | PPF en chrome delete`,
    description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" data-scroll-behavior="smooth" className={`${barlow.variable} ${geist.variable}`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
