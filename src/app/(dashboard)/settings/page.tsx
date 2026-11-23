import { getOutreachConfig } from "@/lib/actions/settings";
import { getQueueHealthStats } from "@/lib/actions/automation-errors";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = {
  title: "Outreach Settings & Guardrails — OutreachOS",
  description: "Configure LinkedIn limits, sending schedules, timezones, and automation guardrails.",
};

export default async function SettingsPage() {
  const [record, queueStats] = await Promise.all([
    getOutreachConfig(),
    getQueueHealthStats(),
  ]);

  return (
    <div className="w-full">
      <SettingsForm initialRecord={record} initialQueueStats={queueStats} />
    </div>
  );
}
