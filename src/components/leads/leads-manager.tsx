"use client";

import * as React from "react";
import Papa from "papaparse";
import { 
  Search, 
  X, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Filter, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  MessageSquare,
  Pause,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Mail,
  Globe,
  CheckSquare,
  Square,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsCardsView } from "@/components/leads/leads-cards-view";
import { LeadsMobileCards } from "@/components/leads/leads-mobile-cards";
import { LeadFormModal } from "@/components/leads/lead-form-modal";
import { CsvImportModal } from "@/components/leads/csv-import-modal";
import { 
  getLeads, 
  deleteLead, 
  deleteMultipleLeads, 
  exportLeadsToCsvData,
  GetLeadsResponse 
} from "@/lib/actions/leads";
import { Prospect } from "@/lib/types";
import { STEP_DROPDOWN_OPTIONS } from "@/lib/steps";
import { cn } from "@/lib/utils";

interface LeadsManagerProps {
  initialData: GetLeadsResponse;
}

// Clean options without dots
const STATUS_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Statuses", icon: Filter },
  { value: "active", label: "Active", icon: Clock, iconColor: "text-blue-500", badge: "Live" },
  { value: "completed", label: "Completed", icon: CheckCircle2, iconColor: "text-emerald-500", badge: "Done" },
  { value: "replied", label: "Replied", icon: MessageSquare, iconColor: "text-purple-500", badge: "Engaged" },
  { value: "paused", label: "Paused", icon: Pause, iconColor: "text-amber-500" },
  { value: "suppressed", label: "Suppressed", icon: ShieldAlert, iconColor: "text-rose-500", badge: "Blocked" },
  { value: "failed", label: "Failed", icon: AlertTriangle, iconColor: "text-red-500" },
];

const CHANNEL_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Channels", icon: Globe },
  { value: "email", label: "Email Only", icon: Mail, iconColor: "text-sky-500" },
  { value: "linkedin", label: "LinkedIn Only", icon: LinkedinIcon, iconColor: "text-blue-600" },
  { value: "both", label: "Both Channels", icon: Layers, iconColor: "text-purple-500" },
];

