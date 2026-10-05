import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "magistick — DEJOIY BPO employee portal",
  description: "One portal for every app, update, and support ticket at DEJOIY BPO.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-violet-600 focus:px-3 focus:py-1 focus:text-white">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
        <footer className="mt-16 bg-ink py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-slate-400">
            <p>© 2026 DEJOIY India Pvt. Ltd. · magistick employee portal</p>
            <p>Privacy Policy · Terms · Internal use only</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
