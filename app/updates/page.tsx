import UpdatesFeed from "@/components/UpdatesFeed";
import { ARTICLES } from "@/lib/data";

export const metadata = { title: "Updates — magistick" };

export default function UpdatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company updates</h1>
      <p className="mt-1 text-sm text-slate-600">Announcements, IT notices, and workforce news from the BPO.</p>
      <div className="mt-6">
        <UpdatesFeed articles={ARTICLES} initialVisible={6} step={3} />
      </div>
    </div>
  );
}
