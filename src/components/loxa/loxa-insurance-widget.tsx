"use client";

import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { LoxaApi, LoxaInsurance, LoxaInsuranceResponse } from "@/lib/api/loxa";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface LoxaInsuranceWidgetProps {
  sku: string;
  price: number;
  productTitle: string;
  onInsuranceChange: (insurance: {
    code: string;
    inclusiveCode?: string;
    price: number;
  } | null) => void;
}

export function LoxaInsuranceWidget({
  sku,
  price,
  productTitle,
  onInsuranceChange,
}: LoxaInsuranceWidgetProps) {
  const [insuranceData, setInsuranceData] = useState<LoxaInsuranceResponse | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<LoxaInsurance | null>(null);
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarInsurance, setSidebarInsurance] = useState<LoxaInsurance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!sku || !price || !productTitle) {
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  LoxaApi.getInsuranceInfo(sku, price, productTitle)
    .then((data: LoxaInsuranceResponse | null) => {
      if (data && data.insurable && data.active) {
        setInsuranceData(data);

        if (data.integration_type === "inclusive") {
          // Inclusive: auto-select the free base plan
          const base = data.insurances.find(
            (i: LoxaInsurance) => i.is_base_insurance_product,
          );
          if (base) setSelectedInsurance(base);
        } else if (
          data.integration_type === "hybrid_extension" ||
          data.integration_type === "hybrid_warranty"
        ) {
          // Hybrid: select base (free) only — extension starts UN-added
          const base = data.insurances.find(
            (i: LoxaInsurance) => i.is_base_insurance_product,
          );
          if (base) setSelectedInsurance(base);
        }
        // addon: nothing auto-selected, checkbox starts unchecked
      }
    })
    .finally(() => setIsLoading(false));
}, [sku, price, productTitle]);


  // ── EFFECT 1: Fetch insurance data & set default selection ──────
