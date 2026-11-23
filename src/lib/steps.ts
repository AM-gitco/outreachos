import { Layers, Send, MessageSquare, Mail, CheckCircle2, UserPlus } from "lucide-react";
import { DropdownOption } from "@/components/ui/custom-dropdown";

export interface StepMeta {
  step: number;
  label: string;
  compactLabel: string;
  shortLabel: string;
  description: string;
  channelName: string;
  delayHint: string;
  badgeClass: string;
  barColor: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
  ringColor: string;
  iconName: string;
}

export const OUTREACH_STEPS: Record<number, StepMeta> = {
  0: {
    step: 0,
    label: "Step 0 · Lead Ingestion",
    compactLabel: "Step 0 · Ingest",
    shortLabel: "Step 0",
    description: "Sourced & verified in Supabase, awaiting sequence trigger",
    channelName: "Database Ingestion",
    delayHint: "Initial qualification",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25",
    barColor: "bg-slate-400 dark:bg-slate-500",
    textColor: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-500/10",
    borderColor: "border-slate-500/25",
    ringColor: "ring-slate-400/30",
    iconName: "Layers",
  },
  1: {
    step: 1,
    label: "Step 1 · Connect Request",
    compactLabel: "Step 1 · Connect",
    shortLabel: "Step 1",
    description: "LinkedIn invitation / connection request dispatched",
    channelName: "LinkedIn Network",
    delayHint: "Workflow 2 / LinkedIn invite",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
    barColor: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    ringColor: "ring-blue-500/30",
    iconName: "UserPlus",
  },
  2: {
    step: 2,
    label: "Step 2 · Intro Message",
    compactLabel: "Step 2 · Intro",
    shortLabel: "Step 2",
    description: "First touch email or welcome DM after connection accepted",
    channelName: "Email or LinkedIn DM",
    delayHint: "1-2 days post-connection",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
    barColor: "bg-sky-500",
    textColor: "text-sky-600 dark:text-sky-400",
    bgLight: "bg-sky-500/10",
    borderColor: "border-sky-500/25",
    ringColor: "ring-sky-500/30",
    iconName: "Send",
  },
  3: {
    step: 3,
    label: "Step 3 · Value Offer",
    compactLabel: "Step 3 · Offer",
    shortLabel: "Step 3",
    description: "First follow-up providing case study, resource or specific pitch",
    channelName: "Follow-up Touch",
    delayHint: "3-4 days after intro",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
    barColor: "bg-indigo-500",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-500/10",
    borderColor: "border-indigo-500/25",
    ringColor: "ring-indigo-500/30",
    iconName: "MessageSquare",
  },
  4: {
    step: 4,
    label: "Step 4 · Value Pitch",
    compactLabel: "Step 4 · Pitch",
    shortLabel: "Step 4",
    description: "Second follow-up addressing common friction or direct CTA",
    channelName: "Check-in Touch",
    delayHint: "4-5 days after offer",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
    barColor: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-500/10",
    borderColor: "border-purple-500/25",
    ringColor: "ring-purple-500/30",
    iconName: "Mail",
  },
  5: {
    step: 5,
    label: "Step 5 · Final Touch",
    compactLabel: "Step 5 · Final",
    shortLabel: "Step 5",
    description: "Breakup sequence / final wrap-up touch before completion",
    channelName: "Wrap-up Touch",
    delayHint: "6-7 days final notice",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    ringColor: "ring-emerald-500/30",
    iconName: "CheckCircle2",
  },
};

export function getStepMeta(step: number | null | undefined): StepMeta {
  const s = step ?? 0;
  return (
    OUTREACH_STEPS[s] || {
      step: s,
      label: `Step ${s}`,
      compactLabel: `Step ${s}`,
      shortLabel: `Step ${s}`,
      description: `Outreach Step ${s}`,
      channelName: "Custom Touch",
      delayHint: "Automated sequence",
      badgeClass: "bg-secondary text-secondary-foreground border-border",
      barColor: "bg-primary",
      textColor: "text-foreground",
      bgLight: "bg-secondary",
      borderColor: "border-border",
      ringColor: "ring-primary/20",
      iconName: "Layers",
    }
  );
}

export const STEP_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Steps", icon: Layers },
  { value: "0", label: "Step 0 · Ingestion", badge: "Ingested", badgeClassName: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-medium" },
  { value: "1", label: "Step 1 · Connect Request", badge: "Invite", badgeClassName: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-medium" },
  { value: "2", label: "Step 2 · Intro Message", badge: "Intro", badgeClassName: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 font-medium" },
  { value: "3", label: "Step 3 · Value Offer", badge: "Followup 1", badgeClassName: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 font-medium" },
  { value: "4", label: "Step 4 · Value Pitch", badge: "Followup 2", badgeClassName: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 font-medium" },
  { value: "5", label: "Step 5 · Final Touch", badge: "Final Touch", badgeClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium" },
];

export const STEP_PIPELINE_LIST = [0, 1, 2, 3, 4, 5].map((s) => OUTREACH_STEPS[s]);
