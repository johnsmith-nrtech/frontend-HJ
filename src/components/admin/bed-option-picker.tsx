"use client";

import { useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useBedOptions, useMattressTypes } from "@/hooks/use-bed-options";
import { BedOptionType } from "@/lib/api/bed-options";
import { ChevronDown, Loader2 } from "lucide-react";


export interface SelectedBedOption {
  label: string;
  charge: number;
  height_cm?: number;
  image_url?: string;
  type_id?: string;
}

export interface SelectedMattressType {
  id: string;
  name: string;
  image_url?: string | null;
}
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";



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

    const toggle = (opt: { label: string; charge: number; height_cm?: number | null; image_url?: string | null }) => {
    if (isChecked(opt.label)) {
      onChange(selected.filter((s) => s.label !== opt.label));
    } else {
      onChange([
        ...selected,
        {
          label: opt.label,
          charge: opt.charge,
          ...(opt.height_cm != null ? { height_cm: opt.height_cm } : {}),
          ...(opt.image_url ? { image_url: opt.image_url } : {}),
        },
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
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md border p-2 text-sm hover:bg-muted"
              >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked(opt.label)}
                  onCheckedChange={() => toggle(opt)}
                  disabled={disabled}
                />
                {opt.image_url && (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border">
                    <Image src={opt.image_url} alt={opt.label} fill className="object-cover" />
                  </div>
                )}
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

// ── Mattress Type Picker ─────────────────────────────────────────
// Same collapsible checkbox-list UI as BedOptionCatalogPicker, but
// sourced from mattress TYPES (name + image) instead of the flat
// bed-options catalog. Multiple types can be checked; each checked
// type is then offered to the customer as a selectable mattress
// option on the product page — same shape (label/charge/image_url)
// as headboard/storage/wing/base options so it plugs into the
// existing bed_options.mattress_options rendering there.

export function MattressTypeCatalogPicker({
  selected,
  onChange,
  disabled,
}: {
  selected: SelectedBedOption[];
  onChange: (options: SelectedBedOption[]) => void;
  disabled?: boolean;
}) {
  const { data: mattressTypes = [], isLoading } = useMattressTypes(true);
  const [isOpen, setIsOpen] = useState(false);

  const isChecked = (name: string) => selected.some((s) => s.label === name);

  const toggle = (type: { id: string; name: string; image_url?: string | null }) => {
    if (isChecked(type.name)) {
      onChange(selected.filter((s) => s.label !== type.name));
    } else {
      onChange([
        ...selected,
        {
          label: type.name,
          charge: 0,
          type_id: type.id,
          ...(type.image_url ? { image_url: type.image_url } : {}),
        },
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
          Mattress Type
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
            <Loader2 className="h-4 w-4 animate-spin" /> Loading mattress types...
          </div>
        ) : mattressTypes.length === 0 ? (
          <p className="text-muted-foreground p-2 text-xs">
            No mattress types in the catalog yet.{" "}
            <a href="/admin/bed-options" target="_blank" className="underline">
              Add some here
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {mattressTypes.map((type) => (
              <label
                key={type.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md border p-2 text-sm hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked(type.name)}
                    onCheckedChange={() => toggle(type)}
                    disabled={disabled}
                  />
                  {type.image_url && (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border">
                      <Image src={type.image_url} alt={type.name} fill className="object-cover" />
                    </div>
                  )}
                  <span>{type.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}