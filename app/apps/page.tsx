import AppCatalog from "@/components/AppCatalog";

export const metadata = { title: "Apps — magistick" };

export default function AppsPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-tight text-ink">Apps</h1>
      <p className="mt-1 text-[14px] text-stone-600">
        Every tool open to your level and department. Pin the ones you use daily; they stay on top everywhere.
      </p>
      <div className="mt-6">
        <AppCatalog initialQuery={searchParams.q ?? ""} />
      </div>
    </div>
  );
}
