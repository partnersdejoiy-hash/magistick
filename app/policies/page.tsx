import type { Metadata } from "next";
import PolicyCenter from "@/components/PolicyCenter";

export const metadata: Metadata = { title: "Policy Center — magistick" };

export default function PoliciesPage() {
  return <PolicyCenter />;
}
