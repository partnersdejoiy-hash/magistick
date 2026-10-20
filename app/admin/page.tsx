import { Suspense } from "react";
import AdminConsole from "@/components/admin/AdminConsole";

export const metadata = { title: "Admin — magistick" };

export default function AdminPage() {
  return (
    <Suspense>
      <AdminConsole />
    </Suspense>
  );
}
