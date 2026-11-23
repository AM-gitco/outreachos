import { getSuppressionList } from "@/lib/actions/suppression";
import { SuppressionManager } from "@/components/suppression/suppression-manager";

export const metadata = {
  title: "Suppression List (Do Not Contact) — OutreachOS",
  description: "Manage global exclusion list to prevent outreach to unsubscribed or restricted contacts.",
};

export default async function SuppressionPage() {
  const initialData = await getSuppressionList({
    page: 1,
    pageSize: 15,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  return (
    <div className="w-full">
      <SuppressionManager initialData={initialData} />
    </div>
  );
}
