"use client";

import * as React from "react";
import Papa from "papaparse";
import { 
  Search, 
  X, 
  Plus, 
  Upload, 
  Download, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Table2,
  LayoutGrid,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { SuppressionTable } from "@/components/suppression/suppression-table";
import { SuppressionCardsView } from "@/components/suppression/suppression-cards-view";
import { SuppressionMobileCards } from "@/components/suppression/suppression-mobile-cards";
import { AddSuppressionModal } from "@/components/suppression/add-suppression-modal";
import { 
  getSuppressionList, 
  removeSuppression, 
  exportSuppressionCsv,
  importSuppressionBatch,
  GetSuppressionResponse 
} from "@/lib/actions/suppression";
import { SuppressionRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SuppressionManagerProps {
  initialData: GetSuppressionResponse;
}

const PAGE_SIZE_OPTIONS: DropdownOption[] = [
  { value: "15", label: "15 per page" },
  { value: "30", label: "30 per page" },
  { value: "50", label: "50 per page" },
];

export function SuppressionManager({ initialData }: SuppressionManagerProps) {
  const [data, setData] = React.useState<GetSuppressionResponse>(initialData);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [sortBy, setSortBy] = React.useState<"created_at" | "email" | "reason">("created_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // View Mode: Table vs Cards with localStorage persistence
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table");

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [recordToRemove, setRecordToRemove] = React.useState<SuppressionRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-suppression-view-mode");
    if (saved === "table" || saved === "cards") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("outreachos-suppression-view-mode", mode);
  };

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch records
  const fetchRecords = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSuppressionList({
        page,
        pageSize,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to fetch suppression list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Sorting
  const handleSort = (column: "created_at" | "email" | "reason") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Remove confirmed
  const handleConfirmRemove = async () => {
    if (!recordToRemove) return;
    setIsRemoving(true);
    try {
      await removeSuppression(recordToRemove.id);
      setRecordToRemove(null);
      await fetchRecords();
    } catch (err) {
      console.error("Failed to remove suppression record:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const list = await exportSuppressionCsv();
      if (list.length === 0) {
        alert("Suppression list is currently empty.");
        return;
      }
      const rows = list.map((r) => ({
        "ID": r.id,
        "Email": r.email || "",
        "LinkedIn URL": r.linkedin_url || "",
        "Reason": r.reason || "",
        "Added Date": r.created_at || "",
      }));
      const csvString = Papa.unparse(rows);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `outreachos_suppression_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export suppression list:", err);
      alert("Failed to export suppression CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // Import CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const records = results.data.map((row) => ({
            email: row.Email || row.email || row["email address"] || "",
            linkedin_url: row["LinkedIn URL"] || row.linkedin_url || row.linkedin || "",
            reason: row.Reason || row.reason || "CSV Bulk Import",
          }));

          const res = await importSuppressionBatch(records);
          if (res.success) {
            alert(`Successfully imported ${res.count} suppression records.`);
            fetchRecords();
          } else {
            alert(res.error || "Failed to import records.");
          }
        } catch (err) {
          console.error("Error processing suppression CSV:", err);
          alert("Error processing CSV file.");
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Header & Actions Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0 whitespace-nowrap">
            Suppression List (Do Not Contact)
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 tabular-nums shrink-0 whitespace-nowrap">
            {data.totalCount} excluded
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

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
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-8 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add to Suppression
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="border border-border/80 rounded-xl bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by email, LinkedIn URL, or reason..."
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

          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="h-8.5 text-xs text-muted-foreground px-2.5 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main View: Table vs Cards for Desktop/Tablet, Cards for Mobile */}
      <div className="hidden sm:block">
        {viewMode === "table" ? (
          <SuppressionTable
            records={data.records}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRemove={(rec) => setRecordToRemove(rec)}
            isLoading={isLoading}
          />
        ) : (
          <SuppressionCardsView
            records={data.records}
            onRemove={(rec) => setRecordToRemove(rec)}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="sm:hidden">
        <SuppressionMobileCards
          records={data.records}
          onRemove={(rec) => setRecordToRemove(rec)}
        />
      </div>

      {/* Pagination Bar */}
      {data.totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs text-muted-foreground">
          <div>
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
              suppressed contacts
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

      {/* Add Suppression Modal */}
      <AddSuppressionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={fetchRecords}
      />

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        open={!!recordToRemove}
        onOpenChange={(open) => {
          if (!open) setRecordToRemove(null);
        }}
        title="Remove Contact from Suppression?"
        description={`Are you sure you want to remove ${
          recordToRemove?.email || recordToRemove?.linkedin_url || "this contact"
        } from the Do Not Contact suppression list? This contact will become eligible again for future automated outreach.`}
        confirmLabel="Remove from Exclusion"
        variant="destructive"
        loading={isRemoving}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
