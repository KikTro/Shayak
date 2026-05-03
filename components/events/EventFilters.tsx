"use client";

import { cn } from "@/lib/utils/cn";

interface EventFiltersProps {
  tags: string[];
  active: string[];
  onChange: (tags: string[]) => void;
}

export function EventFilters({ tags, active, onChange }: EventFiltersProps) {
  function toggle(t: string) {
    const next = active.includes(t) ? active.filter((x) => x !== t) : [...active, t];
    onChange(next);
  }

  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const on = active.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={cn(
              "min-h-[36px] border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors",
              on
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
