import { getCampaignOverview } from "@/lib/actions/campaigns";
import { CampaignsDashboard } from "@/components/campaigns/campaigns-dashboard";

export const metadata = {
  title: "Continuous Outreach Flows — OutreachOS",
  description: "Monitor pipeline cohorts, channel conversion metrics, and manage outreach engine pause/resume controls.",
};

export default async function CampaignsPage() {
  const initialData = await getCampaignOverview();

  return (
    <div className="w-full">
      <CampaignsDashboard initialData={initialData} />
    </div>
  );
}
