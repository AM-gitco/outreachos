import { getActivityEvents } from "@/lib/actions/activity";
import { ActivityManager } from "@/components/activity/activity-manager";

export const metadata = {
  title: "Outreach Activity Logs — OutreachOS",
  description: "Live audit trail and timeline of every email sent, LinkedIn message, and response recorded.",
};

export default async function ActivityPage() {
  const initialData = await getActivityEvents({
    page: 1,
    pageSize: 15,
    sortBy: "sent_at",
    sortOrder: "desc",
  });

  return (
    <div className="w-full">
      <ActivityManager initialData={initialData} />
    </div>
  );
}
