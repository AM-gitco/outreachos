"use client";

import * as React from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  RotateCcw,
  Clock,
  TrendingUp,
  CalendarDays
} from "lucide-react";
import { formatDateShort, cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

export type PresetRangeKey = "today" | "yesterday" | "7d" | "30d" | "this_month" | "custom";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange, presetKey: PresetRangeKey) => void;
  className?: string;
}

const PRESETS: { key: PresetRangeKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "today", label: "Today", icon: Clock },
  { key: "yesterday", label: "Yesterday", icon: Clock },
  { key: "7d", label: "Last 7 days", icon: TrendingUp },
  { key: "30d", label: "Last 30 days", icon: CalendarDays },
  { key: "this_month", label: "This month", icon: CalendarIcon },
];

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<PresetRangeKey>("30d");

  // Calendar month navigation
  const [viewDate, setViewDate] = React.useState<Date>(() => value?.to || new Date());
  const [tempFrom, setTempFrom] = React.useState<Date | null>(() => value?.from || null);
  const [tempTo, setTempTo] = React.useState<Date | null>(() => value?.to || null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  const pickerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal temp range with value prop when opened
  React.useEffect(() => {
    if (value) {
      setTempFrom(value.from);
      setTempTo(value.to);
    }
  }, [value, isOpen]);

  const getPresetRange = (key: PresetRangeKey): DateRange => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (key) {
      case "today":
        return { from: todayStart, to: todayEnd };
      case "yesterday": {
        const yStart = new Date(todayStart);
        yStart.setDate(yStart.getDate() - 1);
        const yEnd = new Date(todayEnd);
        yEnd.setDate(yEnd.getDate() - 1);
        return { from: yStart, to: yEnd };
      }
      case "7d": {
        const from = new Date(todayStart);
        from.setDate(from.getDate() - 6);
        return { from, to: todayEnd };
      }
      case "30d": {
        const from = new Date(todayStart);
        from.setDate(from.getDate() - 29);
        return { from, to: todayEnd };
      }
      case "this_month": {
        const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return { from, to: todayEnd };
      }
      default:
        return value || { from: todayStart, to: todayEnd };
    }
  };

  const handleSelectPreset = (key: PresetRangeKey) => {
    setActivePreset(key);
    const range = getPresetRange(key);
    setTempFrom(range.from);
    setTempTo(range.to);
    setViewDate(new Date(range.to));
    onChange(range, key);
    setIsOpen(false);
  };

  const handleDayClick = (day: Date) => {
    setActivePreset("custom");
    if (!tempFrom || (tempFrom && tempTo)) {
      // Start new range
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
      setTempFrom(start);
      setTempTo(null);
    } else if (tempFrom && !tempTo) {
      // Finish range
      if (day < tempFrom) {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
        const end = new Date(tempFrom.getFullYear(), tempFrom.getMonth(), tempFrom.getDate(), 23, 59, 59, 999);
        setTempFrom(start);
        setTempTo(end);
      } else {
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
        setTempTo(end);
      }
    }
  };

  const handleApplyCustomRange = () => {
    if (tempFrom && tempTo) {
      onChange({ from: tempFrom, to: tempTo }, "custom");
      setActivePreset("custom");
      setIsOpen(false);
    } else if (tempFrom && !tempTo) {
      const end = new Date(tempFrom.getFullYear(), tempFrom.getMonth(), tempFrom.getDate(), 23, 59, 59, 999);
      onChange({ from: tempFrom, to: end }, "custom");
      setActivePreset("custom");
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    handleSelectPreset("30d");
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayLabel = React.useMemo(() => {
    if (activePreset === "today") {
      return `Today (${formatDateShort(new Date())})`;
    }
    if (activePreset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return `Yesterday (${formatDateShort(y)})`;
    }
    if (activePreset === "7d") return "Last 7 days";
    if (activePreset === "30d") return "Last 30 days";
    if (activePreset === "this_month") return "This month";
    if (value?.from && value?.to) {
      return `${formatDateShort(value.from)} – ${formatDateShort(value.to)}`;
    }
    return "Select date range";
  }, [activePreset, value]);

  // Calendar days generation
  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; currentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        currentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        currentMonth: true,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          currentMonth: false,
        });
      }
    }

    return days;
  }, [viewDate]);

  const isSameDay = (d1?: Date | null, d2?: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (date: Date) => {
    if (!tempFrom) return false;
    const targetEnd = tempTo || hoverDate;
    if (!targetEnd) return isSameDay(date, tempFrom);

    const start = tempFrom < targetEnd ? tempFrom : targetEnd;
    const end = tempFrom < targetEnd ? targetEnd : tempFrom;

    const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const sTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const eTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

    return dTime >= sTime && dTime <= eTime;
  };

  return (
    <div ref={pickerRef} className={cn("relative inline-block select-none", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-8 sm:h-9 items-center gap-2 rounded-md border border-border bg-card px-2.5 sm:px-3 text-xs font-medium text-foreground shadow-2xs hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all duration-150 cursor-pointer",
          isOpen && "border-primary/60 ring-1 ring-primary/30 bg-muted/40"
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground tracking-tight leading-none text-xs">
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1",
            isOpen && "rotate-180 text-foreground"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-[320px] sm:w-[500px] rounded-lg border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 text-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Left: Quick Presets */}
            <div className="sm:w-36 space-y-1 sm:border-r sm:border-border/60 sm:pr-2.5 shrink-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Presets</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="hover:text-foreground text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-pointer"
                  title="Reset to 30 days"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 pt-1">
                {PRESETS.map((p) => {
                  const isSelected = activePreset === p.key;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleSelectPreset(p.key)}
                      className={cn(
                        "flex items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className={cn("h-3 w-3", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate">{p.label}</span>
                      </div>
                      {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Custom Interactive Calendar */}
            <div className="flex-1 space-y-2">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-foreground text-xs">
                  {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
                    }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
                    }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-muted-foreground uppercase">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
                  <div key={wd} className="py-0.5">
                    {wd}
                  </div>
                ))}
              </div>

              {/* Month Day Grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                {calendarDays.map((item, idx) => {
                  const isStart = isSameDay(item.date, tempFrom);
                  const isEnd = isSameDay(item.date, tempTo);
                  const inRange = isInRange(item.date);
                  const isToday = isSameDay(item.date, new Date());

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDayClick(item.date)}
                      onMouseEnter={() => {
                        if (tempFrom && !tempTo) setHoverDate(item.date);
                      }}
                      className={cn(
                        "h-7 w-full flex items-center justify-center text-[11px] tabular-nums transition-colors cursor-pointer rounded-xs",
                        !item.currentMonth && "text-muted-foreground/30",
                        item.currentMonth && !inRange && "text-foreground hover:bg-muted",
                        inRange && "bg-primary/10 text-primary",
                        (isStart || isEnd) &&
                          "bg-primary text-primary-foreground font-semibold rounded-md shadow-2xs hover:bg-primary/90",
                        isToday && !isStart && !isEnd && "border border-primary/40 font-semibold"
                      )}
                    >
                      {item.date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Range summary & Action footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                <div className="truncate text-muted-foreground">
                  {tempFrom ? (
                    <span>
                      <strong className="text-foreground">{formatDateShort(tempFrom)}</strong>
                      {tempTo ? (
                        <>
                          {" "}– <strong className="text-foreground">{formatDateShort(tempTo)}</strong>
                        </>
                      ) : (
                        " – Select end date"
                      )}
                    </span>
                  ) : (
                    <span>Click a date to start range</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-1 rounded text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!tempFrom}
                    onClick={handleApplyCustomRange}
                    className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
