import fs from "fs";
import path from "path";
import { AssignmentView } from "@/components/assignment/assignment-view";

export const metadata = {
  title: "Documentation & Assignment Spec — OutreachOS",
  description: "Official implementation handbook, database architecture, and multi-channel outreach requirements.",
};

export default function AssignmentPage() {
  const readmePath = path.join(process.cwd(), "OutreachOS_README.md");
  let readmeContent = "";
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, "utf8");
  }

  return (
    <div className="w-full">
      <AssignmentView readmeContent={readmeContent} />
    </div>
  );
}
