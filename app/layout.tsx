import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Header from "@/components/Header";
import HelpFab from "@/components/HelpFab";
import Magic from "@/components/Magic";
import Providers from "@/components/Providers";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "magistick — DEJOIY",
  description: "DEJOIY's employee portal: apps, updates, people and help in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <Providers>
          <Magic />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-gold focus:px-3 focus:py-1.5 focus:text-sm focus:font-semibold focus:text-ink"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <HelpFab />
          <footer className="border-t border-line bg-panel">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-[12px] text-stone-500 sm:px-6 lg:px-8">
              <p>
                <span className="font-semibold text-ink">magistick</span> · DEJOIY India Pvt. Ltd. · Internal use only
              </p>
              <p>Trouble? Raise it under Get Help.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
