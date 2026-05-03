"use client";

import { useMemo } from "react";

interface SkillGraphProps {
  skills: { skill: string; count: number }[];
}

/** Minimalist horizontal bar chart for top skills, styled editorially. */
export function SkillGraph({ skills }: SkillGraphProps) {
  const max = useMemo(() => skills.reduce((m, s) => Math.max(m, s.count), 0) || 1, [skills]);

  if (!skills.length) {
    return (
      <div className="border border-border p-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        No skill data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {skills.map((s) => {
        const pct = Math.max(4, Math.round((s.count / max) * 100));
        return (
          <div key={s.skill} className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
            <span className="truncate font-sans text-sm text-foreground">{s.skill}</span>
            <div className="h-[2px] w-full bg-border">
              <div className="h-[2px] bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{s.count}</span>
          </div>
        );
      })}
    </div>
  );
}
