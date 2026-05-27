"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductSpec } from "@/types";

type Row = ProductSpec & { key: string };

let _rowKey = 0;
const nextKey = () => `r${++_rowKey}`;

const SUGGESTED_LABELS = [
  "Material",
  "Pattern",
  "Type",
  "Brand",
  "Color",
  "Usage / Application",
  "Size",
  "Strap Type",
  "Country of Origin",
];

type Props = {
  defaultValue?: ProductSpec[];
};

export function SpecsEditor({ defaultValue = [] }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    defaultValue.length > 0
      ? defaultValue.map((s) => ({ ...s, key: nextKey() }))
      : [{ label: "", value: "", key: nextKey() }],
  );

  function addRow(initialLabel = "") {
    setRows((prev) => [
      ...prev,
      { label: initialLabel, value: "", key: nextKey() },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) =>
      prev.length === 1
        ? [{ label: "", value: "", key: nextKey() }]
        : prev.filter((r) => r.key !== key),
    );
  }

  function patchRow(key: string, patch: Partial<ProductSpec>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function move(key: string, direction: -1 | 1) {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.key === key);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const usedLabels = new Set(
    rows.map((r) => r.label.trim().toLowerCase()).filter(Boolean),
  );
  const suggestions = SUGGESTED_LABELS.filter(
    (s) => !usedLabels.has(s.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={row.key}
            className="group/spec border-border bg-background hover:border-foreground/20 flex items-center gap-2 rounded-lg border p-2 transition-colors"
          >
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                onClick={() => move(row.key, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="text-muted-foreground hover:text-foreground grid size-4 place-items-center text-[10px] leading-none disabled:opacity-30 disabled:hover:text-muted-foreground"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(row.key, 1)}
                disabled={i === rows.length - 1}
                aria-label="Move down"
                className="text-muted-foreground hover:text-foreground grid size-4 place-items-center text-[10px] leading-none disabled:opacity-30 disabled:hover:text-muted-foreground"
              >
                ▼
              </button>
            </div>

            <GripVertical
              className="text-muted-foreground/40 size-4 shrink-0"
              aria-hidden
            />

            <Input
              name="specsLabel"
              value={row.label}
              onChange={(e) => patchRow(row.key, { label: e.target.value })}
              placeholder="Label (e.g. Material)"
              className="h-9 flex-1 text-sm"
              autoComplete="off"
              list="specs-label-suggestions"
            />
            <Input
              name="specsValue"
              value={row.value}
              onChange={(e) => patchRow(row.key, { value: e.target.value })}
              placeholder="Value (e.g. PU Leather)"
              className="h-9 flex-[1.4] text-sm"
              autoComplete="off"
            />

            <button
              type="button"
              onClick={() => removeRow(row.key)}
              aria-label="Remove row"
              className={cn(
                "text-muted-foreground hover:text-destructive grid size-8 shrink-0 place-items-center rounded-md transition-colors",
                "opacity-0 group-hover/spec:opacity-100 focus:opacity-100",
              )}
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <datalist id="specs-label-suggestions">
        {SUGGESTED_LABELS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addRow()}
        >
          <Plus className="size-3.5" />
          Add row
        </Button>

        {suggestions.length > 0 && (
          <>
            <span className="text-muted-foreground/70 text-[11px]">
              Quick add:
            </span>
            {suggestions.slice(0, 6).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => addRow(label)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent border-border rounded-full border px-2.5 py-1 text-[11px] transition-colors"
              >
                {label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
