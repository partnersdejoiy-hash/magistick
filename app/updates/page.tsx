import Link from "next/link";
import UpdatesFeed from "@/components/UpdatesFeed";
import { getMe } from "@/lib/auth";
import { IconPlus } from "@/components/icons";

export const metadata = { title: "Updates — magistick" };
export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const me = await getMe().catch(() => null);
  const canPublish = !!me?.perms.some((p) => p === "publish_posts_dept" || p === "publish_posts_all");
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Updates</h1>
          <p className="mt-1 text-[14px] text-stone-600">Company-wide news, plus what your department is posting.</p>
        </div>
        {canPublish && (
          <Link href="/admin/posts" className="inline-flex items-center gap-1.5 rounded-lg bg-ember px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-nil">
            <IconPlus size={15} /> Write an update
          </Link>
        )}
      </div>
      <UpdatesFeed />
    </div>
  );
}
