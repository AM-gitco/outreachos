import { getWorkflowStatuses } from "@/lib/actions/automation";
import { getAutomationErrors, getQueueHealthStats } from "@/lib/actions/automation-errors";
import { AutomationManager } from "@/components/automation/automation-manager";

export const metadata = {
  title: "Automation Control Center (n8n) — OutreachOS",
  description: "Monitor status, execution heartbeats, webhook bridges, and automation incident logs.",
};

export default async function AutomationPage() {
  const [workflows, { errors, openCount }, queueStats] = await Promise.all([
    getWorkflowStatuses(),
    getAutomationErrors({ limit: 50 }),
    getQueueHealthStats(),
  ]);

  return (
    <div className="w-full">
      <AutomationManager
        workflows={workflows}
        errors={errors}
        openErrorCount={openCount}
        queueStats={queueStats}
      />
    </div>
  );
}
