import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Header from "@/components/Header";
import ScrollProgress from "@/components/ScrollProgress";
import Providers from "@/components/Providers";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "magistick — DEJOIY BPO employee portal",
  description: "One portal for every app, update, and support ticket at DEJOIY BPO.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ember focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-paper"
          >
            Skip to main content
          </a>
          <Header />
          <ScrollProgress />
          <main id="main" className="mx-auto w-full max-w-6xl px-5 pb-4 pt-10 sm:px-8">
            {children}
          </main>
          <footer className="mt-24 bg-ink text-stone-400">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs sm:px-8">
              <p>
                <span className="font-display text-sm font-semibold text-paper">magistick</span>
                <span className="mx-2 text-stone-600">·</span>© 2026 DEJOIY India Pvt. Ltd.
              </p>
              <p className="flex gap-4">
                <span className="transition-colors hover:text-paper">Privacy Policy</span>
                <span className="transition-colors hover:text-paper">Terms</span>
                <span className="text-stone-600">Internal use only</span>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
