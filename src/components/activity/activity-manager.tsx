"use client";

import * as React from "react";
import Papa from "papaparse";
import { 
  Search, 
  X, 
  Download, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Code2, 
  FileText,
  Table2,
  LayoutGrid,
  Loader2,
  Mail,
  MessageSquare,
  Clock
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { DateRangePicker, DateRange } from "@/components/ui/custom-datepicker";
import { ActivityTable } from "@/components/activity/activity-table";
import { ActivityCardsView } from "@/components/activity/activity-cards-view";
import { ActivityMobileCards } from "@/components/activity/activity-mobile-cards";
import { 
  getActivityEvents, 
  exportActivityToCsvData, 
  GetActivityResponse 
} from "@/lib/actions/activity";
import { OutreachEvent } from "@/lib/types";
import { STEP_DROPDOWN_OPTIONS } from "@/lib/steps";
import { cn } from "@/lib/utils";

interface ActivityManagerProps {
  initialData: GetActivityResponse;
}

const CHANNEL_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Channels" },
  { value: "email", label: "Email (SMTP)", badge: "Email", badgeClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25" },
  { value: "linkedin", label: "LinkedIn DM", badge: "LinkedIn", badgeClassName: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25" },
  { value: "reply", label: "Direct Reply", badge: "Reply", badgeClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25" },
];

const PAGE_SIZE_OPTIONS: DropdownOption[] = [
  { value: "15", label: "15 per page" },
  { value: "30", label: "30 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export function ActivityManager({ initialData }: ActivityManagerProps) {
  const [data, setData] = React.useState<GetActivityResponse>(initialData);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [channel, setChannel] = React.useState("all");
  const [action, setAction] = React.useState("all");
  const [step, setStep] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [sortBy, setSortBy] = React.useState<"sent_at" | "step" | "channel" | "action">("sent_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // View mode: Table vs Cards (desktop/tablet)
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Inspector Modals state
  const [selectedMessageEvent, setSelectedMessageEvent] = React.useState<OutreachEvent | null>(null);
  const [selectedResponseEvent, setSelectedResponseEvent] = React.useState<OutreachEvent | null>(null);
  const [copiedPayload, setCopiedPayload] = React.useState(false);

  // Load view mode preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-activity-view-mode");
    if (saved === "table" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("outreachos-activity-view-mode", mode);
  };

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch events
  const fetchEvents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const stepNumber = step === "all" ? undefined : parseInt(step, 10);
      const res = await getActivityEvents({
        page,
        pageSize,
        search: debouncedSearch,
        channel,
        action,
        step: stepNumber,
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
        sortBy,
        sortOrder,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to fetch activity events:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, channel, action, step, dateRange, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Dynamic actions options from DB
  const actionOptions = React.useMemo<DropdownOption[]>(() => {
    const opts: DropdownOption[] = [{ value: "all", label: "All Actions" }];
    (data.distinctActions || []).forEach((act) => {
      opts.push({
        value: act,
        label: act.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    });
    return opts;
  }, [data.distinctActions]);

  // Sorting
  const handleSort = (column: "sent_at" | "step" | "channel" | "action") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Reset filters
  const hasActiveFilters =
    search.trim() !== "" ||
    channel !== "all" ||
    action !== "all" ||
    step !== "all" ||
    dateRange !== undefined;

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setChannel("all");
    setAction("all");
    setStep("all");
    setDateRange(undefined);
    setPage(1);
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const stepNumber = step === "all" ? undefined : parseInt(step, 10);
      const exportList = await exportActivityToCsvData({
        search: debouncedSearch,
        channel,
        action,
        step: stepNumber,
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      });

      if (!exportList || exportList.length === 0) {
        alert("No activity events available to export with current filters.");
        return;
      }

      const rows = exportList.map((e) => ({
        "Event ID": e.id,
        "Timestamp": e.sent_at,
        "Channel": e.channel,
        "Action": e.action,
        "Step": e.step,
        "Prospect ID": e.prospect_id,
        "Prospect Name": e.prospect
          ? [e.prospect.first_name, e.prospect.last_name].filter(Boolean).join(" ")
          : "",
        "Prospect Email": e.prospect?.email || "",
        "Prospect Company": e.prospect?.company || "",
        "Message": e.message || "",
        "Message ID": e.message_id || "",
        "Response Data": e.response ? JSON.stringify(e.response) : "",
      }));

      const csvString = Papa.unparse(rows);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `outreachos_activity_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export activity:", err);
      alert("Failed to export activity logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Header & Export Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0 whitespace-nowrap">
            Outreach Activity Logs
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border tabular-nums shrink-0 whitespace-nowrap">
            {data.totalCount} events recorded
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("cards")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || data.totalCount === 0}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isExporting ? "Exporting..." : "Export Logs (CSV)"}
          </Button>
        </div>
      </div>

      {/* Filter Ribbon: 2 Clean Rows */}
      <div className="border border-border/80 rounded-xl bg-card p-3 sm:p-3.5 space-y-2.5 shadow-xs">
        {/* Row 1: Search & Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search message text, recipient name, or Message ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 pl-8 pr-7 text-xs bg-background rounded-lg"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3 shrink-0 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>

        {/* Row 2: 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-border/50">
          <div>
            <CustomDropdown
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={(v) => {
                setChannel(v);
                setPage(1);
              }}
              placeholder="All Channels"
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          <div>
            <CustomDropdown
              options={actionOptions}
              value={action}
              onChange={(v) => {
                setAction(v);
                setPage(1);
              }}
              placeholder="All Actions"
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          <div>
            <CustomDropdown
              options={STEP_DROPDOWN_OPTIONS}
              value={step}
              onChange={(v) => {
                setStep(v);
                setPage(1);
              }}
              placeholder="All Steps"
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          <div>
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
              className="h-8.5"
            />
          </div>
        </div>
      </div>

      {/* Main View: Table vs Cards for Desktop/Tablet, Cards for Mobile */}
      <div className="hidden sm:block">
        {viewMode === "table" ? (
          <ActivityTable
            events={data.events}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onViewMessage={(ev) => setSelectedMessageEvent(ev)}
            onViewResponse={(ev) => setSelectedResponseEvent(ev)}
            isLoading={isLoading}
          />
        ) : (
          <ActivityCardsView
            events={data.events}
            onViewMessage={(ev) => setSelectedMessageEvent(ev)}
            onViewResponse={(ev) => setSelectedResponseEvent(ev)}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="sm:hidden">
        <ActivityMobileCards
          events={data.events}
          onViewMessage={(ev) => setSelectedMessageEvent(ev)}
          onViewResponse={(ev) => setSelectedResponseEvent(ev)}
        />
      </div>

      {/* Pagination Bar */}
      {data.totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground tabular-nums">
                {(data.page - 1) * data.pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground tabular-nums">
                {Math.min(data.page * data.pageSize, data.totalCount)}
              </strong>{" "}
              of{" "}
              <strong className="text-foreground tabular-nums">
                {data.totalCount}
              </strong>{" "}
              events
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32">
              <CustomDropdown
                options={PAGE_SIZE_OPTIONS}
                value={String(pageSize)}
                onChange={(v) => {
                  setPageSize(parseInt(v, 10));
                  setPage(1);
                }}
                className="h-7 text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 rounded-lg"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 text-xs tabular-nums text-foreground">
                Page {data.page} of {Math.max(1, data.totalPages)}
              </span>

              <Button
                variant="outline"
                size="icon"
                disabled={page >= data.totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="h-7 w-7 rounded-lg"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Reader Modal */}
      {selectedMessageEvent && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-border/80 bg-card rounded-xl max-w-lg w-full p-4.5 space-y-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Outreach Message Content
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Recorded sequence touch dispatch
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessageEvent(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Recipient Dossier & Channel Meta */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-semibold text-foreground">
                  {selectedMessageEvent.prospect
                    ? [selectedMessageEvent.prospect.first_name, selectedMessageEvent.prospect.last_name]
                        .filter(Boolean)
                        .join(" ") || "Unnamed Prospect"
                    : "Unlinked Prospect"}
                  {selectedMessageEvent.prospect?.company && (
                    <span className="text-muted-foreground font-normal">
                      {" "}· {selectedMessageEvent.prospect.company}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Channel & Action:</span>
                <span className="font-semibold text-foreground uppercase tracking-wide text-[11px]">
                  {selectedMessageEvent.channel} · {selectedMessageEvent.action.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sent Timestamp:</span>
                <span className="tabular-nums text-foreground flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3 text-muted-foreground opacity-60" />
                  {new Date(selectedMessageEvent.sent_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Formatted Message Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>Message Body</span>
                <span className="tabular-nums">
                  {selectedMessageEvent.message ? selectedMessageEvent.message.length : 0} characters ·{" "}
                  {selectedMessageEvent.message
                    ? selectedMessageEvent.message.trim().split(/\s+/).filter(Boolean).length
                    : 0}{" "}
                  words
                </span>
              </div>
              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/70 text-xs font-sans text-foreground leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                {selectedMessageEvent.message || "No text content recorded for this event."}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(selectedMessageEvent.message || "")}
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                {copiedPayload ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedPayload ? "Copied Message" : "Copy Message"}
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedMessageEvent(null)}
                className="h-8 text-xs rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Response Payload Inspector Modal */}
      {selectedResponseEvent && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-border/80 bg-card rounded-xl max-w-lg w-full p-4.5 space-y-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Response Payload Inspector
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Raw API response from n8n / integration channel
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponseEvent(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-muted/50 p-3.5 rounded-lg border border-border/70 text-[11px] font-mono text-foreground max-h-80 overflow-y-auto leading-relaxed">
              <pre>{JSON.stringify(selectedResponseEvent.response, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopyText(JSON.stringify(selectedResponseEvent.response, null, 2))
                }
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                {copiedPayload ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedPayload ? "Copied JSON" : "Copy Raw JSON"}
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedResponseEvent(null)}
                className="h-8 text-xs rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
