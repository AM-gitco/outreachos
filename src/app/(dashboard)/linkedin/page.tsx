import { getLinkedinAccounts } from "@/lib/actions/linkedin";
import { LinkedinManager } from "@/components/linkedin/linkedin-manager";

export const metadata = {
  title: "LinkedIn Accounts & Health — OutreachOS",
  description: "Monitor LinkedIn sender account health, invitation quotas, acceptance rates, and safety restrictions.",
};

export default async function LinkedinPage() {
  const initialData = await getLinkedinAccounts();

  return (
    <div className="w-full">
      <LinkedinManager initialData={initialData} />
    </div>
  );
}
