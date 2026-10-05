import AppLauncher from "@/components/AppLauncher";

export const metadata = { title: "Apps — magistick" };

export default function AppsPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">App directory</h1>
      <p className="mt-1 text-sm text-slate-400">
        Every work app in one place. Pin your daily drivers with ☆ — they stay on top.
      </p>
      <div className="mt-6">
        <AppLauncher initialQuery={searchParams.q ?? ""} />
      </div>
    </div>
  );
}
