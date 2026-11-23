"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  badge?: string;
  badgeClassName?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  align?: "start" | "end" | "center";
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  disabled = false,
  searchable = false,
  align = "start",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
    );
  }, [options, search]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block w-full select-none", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-card px-3 text-xs sm:text-sm text-foreground shadow-2xs transition-all duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          isOpen && "border-primary/60 ring-1 ring-primary/30 bg-muted/30"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {selectedOption?.icon && (
            <selectedOption.icon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                selectedOption.iconColor || "text-muted-foreground"
              )}
            />
          )}

          <span className={cn("truncate font-medium text-xs", !selectedOption && "text-muted-foreground font-normal")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span
              className={cn(
                "ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/60 shrink-0",
                selectedOption.badgeClassName
              )}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
            isOpen && "rotate-180 text-foreground"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 max-h-64 min-w-[13rem] w-full overflow-hidden rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150",
            align === "end" ? "right-0" : "left-0"
          )}
          role="listbox"
        >
          {searchable && options.length > 5 && (
            <div className="p-1 border-b border-border/60 mb-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search options..."
                  className="w-full rounded-md bg-muted/40 pl-7 pr-2 py-1 text-xs outline-none placeholder:text-muted-foreground text-foreground border border-border/50 focus:border-primary/50"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No matching options
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors duration-150 cursor-pointer group",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-colors",
                            option.iconColor || (isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")
                          )}
                        />
                      )}

                      <div className="truncate">
                        <div className="truncate leading-tight text-xs">{option.label}</div>
                        {option.description && (
                          <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {option.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/60",
                            option.badgeClassName
                          )}
                        >
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
