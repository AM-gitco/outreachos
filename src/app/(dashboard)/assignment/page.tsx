import { AssignmentView } from "@/components/assignment/assignment-view";

export const metadata = {
  title: "Assignment Spec & Requirements — OutreachOS",
  description: "Official requirements specification for Multi-Channel Outreach Automation (LinkedIn + Email).",
};

export default function AssignmentPage() {
  return (
    <div className="w-full">
      <AssignmentView />
    </div>
  );
}
