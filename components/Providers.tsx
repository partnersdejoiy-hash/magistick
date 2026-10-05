"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";

/** Global motion provider — honors the OS reduced-motion setting. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
