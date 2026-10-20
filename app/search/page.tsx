import { Suspense } from "react";
import SearchView from "@/components/SearchView";

export const metadata = { title: "Search — magistick" };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
