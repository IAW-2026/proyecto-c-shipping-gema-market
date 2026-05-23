import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";

import { inter, jetbrainsMono } from "./lib/fonts";
import { SideNav } from "./components/layout/SideNav";
import { BottomNav } from "./components/layout/BottomNav";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "UniHousing — Tu mudanza simplificada",
  description: "Marketplace de muebles y deco para estudiantes de la UNS.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UniHousing",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      >
        <body className="min-h-full bg-cream text-ink font-sans">
          {/* Desktop sidebar */}
          <Suspense fallback={<aside className="hidden lgx:block lgx:fixed lgx:left-0 lgx:top-0 lgx:bottom-0 lgx:w-60 lgx:bg-paper lgx:border-r lgx:border-line" />}>
            <SideNav />
          </Suspense>

          {/* Page content — layout adjusted based on nav presence */}
          <main className="lgx:pb-0 lgx:[aside+&]:ml-60 [&:has(+nav)]:pb-16">
            {children}
          </main>

          {/* Mobile bottom navigation */}
          <Suspense fallback={<nav className="fixed bottom-0 left-0 right-0 h-16 bg-paper border-t border-line lgx:hidden" />}>
            <BottomNav />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