useEffect(() => {
  if (!sku || !price || !productTitle) {
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  LoxaApi.getInsuranceInfo(sku, price, productTitle)
    .then((data: LoxaInsuranceResponse | null) => {
      if (data && data.insurable && data.active) {
        setInsuranceData(data);

        if (data.integration_type === "inclusive") {
          // Inclusive: auto-select the free base plan
          const base = data.insurances.find(
            (i: LoxaInsurance) => i.is_base_insurance_product,
          );
          if (base) setSelectedInsurance(base);
        } else if (
          data.integration_type === "hybrid_extension" ||
          data.integration_type === "hybrid_warranty"
        ) {
          // Hybrid: select base (free) only — extension starts UN-added
          const base = data.insurances.find(
            (i: LoxaInsurance) => i.is_base_insurance_product,
          );
          if (base) setSelectedInsurance(base);
        }
        // addon: nothing auto-selected, checkbox starts unchecked
      }
    })
    .finally(() => setIsLoading(false));
}, [sku, price, productTitle]);


// ── EFFECT 2: Notify parent when selection changes ──────────────
useEffect(() => {
  if (!insuranceData) return;

  if (isOptedOut || !selectedInsurance) {
    onInsuranceChange(null);
    return;
  }

  const integrationType = insuranceData.integration_type;

  if (integrationType === "addon") {
    onInsuranceChange({
      code: selectedInsurance.code,
      price: selectedInsurance.insurance_price,
    });
  } else if (integrationType === "inclusive") {
    onInsuranceChange({
      code: selectedInsurance.code,
      inclusiveCode: selectedInsurance.code,
      price: 0,
    });
  } else if (
    integrationType === "hybrid_extension" ||
    integrationType === "hybrid_warranty"
  ) {
    const base = insuranceData.insurances.find(
      (i: LoxaInsurance) => i.is_base_insurance_product,
    );

    if (selectedInsurance.extension && base) {
      // Extension is added → charge for it
      onInsuranceChange({
        code: selectedInsurance.code,
        inclusiveCode: base.code,
        price: selectedInsurance.insurance_price,
      });
    } else if (base && selectedInsurance.is_base_insurance_product) {
      onInsuranceChange({
        code: "",
        inclusiveCode: base.code,
        price: 0,
      });
    }
  }
}, [selectedInsurance, isOptedOut, insuranceData, onInsuranceChange]);

  if (isLoading || !insuranceData) return null;

  const integrationType = insuranceData.integration_type;
  const addons = insuranceData.insurances.filter(
    (i: LoxaInsurance) => i.pricing_type === "addon",
  );
  const inclusiveBase = insuranceData.insurances.find(
    (i: LoxaInsurance) => i.is_base_insurance_product,
  );
  const extensions = insuranceData.insurances.filter(
    (i: LoxaInsurance) => i.extension,
  );

  const openSidebar = (insurance: LoxaInsurance) => {
    setSidebarInsurance(insurance);
    setSidebarOpen(true);
  };

  // ── ADDON ──────────────────────────────────────────────────────
  if (integrationType === "addon") {
    const defaultAddon = addons.find((i: LoxaInsurance) => i.default_selected) || addons[0];
    if (!defaultAddon) return null;

    return (
      <div className="mt-4 space-y-2">
        <div
          className={cn(
            "rounded-xl border-2 p-4 transition-all",
          )}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
              checked={addons.some((a) => a.code === selectedInsurance?.code)}
              onChange={(e) => {
                if (!e.target.checked) {
                setSelectedInsurance(null);
              } else {
                setSelectedInsurance(defaultAddon);
              }
            }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  Add {defaultAddon.insurance_term}-Year Protection for £
                  {defaultAddon.insurance_price.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {defaultAddon.insurance_content?.description ||
                  "Covers accidental damage and structural defects."}
              </p>
              <button
                type="button"
                className="mt-1 text-xs font-medium text-blue-600 underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openSidebar(defaultAddon);
                }}
              >
                {defaultAddon.insurance_content?.learn_more || "Details"}
              </button>
            </div>
          </div>

          {addons.length > 1 && (
            <div className="mt-3 flex gap-2 pl-7">
              {addons.map((addon: LoxaInsurance) => (
                <button
                  type="button"
                  key={addon.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInsurance(addon);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-medium transition-all",
                    selectedInsurance?.code === addon.code
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 text-gray-600 hover:border-blue-400",
                  )}
                >
                  {addon.insurance_term} Year — £{addon.insurance_price.toFixed(2)}
                </button>
              ))}
            </div>
          )}
        </div>

        <LoxaSidebar
          insurance={sidebarInsurance}
          allOptions={addons}
          selectedCode={selectedInsurance?.code || null}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={(ins: LoxaInsurance) => {
            setSelectedInsurance(ins);
            setSidebarOpen(false);
          }}
        />
      </div>
    );
  }

  // ── INCLUSIVE ─────────────────────────────────────────────────
  if (integrationType === "inclusive" && inclusiveBase) {
    return (
      <div className="mt-4 space-y-2">
        {!isOptedOut ? (
          <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-800">
                  {inclusiveBase.insurance_term}-Year Protection Included Free
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  {inclusiveBase.insurance_content?.description}
                </p>
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-green-700 underline"
                  onClick={() => openSidebar(inclusiveBase)}
                >
                  {inclusiveBase.insurance_content?.learn_more || "Details"}
                </button>
                <button
                  type="button"
                  className="mt-2 block text-xs text-gray-400 underline"
                  onClick={() => {
                    setIsOptedOut(true);
                    setSelectedInsurance(null);
                  }}
                >
                  I don&apos;t want complimentary insurance
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {inclusiveBase.insurance_content?.opt_out_description ||
                  "You have opted out of free protection."}
              </span>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 underline"
                onClick={() => {
                  setIsOptedOut(false);
                  setSelectedInsurance(inclusiveBase);
                }}
              >
                {inclusiveBase.insurance_content?.opt_in_link || "Add Free Protection"}
              </button>
            </div>
          </div>
        )}

        <LoxaSidebar
          insurance={sidebarInsurance}
          allOptions={[inclusiveBase]}
          selectedCode={selectedInsurance?.code || null}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={(ins: LoxaInsurance) => {
            setSelectedInsurance(ins);
            setIsOptedOut(false);
            setSidebarOpen(false);
          }}
        />
      </div>
    );
  }

  // ── HYBRID ────────────────────────────────────────────────────
