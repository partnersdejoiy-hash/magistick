import Link from "next/link";

/** Shown when the signed-in level lacks the permission for a surface. The API enforces it either way. */
export default function NotAllowed({ what = "this area" }: { what?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-panel px-8 py-12 text-center">
      <h1 className="text-[20px] font-semibold text-ink">You can&rsquo;t open {what}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
        Your level doesn&rsquo;t include this permission. If you need it, ask your manager; the Super Admin can change it in
        Admin → Roles &amp; permissions.
      </p>
      <Link href="/" className="mt-6 inline-flex rounded-lg bg-ember px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-nil">
        Back home
      </Link>
    </div>
  );
}
