import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLeadDetail } from "@/lib/actions/leads";
import { LeadDetailView } from "@/components/leads/lead-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { lead } = await getLeadDetail(id);
  if (!lead) return { title: "Lead Not Found — OutreachOS" };
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Prospect Profile";
  return {
    title: `${name} — OutreachOS`,
    description: `Complete outreach dossier and activity timeline for ${name} at ${lead.company || "Company"}.`,
  };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { lead, events, isSuppressed, suppressionReason } = await getLeadDetail(id);

  if (!lead) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <UserX className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Prospect Not Found</h1>
        <p className="text-xs text-muted-foreground max-w-sm">
          The requested prospect ID does not exist in your database or was deleted.
        </p>
        <Link href="/leads">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Prospect Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LeadDetailView
        lead={lead}
        events={events}
        isSuppressed={isSuppressed}
        suppressionReason={suppressionReason}
      />
    </div>
  );
}
