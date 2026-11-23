"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Download,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Database,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  GitBranch,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadmeViewerProps {
  rawContent: string;
}

interface ParsedSection {
  id: string;
  number: number;
  title: string;
  content: string;
}

export function ReadmeViewer({ rawContent }: ReadmeViewerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = React.useState<number | null>(null);

  // Parse raw markdown into structured sections
  const { intro, sections } = React.useMemo(() => {
    const rawParts = rawContent.split(/(?=^## \d+\. )/m);
    const introPart = rawParts[0] || "";
    const parsedSections: ParsedSection[] = [];

    rawParts.slice(1).forEach((part, index) => {
      const firstLine = part.split("\n")[0].trim();
      const match = firstLine.match(/^## (\d+)\. (.*)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        const title = match[2];
        const body = part.replace(/^## \d+\. .*\n/, "").trim();
        parsedSections.push({
          id: `section-${num}`,
          number: num,
          title,
          content: body,
        });
      }
    });

    return { intro: introPart, sections: parsedSections };
  }, [rawContent]);

  // Filter sections by search term
  const filteredSections = React.useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.content.toLowerCase().includes(term)
    );
  }, [sections, searchTerm]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(rawContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OutreachOS_README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Copy, Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search handbook (e.g. WF-04, Supabase, GetSales, token)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-muted/30 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80 hover:bg-muted"
          >
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copiedAll ? "Copied All" : "Copy Markdown"}</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download README.md</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Sticky Table of Contents + Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sticky Table of Contents (Desktop) */}
        <div className="lg:col-span-1 border border-border/80 rounded-2xl bg-card p-4 shadow-xs sticky top-20 max-h-[82vh] overflow-y-auto space-y-3 hidden lg:block text-xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Handbook Index
            </h3>
          </div>

          <nav className="space-y-1">
            <a
              href="#section-intro"
              className="block px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors truncate"
            >
              Handover Note & Overview
            </a>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors truncate"
              >
                <span className="font-mono text-muted-foreground/70 mr-1.5 font-bold">
                  {sec.number}.
                </span>
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections Content Area */}
        <div className="lg:col-span-3 space-y-6 min-w-0">
          {/* Introductory Handover Callout */}
          <section id="section-intro" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                OutreachOS Documentation
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                1,129 lines · Full Architecture & Implementation Guide
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Project Documentation & Implementation Handover
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This handbook documents the complete multi-channel outreach automation suite, its Supabase data model, external API integrations (Clay, GetSales.io, Gmail, Telegram), and the OutreachOS Next.js management dashboard.
            </p>

            <div className="p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1">
              <span className="font-bold text-foreground block">
                Current Operational State
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                The complete 8-workflow architecture has been deployed and integrated into the dashboard. Priority 1 (GetSales visibility on LinkedIn Accounts) and Priority 2 (registration of WF-07 and WF-08 in the Automation Center) are active.
              </p>
            </div>
          </section>

          {/* Render All Filtered Sections */}
          {filteredSections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 scroll-mt-20"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center border border-primary/20">
                    {sec.number}
                  </span>
                  <h3 className="text-sm font-bold text-foreground tracking-tight">
                    {sec.title}
                  </h3>
                </div>

                <a
                  href={`#${sec.id}`}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground hover:underline"
                >
                  #{sec.id}
                </a>
              </div>

              {/* Section Body */}
              <div className="text-xs text-foreground/90 leading-relaxed font-sans space-y-4">
                <SectionMarkdownRenderer content={sec.content} onCopyCode={handleCopyCode} copiedCodeIdx={copiedCodeIdx} />
              </div>
            </section>
          ))}

          {filteredSections.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-xs space-y-2">
              <Search className="h-8 w-8 mx-auto opacity-40" />
              <p className="font-semibold text-foreground">No sections match your search</p>
              <p className="text-[11px]">Try searching for terms like &quot;WF-01&quot;, &quot;Supabase&quot;, &quot;GetSales&quot;, or clear the search.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="h-7 text-xs rounded-lg mt-2"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Clean renderer for markdown text inside each section
 */
function SectionMarkdownRenderer({
  content,
  onCopyCode,
  copiedCodeIdx,
}: {
  content: string;
  onCopyCode: (code: string, idx: number) => void;
  copiedCodeIdx: number | null;
}) {
  // Split content by code blocks and tables to format them appropriately
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          // Code block
          const lines = part.slice(3, -3).trim().split("\n");
          const lang = lines[0].trim();
          const codeText = lines.slice(lang ? 1 : 0).join("\n");

          return (
            <div
              key={idx}
              className="rounded-xl border border-border/80 bg-muted/40 overflow-hidden font-mono text-[11px]"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-border/60 text-[10px] text-muted-foreground">
                <span className="uppercase font-bold tracking-wider">{lang || "CODE"}</span>
                <button
                  type="button"
                  onClick={() => onCopyCode(codeText, idx)}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-sans"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed text-foreground/90">
                {codeText}
              </pre>
            </div>
          );
        }

        // Check if paragraph contains table
        if (part.includes("|") && part.includes("---")) {
          return (
            <div key={idx} className="overflow-x-auto border border-border/70 rounded-xl my-2">
              <MarkdownTable text={part} />
            </div>
          );
        }

        // Prose with bold, lists, and quotes
        return (
          <div key={idx} className="space-y-2 whitespace-pre-line leading-relaxed">
            {part
              .split("\n\n")
              .filter((p) => p.trim())
              .map((p, pIdx) => {
                if (p.startsWith("- ") || p.startsWith("* ")) {
                  const items = p.split("\n").filter((i) => i.trim());
                  return (
                    <ul key={pIdx} className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
                      {items.map((it, itIdx) => (
                        <li key={itIdx}>
                          <FormattedInline text={it.replace(/^[-*]\s+/, "")} />
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (p.startsWith("### ")) {
                  return (
                    <h4 key={pIdx} className="text-xs font-bold text-foreground uppercase tracking-wider pt-2">
                      {p.replace(/^###\s+/, "")}
                    </h4>
                  );
                }

                if (p.startsWith("#### ")) {
                  return (
                    <h5 key={pIdx} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pt-1">
                      {p.replace(/^####\s+/, "")}
                    </h5>
                  );
                }

                if (p.startsWith("> ")) {
                  return (
                    <div key={pIdx} className="p-3 rounded-xl bg-muted/40 border-l-2 border-primary text-muted-foreground italic my-1">
                      <FormattedInline text={p.replace(/^>\s+/, "")} />
                    </div>
                  );
                }

                return (
                  <p key={pIdx} className="text-foreground/90 leading-relaxed">
                    <FormattedInline text={p} />
                  </p>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Lightweight inline bold & code formatter
 */
function FormattedInline({ text }: { text: string }) {
  // Quick bold & backtick formatting
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <span>
      {tokens.map((token, i) => {
        if (token.startsWith("**") && token.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-foreground">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-muted/60 border border-border/50 font-mono text-[11px] text-foreground font-semibold">
              {token.slice(1, -1)}
            </code>
          );
        }
        return token;
      })}
    </span>
  );
}

/**
 * Simple markdown table parser
 */
function MarkdownTable({ text }: { text: string }) {
  const lines = text.trim().split("\n").filter((l) => l.includes("|"));
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const headers = headerLine.split("|").map((h) => h.trim()).filter((h) => h);
  const rows = lines.slice(2).map((l) =>
    l.split("|").map((c) => c.trim()).filter((_, idx) => idx > 0 && idx <= headers.length)
  );

  return (
    <table className="w-full text-xs text-left border-collapse bg-card">
      <thead>
        <tr className="border-b border-border/80 bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
          {headers.map((h, i) => (
            <th key={i} className="py-2 px-3 border-r border-border/50 last:border-r-0">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {rows.map((row, rIdx) => (
          <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="py-2 px-3 border-r border-border/50 last:border-r-0 text-foreground/90">
                <FormattedInline text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