const PAGE_SIZE_OPTIONS: DropdownOption[] = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export function LeadsManager({ initialData }: LeadsManagerProps) {
  const [data, setData] = React.useState<GetLeadsResponse>(initialData);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [step, setStep] = React.useState("all");
  const [channel, setChannel] = React.useState<"all" | "email" | "linkedin" | "both">("all");
  const [country, setCountry] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"created_at" | "first_name" | "company" | "current_step" | "next_send_at">("created_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table");

  // Load view mode preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-leads-view-mode") as "table" | "cards" | null;
    if (saved === "table" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  const handleSetViewMode = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("outreachos-leads-view-mode", mode);
  };

  // Modals & Dialogs state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Prospect | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    open: boolean;
    lead?: Prospect;
    isBulk?: boolean;
  }>({ open: false });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Fast debounce (200ms) for snappy search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 200);
    return () => clearTimeout(handler);
  }, [search]);

  // Fast fetch
  const fetchLeads = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const stepNumber = step === "all" ? undefined : parseInt(step, 10);
      const res = await getLeads({
        page,
        pageSize,
        search: debouncedSearch,
        status,
        country,
        current_step: stepNumber,
        channel,
        sortBy,
        sortOrder,
      });
      setData(res);
      setSelectedIds((prev) => prev.filter((id) => res.leads.some((l) => l.id === id)));
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status, country, step, channel, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Dynamic country options
  const countryOptions = React.useMemo<DropdownOption[]>(() => {
    const opts: DropdownOption[] = [{ value: "all", label: "All Countries", icon: Globe }];
    (data.distinctCountries || []).forEach((c) => {
      opts.push({ value: c, label: c, icon: Globe, iconColor: "text-muted-foreground" });
    });
    return opts;
  }, [data.distinctCountries]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentPageIds = data.leads.map((l) => l.id);
    const allSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Sorting
  const handleSort = (column: "created_at" | "first_name" | "company" | "current_step" | "next_send_at") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Reset filters
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    step !== "all" ||
    channel !== "all" ||
    country !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setStep("all");
    setChannel("all");
    setCountry("all");
    setPage(1);
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const stepNumber = step === "all" ? undefined : parseInt(step, 10);
      const exportData = await exportLeadsToCsvData({
        search: debouncedSearch,
        status,
        country,
        current_step: stepNumber,
        channel,
      });

      if (!exportData || exportData.length === 0) {
        alert("No leads available to export with current filters.");
        return;
      }

      const rows = exportData.map((lead) => ({
        "First Name": lead.first_name || "",
        "Last Name": lead.last_name || "",
        "Company": lead.company || "",
        "Job Title": lead.job_title || "",
        "Email": lead.email || "",
        "LinkedIn URL": lead.linkedin_url || "",
        "Country": lead.country || "",
        "Timezone": lead.timezone || "",
        "Status": lead.status || "",
        "Current Step": lead.current_step ?? 0,
        "Next Send At": lead.next_send_at || "",
        "LinkedIn Connected": lead.linkedin_connected ? "Yes" : "No",
        "Created At": lead.created_at || "",
      }));

      const csvString = Papa.unparse(rows);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `outreachos_prospects_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export leads:", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Delete actions
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteConfirm.isBulk) {
        await deleteMultipleLeads(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
      } else if (deleteConfirm.lead) {
        await deleteLead(deleteConfirm.lead.id);
        setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirm.lead?.id));
      }
      setDeleteConfirm({ open: false });
      await fetchLeads();
    } catch (err) {
      console.error("Error deleting lead(s):", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Header & Actions Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 w-full">
        <div className="flex items-center gap-2.5 shrink-0">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground whitespace-nowrap">
            Prospect Pipeline
          </h1>
          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border/70 tabular-nums whitespace-nowrap">
            {data.totalCount} prospects
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher: Table vs Cards */}
          <div className="flex items-center p-0.5 rounded-lg border border-border/80 bg-muted/40 shrink-0">
            <button
              type="button"
              onClick={() => handleSetViewMode("table")}
              className={cn(
                "h-7 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode("cards")}
              className={cn(
                "h-7 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Select Leads Toggle (Hides checkboxes by default for clean UI) */}
          <Button
            variant={isSelectionMode || selectedIds.length > 0 ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              if (selectedIds.length > 0) {
                setSelectedIds([]);
                setIsSelectionMode(false);
              } else {
                setIsSelectionMode((prev) => !prev);
              }
            }}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            {isSelectionMode || selectedIds.length > 0 ? (
              <>
                <CheckSquare className="h-3.5 w-3.5 text-primary" />
                Done Selecting
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5 opacity-60" />
                Select Leads
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || data.totalCount === 0}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingLead(null);
              setIsAddOpen(true);
            }}
            className="h-8 text-xs gap-1.5 shadow-xs rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* Responsive & Balanced Filter Bar */}
      <div className="border border-border/80 rounded-xl bg-card p-3 space-y-2.5 shadow-xs">
        {/* Row 1: Search Input + Clear + Reset Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, company, email, or LinkedIn URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-7 text-xs bg-background rounded-lg w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-3 rounded-lg shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>

        {/* Row 2: Symmetric Grid Filter Selectors (1 col mobile, 2 col tablet 700-850px, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Status Dropdown */}
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            placeholder="All Statuses"
            className="h-9 text-xs w-full"
          />

          {/* Step Dropdown with colorful badges */}
          <CustomDropdown
            options={STEP_DROPDOWN_OPTIONS}
            value={step}
            onChange={(v) => {
              setStep(v);
              setPage(1);
            }}
            placeholder="All Steps"
            className="h-9 text-xs w-full"
          />

          {/* Channel Dropdown */}
          <CustomDropdown
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={(v) => {
              setChannel(v as "all" | "email" | "linkedin" | "both");
              setPage(1);
            }}
            placeholder="All Channels"
            className="h-9 text-xs w-full"
          />

          {/* Country Dropdown */}
          <CustomDropdown
            options={countryOptions}
            value={country}
            onChange={(v) => {
              setCountry(v);
              setPage(1);
            }}
            searchable
            placeholder="All Countries"
            className="h-9 text-xs w-full"
          />
        </div>
      </div>

      {/* Bulk Action Ribbon */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary tabular-nums">
              {selectedIds.length}
            </span>
            <span className="text-foreground">
              {selectedIds.length === 1 ? "prospect selected" : "prospects selected"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setDeleteConfirm({
                  open: true,
                  isBulk: true,
                })
              }
              className="h-7 text-xs gap-1.5 rounded-md"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedIds([]);
                setIsSelectionMode(false);
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-md"
            >
              Cancel Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main View: Desktop Table / Cards View & Mobile Cards */}
      <div className="hidden md:block w-full">
        {viewMode === "table" ? (
          <LeadsTable
            leads={data.leads}
            selectedIds={selectedIds}
            isSelectionMode={isSelectionMode}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={(lead) => {
              setEditingLead(lead);
              setIsAddOpen(true);
            }}
            onDelete={(lead) => {
              setDeleteConfirm({
                open: true,
                lead,
                isBulk: false,
              });
            }}
            isLoading={isLoading}
          />
        ) : (
          <LeadsCardsView
            leads={data.leads}
            selectedIds={selectedIds}
            isSelectionMode={isSelectionMode}
            onToggleSelect={handleToggleSelect}
            onEdit={(lead) => {
              setEditingLead(lead);
              setIsAddOpen(true);
            }}
            onDelete={(lead) => {
              setDeleteConfirm({
                open: true,
                lead,
                isBulk: false,
              });
            }}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="md:hidden w-full">
        <LeadsMobileCards
          leads={data.leads}
          selectedIds={selectedIds}
          isSelectionMode={isSelectionMode}
          onToggleSelect={handleToggleSelect}
          onEdit={(lead) => {
            setEditingLead(lead);
            setIsAddOpen(true);
          }}
          onDelete={(lead) => {
            setDeleteConfirm({
              open: true,
              lead,
              isBulk: false,
            });
          }}
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
              prospects
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
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-md"
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
                className="h-8 w-8 rounded-md"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      <LeadFormModal
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setEditingLead(null);
        }}
        lead={editingLead}
        onSuccess={() => {
          fetchLeads();
        }}
      />

      {/* CSV Bulk Import Modal */}
      <CsvImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => {
          fetchLeads();
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title={
          deleteConfirm.isBulk
            ? `Delete ${selectedIds.length} Prospects?`
            : `Delete ${deleteConfirm.lead?.first_name || "Prospect"}?`
        }
        description={
          deleteConfirm.isBulk
            ? `Are you sure you want to permanently delete ${selectedIds.length} selected prospects? This operation will remove all associated outreach history and cannot be undone.`
            : `Are you sure you want to permanently delete this prospect from your outreach pipeline? This action cannot be undone.`
        }
        confirmLabel={deleteConfirm.isBulk ? `Delete ${selectedIds.length} Leads` : "Delete Lead"}
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
