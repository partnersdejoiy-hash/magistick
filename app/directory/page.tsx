import { Suspense } from "react";
import DirectoryView from "@/components/DirectoryView";

export const metadata = { title: "Directory — magistick" };

export default function DirectoryPage() {
  return (
    <Suspense>
      <DirectoryView />
    </Suspense>
  );
}
