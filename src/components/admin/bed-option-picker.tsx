"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useBedOptions } from "@/hooks/use-bed-options";
import { BedOptionType } from "@/lib/api/bed-options";
import { ChevronDown, Loader2 } from "lucide-react";

export interface SelectedBedOption {
  label: string;
  charge: number;
  height_cm?: number;
}

export function BedOptionCatalogPicker({
  type,
  label,
  selected,
  onChange,
  disabled,
}: {
  type: BedOptionType;
  label: string;
  selected: SelectedBedOption[];
  onChange: (options: SelectedBedOption[]) => void;
  disabled?: boolean;
}) {
  const { data: catalogOptions = [], isLoading } = useBedOptions({ type, onlyActive: true });
  const [isOpen, setIsOpen] = useState(false);

  const isChecked = (catalogLabel: string) =>
    selected.some((s) => s.label === catalogLabel);

  const toggle = (opt: { label: string; charge: number; height_cm?: number | null }) => {
    if (isChecked(opt.label)) {
      onChange(selected.filter((s) => s.label !== opt.label));
    } else {
      onChange([
        ...selected,
        { label: opt.label, charge: opt.charge, ...(opt.height_cm != null ? { height_cm: opt.height_cm } : {}) },
      ]);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-md border p-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        <span>
          {label}
          {selected.length > 0 && (
            <span className="text-muted-foreground ml-2 font-normal">
              ({selected.length} selected)
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        {isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 p-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading options...
          </div>
        ) : catalogOptions.length === 0 ? (
          <p className="text-muted-foreground p-2 text-xs">
            No {label.toLowerCase()} options in the catalog yet.{" "}
            <a href="/admin/bed-options" target="_blank" className="underline">
              Add some here
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {catalogOptions.map((opt) => (
              <label
                key={opt.id}
                className="hover:bg-muted flex cursor-pointer items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked(opt.label)}
                    onCheckedChange={() => toggle(opt)}
                    disabled={disabled}
                  />
                  <span>
                    {opt.label}
                    {opt.height_cm != null ? ` (${opt.height_cm}cm)` : ""}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {opt.charge > 0 ? `+£${opt.charge.toFixed(2)}` : "Free"}
                </span>
              </label>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}