if (
  (integrationType === "hybrid_extension" || integrationType === "hybrid_warranty") &&
  inclusiveBase
) {
  const isExtensionAdded = extensions.some(
    (ext: LoxaInsurance) => selectedInsurance?.code === ext.code
  );

  return (
    <div className="mt-4 space-y-2">
      {/* Row 1: Free 3-Year — always shown, passive */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Free {inclusiveBase.insurance_term} Year Protection Included
            </p>
            <button
              type="button"
              className="mt-0.5 text-xs text-blue-600 underline"
              onClick={() => openSidebar(inclusiveBase)}
            >
              See details
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: 5-Year Extension upsell */}
      {extensions.map((ext: LoxaInsurance) => {
        const isAdded = selectedInsurance?.code === ext.code;
        return (
          <div
            key={ext.code}
            className={cn(
              "rounded-xl border-2 p-4 transition-all",
              isAdded ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Extend your protection to {ext.insurance_term} years for £
                  {ext.insurance_price.toFixed(2)}
                </p>
                <button
                  type="button"
                  className="mt-0.5 text-xs text-blue-600 underline"
                  onClick={() => openSidebar(ext)}
                >
                  See details
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInsurance(isAdded ? inclusiveBase : ext);
                  setIsOptedOut(false);
                }}
                className={cn(
                  "ml-4 shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                  isAdded
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                )}
              >
                {isAdded ? "✓ Added" : "+ Add"}
              </button>
            </div>
          </div>
        );
      })}

      <LoxaSidebar
        insurance={sidebarInsurance}
        allOptions={[inclusiveBase, ...extensions]}
        selectedCode={selectedInsurance?.code || null}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(ins: LoxaInsurance) => {
          setSelectedInsurance(ins);
          setSidebarOpen(false);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────

interface LoxaSidebarProps {
  insurance: LoxaInsurance | null;
  allOptions: LoxaInsurance[];
  selectedCode: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (insurance: LoxaInsurance) => void;
}

function LoxaSidebar({
  insurance,
  allOptions,
  selectedCode,
  open,
  onClose,
  onSelect,
}: LoxaSidebarProps) {
  if (!insurance) return null;

  const content = insurance.insurance_content?.sidebar_content;

  const renderTermLine = (
    line: string | { links: Record<string, string> },
    index: number,
  ): React.ReactNode => {
    if (typeof line === "object" && line.links) return null;

    const text = line as string;
    const hasTick = text.startsWith("{tick}");
    const cleanText = text.replace("{tick}", "").replace(/\{%.*?%\}/g, "");

    return (
      <li
        key={index}
        className={cn(
          "text-sm",
          hasTick ? "flex gap-2" : "mt-1 text-xs text-gray-500",
        )}
      >
        {hasTick && <span className="font-bold text-green-500">✓</span>}
        <span className={hasTick ? "text-gray-700" : ""}>{cleanText}</span>
      </li>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            {content?.header || insurance.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {content?.subheading && (
            <p className="text-sm text-gray-600">{content.subheading}</p>
          )}

          {content?.terms && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold">{content.terms.heading}</p>
              <ul className="space-y-2">
                {content.terms.lines.map(
                  (
                    line: string | { links: Record<string, string> },
                    i: number,
                  ) => renderTermLine(line, i),
                )}
              </ul>
              {content.footer_pill && (
                <div className="mt-3 rounded-full bg-green-100 px-3 py-1 text-center text-xs font-medium text-green-700">
                  {content.footer_pill}
                </div>
              )}
            </div>
          )}

          {allOptions.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Options</p>
              {allOptions.map((opt: LoxaInsurance) => (
                <button
                  type="button"
                  key={opt.code}
                  onClick={() => onSelect(opt)}
                  className={cn(
                    "w-full cursor-pointer rounded-lg border p-3 text-left text-sm transition-all",
                    selectedCode === opt.code
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300",
                  )}
                >
                  <span className="font-medium">{opt.insurance_term} Year</span>
                  {opt.insurance_price > 0 && (
                    <span className="ml-2 text-gray-500">
                      £{opt.insurance_price.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const toSelect =
                allOptions.find((o: LoxaInsurance) => o.code === selectedCode) ||
                allOptions[0];
              if (toSelect) onSelect(toSelect);
            }}
            className="w-full cursor-pointer rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Protection
          </button>

          {content?.legal_disclaimer && (
            <p className="text-[10px] leading-relaxed text-gray-400">
              {content.legal_disclaimer}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
}