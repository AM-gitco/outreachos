import { getSystemNotifications } from "@/lib/actions/notifications";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata = {
  title: "Notifications & Operational Alerts — OutreachOS",
  description: "Review system warnings, LinkedIn restriction notices, processing lock stalls, and new prospect replies.",
};

export default async function NotificationsPage() {
  const notifications = await getSystemNotifications();

  return (
    <div className="w-full">
      <NotificationsView notifications={notifications} />
    </div>
  );
}
