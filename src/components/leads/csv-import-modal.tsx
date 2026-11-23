"use client";

import * as React from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importLeadsBatch, CreateLeadInput } from "@/lib/actions/leads";

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CsvImportModal({
  open,
  onOpenChange,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<CreateLeadInput[]>([]);
  const [previewRows, setPreviewRows] = React.useState<Record<string, string>[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [importResult, setImportResult] = React.useState<{
    imported: number;
    skippedDuplicates: number;
    skippedSuppressed: number;
    totalReceived: number;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setParsedData([]);
      setPreviewRows([]);
      setColumns([]);
      setErrorMsg("");
      setImportResult(null);
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) parseCsv(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && (dropped.name.endsWith(".csv") || dropped.type === "text/csv")) {
      parseCsv(dropped);
    } else {
      setErrorMsg("Please upload a valid .csv file.");
    }
  };

  const parseCsv = (fileToParse: File) => {
    setErrorMsg("");
    setImportResult(null);
    setFile(fileToParse);

    Papa.parse<Record<string, string>>(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMsg("The uploaded CSV file is empty or could not be parsed.");
          return;
        }

        const rawRows = results.data;
        const headers = Object.keys(rawRows[0] || {});
        setColumns(headers);
        setPreviewRows(rawRows.slice(0, 5));

        // Intelligent column mapping
        const mapped: CreateLeadInput[] = rawRows.map((row) => {
          const findVal = (patterns: string[]) => {
            const key = headers.find((h) =>
              patterns.some((p) => h.toLowerCase().trim() === p || h.toLowerCase().includes(p))
            );
            return key ? row[key]?.trim() || null : null;
          };

          return {
            first_name: findVal(["first name", "firstname", "first_name", "first"]),
            last_name: findVal(["last name", "lastname", "last_name", "last", "surname"]),
            company: findVal(["company", "organization", "account", "business"]),
            job_title: findVal(["job title", "title", "role", "position", "occupation"]),
            email: findVal(["email", "e-mail", "mail", "contact email"]),
            linkedin_url: findVal(["linkedin", "linkedin_url", "linkedin url", "profile", "social"]),
            country: findVal(["country", "location", "nation"]),
            timezone: findVal(["timezone", "tz", "time_zone"]) || "UTC",
            status: "active",
            current_step: 0,
          };
        }).filter((item) => item.email || item.linkedin_url);

        if (mapped.length === 0) {
          setErrorMsg("Could not find valid Email or LinkedIn columns in this CSV file.");
        } else {
          setParsedData(mapped);
        }
      },
      error: (err) => {
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleStartImport = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);
    setErrorMsg("");

    try {
      const res = await importLeadsBatch(parsedData);
      if (!res.success) {
        setErrorMsg(res.error || "Import failed.");
      } else {
        setImportResult({
          imported: res.imported || 0,
          skippedDuplicates: res.skippedDuplicates || 0,
          skippedSuppressed: res.skippedSuppressed || 0,
          totalReceived: res.totalReceived || 0,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Import failed unexpectedly.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={() => !isProcessing && onOpenChange(false)}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xl transition-all animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Import Leads from CSV
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bulk ingest prospect lists with duplicate detection and suppression safety checks
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Success summary */}
          {importResult && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Import Complete</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-center font-mono">
                <div className="p-2 rounded bg-background/50">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {importResult.imported}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Imported</div>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <div className="text-lg font-bold text-foreground">
                    {importResult.skippedDuplicates}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Duplicates Skipped</div>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {importResult.skippedSuppressed}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Suppressed Skipped</div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!importResult && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/60 hover:bg-accent/20 transition-all duration-150"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Click to select or drag and drop a CSV file"}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">
                Supports columns: First Name, Last Name, Email, LinkedIn, Company, Job Title, Country
              </span>
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && !importResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  File Preview (First 5 Rows)
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {parsedData.length} valid contacts detected
                </span>
              </div>

              <div className="rounded-lg border border-border overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border sticky top-0">
                    <tr>
                      {columns.slice(0, 6).map((col) => (
                        <th key={col} className="p-2 font-medium text-muted-foreground text-[11px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/30">
                        {columns.slice(0, 6).map((col) => (
                          <td key={col} className="p-2 text-foreground truncate max-w-[120px]">
                            {row[col] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {importResult ? "Close" : "Cancel"}
          </Button>

          {!importResult && (
            <Button
              type="button"
              size="sm"
              onClick={handleStartImport}
              disabled={isProcessing || parsedData.length === 0}
              className="shadow-xs font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                `Import ${parsedData.length} Leads`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
