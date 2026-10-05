"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Global motion provider — honors the OS reduced-motion setting. */
export default function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
