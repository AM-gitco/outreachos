import { getLeads } from "@/lib/actions/leads";
import { LeadsManager } from "@/components/leads/leads-manager";

export const metadata = {
  title: "Prospect Pipeline — OutreachOS",
  description: "Manage multi-channel outreach leads, track pipeline stages, and monitor campaign statuses.",
};

export default async function LeadsPage() {
  const initialData = await getLeads({
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  return (
    <div className="w-full">
      <LeadsManager initialData={initialData} />
    </div>
  );
}
