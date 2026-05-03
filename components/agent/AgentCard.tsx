"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import type { AgentType } from "@/types/agent";

interface AgentCardProps {
  agent: AgentType;
  status: "idle" | "running" | "error";
  stats: { label: string; value: string }[];
  primaryLabel: string;
  onPrimary: () => void;
  loading?: boolean;
}

const dotColor: Record<AgentType, string> = {
  scout: "bg-success",
  matchmaker: "bg-blue-400",
  catalyst: "bg-accent",
};

const titleMap: Record<AgentType, string> = {
  scout: "Scout",
  matchmaker: "Matchmaker",
  catalyst: "Catalyst",
};

export function AgentCard({ agent, status, stats, primaryLabel, onPrimary, loading }: AgentCardProps) {
  return (
    <div className="flex flex-col gap-6 border border-border p-8">
      <div className="flex items-center gap-3">
        <span className={cn("h-2 w-2 rounded-full", dotColor[agent])} />
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {titleMap[agent]}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {status}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </span>
            <span className="font-mono text-sm text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={onPrimary}
        loading={loading}
        iconRight={<ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
