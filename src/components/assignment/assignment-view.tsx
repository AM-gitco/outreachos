"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Mail,
  GitBranch,
  Bot,
  Eye,
  FileCode,
  FileDown
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { PRESET_WORKFLOWS } from "@/lib/n8n/workflows-data";
import { downloadWorkflowsZip } from "@/lib/n8n/zip-helper";
import { cn } from "@/lib/utils";

export function AssignmentView() {
  const [activeTab, setActiveTab] = React.useState<"spec" | "pdf">("spec");
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);

  const handleDownloadAllZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadWorkflowsZip({ includePdf: true });
    } catch (err) {
      console.error("Failed to download ZIP:", err);
      alert("Failed to generate zip file. Please try again.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Assignment & Requirements Specification
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 tabular-nums">
              7 Pages · 13 Sections
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
              8/8 Workflows Implemented
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-Channel Outreach Automation (LinkedIn + Email) orchestrated with Clay, n8n, GetSales.io & Supabase.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Tab Switcher: Structured Spec vs Embedded PDF */}
          <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("spec")}
              className={cn(
                "px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "spec"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Structured Spec</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={cn(
                "px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "pdf"
                  ? "bg-background text-foreground shadow-xs font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Original PDF Document</span>
            </button>
          </div>

          {/* Download Original PDF Button */}
          <a
            href="/docs/requirements-multi-channel-outreach.pdf"
            download="Requirements Multi-Channel Outreach Automation (LinkedIn + Email).pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/80 hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="Download the official requirements PDF file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </a>

          {/* Download All Workflows as ZIP */}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadAllZip}
            disabled={isDownloadingZip}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
            title="Download all 8 workflows and the requirements PDF in a single ZIP archive"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{isDownloadingZip ? "Packaging..." : "Download as ZIP"}</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "pdf" ? (
        /* PDF Interactive Viewer Tab */
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">
                Requirements Multi-Channel Outreach Automation (LinkedIn + Email).pdf
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                (211 KB, 7 Pages)
              </span>
            </div>
            <a
              href="/docs/requirements-multi-channel-outreach.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Open in Full Tab</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="w-full h-[780px] rounded-2xl border border-border/80 bg-muted/20 overflow-hidden shadow-xs">
            <iframe
              src="/docs/requirements-multi-channel-outreach.pdf#toolbar=1&navpanes=1"
              title="Requirements: Multi-Channel Outreach Automation (LinkedIn + Email)"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      ) : (
        /* Structured Requirements Specification Tab */
        <div className="space-y-8">
          {/* Executive Architecture Banner */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  System Architecture
                </span>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Multi-Channel Outreach Pipeline
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-muted text-foreground border border-border/60">
                  Clay (Enrichment)
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                  n8n (Orchestration)
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-muted text-foreground border border-border/60">
                  GetSales.io (LinkedIn + Email)
                </span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-muted text-foreground border border-border/60">
                  Supabase (State & Logs)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Core Purpose
                </span>
                <p className="text-foreground leading-relaxed">
                  Automate a 5-step outreach sequence across LinkedIn and email, switching dynamically to email-only whenever the LinkedIn account is at risk of restriction.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Dynamic Send-Time Router
                </span>
                <p className="text-foreground leading-relaxed">
                  Channel decisions are made at <em>send time</em> for each step rather than upfront. If LinkedIn recovers, sequences seamlessly resume normal multi-channel cadence.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Autonomous Circuit Breaker
                </span>
                <p className="text-foreground leading-relaxed">
                  Instant failover to email upon Red health state, CAPTCHA, or restriction warning. Immediate sequence termination on any prospect reply, bounce, or opt-out.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: 5-Step Sequence Decision Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Section 4 · 5-Step Outreach Sequence Matrix
                </h3>
                <p className="text-xs text-foreground font-semibold mt-0.5">
                  Touch Order, Default Channel vs Failover Route, and Delay Rules
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Default Spacing: 2–3 Business Days
              </span>
            </div>

            <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-16">Step</th>
                      <th className="py-2.5 px-4">Touch Description</th>
                      <th className="py-2.5 px-4">Default Channel</th>
                      <th className="py-2.5 px-4">Fallback Channel (LinkedIn Unhealthy)</th>
                      <th className="py-2.5 px-4">Stop Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">Step 1</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        Initial Connection Request
                        <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                          Personalized note if not connected; direct message if already connected
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#388be8] border border-[#0a66c2]/20 font-semibold text-[11px]">
                          <LinkedinIcon className="h-3 w-3" />
                          LinkedIn
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email (Personalized Intro)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        Reply, Meeting Booked, Unsubscribe
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">Step 2</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        Follow-up 1 (Value Proposition)
                        <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                          Targeted problem/solution insight with email subject line
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email (Direct)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        Reply, Bounce, Opt-out
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">Step 3</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        LinkedIn Message (Social Touch)
                        <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                          Sent only if connected; otherwise falls back to email automatically
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#388be8] border border-[#0a66c2]/20 font-semibold text-[11px]">
                          <LinkedinIcon className="h-3 w-3" />
                          LinkedIn
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email (Fallback Version)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        Reply, Meeting Booked, Opt-out
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">Step 4</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        Check-in & Case Study Email
                        <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                          Concrete metric, reference example, and low-friction call-to-action
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email (Direct)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        Reply, Bounce, Opt-out
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">Step 5</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        Breakup / Final Touch
                        <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                          Permission to close file or re-engage next quarter
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#388be8] border border-[#0a66c2]/20 font-semibold text-[11px]">
                          <LinkedinIcon className="h-3 w-3" />
                          LinkedIn
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold text-[11px]">
                          <Mail className="h-3 w-3" />
                          Email (Breakup Note)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        Completed (Marks sequence finished)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 5: LinkedIn Account Health Guardrail */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Section 5 · LinkedIn Account Health Guardian & Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Green (Healthy)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Full Operations
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All signals normal. Daily invites &lt;20, weekly caps safe, acceptance rate &gt;25%, 0 pending challenges.
                </p>
                <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold">
                  Action: Dispatches LinkedIn steps normally according to sequence rules.
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-amber-500/30 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Yellow (Warning)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    Throttle Mode
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Approaching limits or falling acceptance rate (20-25%). Pending invites 500-800.
                </p>
                <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold">
                  Action: Throttles volume, prioritizes high-value prospects, shifts remainder to email.
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-rose-500/30 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Red (Emergency Pause)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    Failover Active
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Any restriction notice, CAPTCHA, verification challenge, or hard cap reached.
                </p>
                <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-semibold">
                  Action: Pauses LinkedIn instantly, diverts 100% to email, triggers Telegram alert.
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: n8n Production Workflows Mapping */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Section 6 · n8n Production Workflows (WF-01 to WF-08)
                </h3>
                <p className="text-xs text-foreground font-semibold mt-0.5">
                  Complete 8-Pipeline Implementation Loaded in OutreachOS
                </p>
              </div>
              <Link
                href="/automation"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Open Canvas Controller &rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {PRESET_WORKFLOWS.map((wf) => (
                <div
                  key={wf.id}
                  className="border border-border/80 rounded-xl bg-card p-3.5 space-y-2 shadow-xs hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {wf.id}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {wf.nodes.length} nodes
                    </span>
                  </div>

                  <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-1">
                    {wf.name}
                  </h4>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {wf.description}
                  </p>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                    <span className="font-mono uppercase text-muted-foreground">
                      {wf.category}
                    </span>
                    <Link
                      href="/automation"
                      className="font-semibold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 11 & 12: Deliverables & Acceptance Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* Deliverables Checklist */}
            <div className="border border-border/80 rounded-2xl bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Section 11 · Deliverables Checklist (6/6)
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Complete
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">1. Working n8n Workflows</span>
                    <span className="text-muted-foreground text-[11px]">Ingestion (WF-01), Scheduling (WF-02), Health (WF-03), Sending (WF-04), Reply (WF-05), Reports (WF-06), Recovery (WF-07), Sync (WF-08).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">2. Config & Thresholds Registry</span>
                    <span className="text-muted-foreground text-[11px]">Database-backed outreach_config table for daily/weekly caps, sending windows, and delays.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">3. Multi-Channel Message Templates</span>
                    <span className="text-muted-foreground text-[11px]">Dual-format templates for Steps 1–5: conversational LinkedIn and structured email variants.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">4. Centralized Operations Dashboard</span>
                    <span className="text-muted-foreground text-[11px]">OutreachOS operations platform tracking sent touches, replies, bounce rates, and restrictions.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">5. Multi-Tier Alerting Engine</span>
                    <span className="text-muted-foreground text-[11px]">Real-time Telegram notifications for Red restrictions, uncaught errors, and high-priority replies.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">6. Documentation & Runbooks</span>
                    <span className="text-muted-foreground text-[11px]">Full setup handbook, troubleshooting guides, and API integration specifications.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="border border-border/80 rounded-2xl bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Section 12 · Acceptance Criteria (6/6)
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Test List Progression</span>
                    <span className="text-muted-foreground text-[11px]">Prospects advance through the full 5-step sequence with configurable inter-touch delays.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Red State Failover Verification</span>
                    <span className="text-muted-foreground text-[11px]">Forcing Red health immediately redirects all subsequent steps to email with 0 LinkedIn touches.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Instant Reply Interruption</span>
                    <span className="text-muted-foreground text-[11px]">Inbound replies stop the sequence immediately, updating prospect status to &lsquo;replied&rsquo;.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Zero Duplicate Contacting</span>
                    <span className="text-muted-foreground text-[11px]">Deduplication and suppression registry prevent duplicate touches or contacting unsubscribed leads.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Strict Quota Enforcement</span>
                    <span className="text-muted-foreground text-[11px]">Never breaches daily or weekly caps; honors timezone business hours (9am-5pm Mon-Fri).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Complete Audit Trail</span>
                    <span className="text-muted-foreground text-[11px]">Every dispatched action, webhook payload, and error is permanently logged to Supabase.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
