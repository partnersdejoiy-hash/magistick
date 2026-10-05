"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EASE } from "@/components/motion";

/**
 * Route enter transition — every page fades and rises gently on navigation.
 * (Enter-only; App Router templates don't get exit without extra plumbing,
 * and a calm enter is all a work portal needs.)
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
