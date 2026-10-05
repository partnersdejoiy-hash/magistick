import Link from "next/link";
import NotAllowed from "@/components/NotAllowed";

export const metadata = { title: "Not allowed — magistick" };

export default function NotAllowedPage() {
  return (
    <div className="py-10">
      <NotAllowed what="this area" />
      <p className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-magenta hover:text-magenta-deep">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
