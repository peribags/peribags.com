import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { AOSProvider } from "@/components/storefront/aos-provider";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { MaintenanceScreen } from "@/components/storefront/maintenance-screen";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export default function StorefrontRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Static maintenance switch — when on, the public site shows a single
  // holding page and no other storefront chrome (header / footer / AOS / FAB).
  if (siteConfig.maintenance.enabled) {
    return (
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full bg-[#FAF7F1] text-zinc-950 font-sans">
          <MaintenanceScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans overflow-x-clip">
        <AOSProvider />
        <StorefrontHeader />
        <main className="flex-1">{children}</main>
        <StorefrontFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
