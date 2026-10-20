"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { SessionProvider } from "@/lib/roles";

/** Session context + reduced-motion respect for the whole app. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>{children}</SessionProvider>
    </MotionConfig>
  );
}
