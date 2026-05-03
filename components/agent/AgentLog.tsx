"use client";

import { useAgentLog } from "@/hooks/useAgentLog";
import { cn } from "@/lib/utils/cn";
import { formatTime, timeAgo } from "@/lib/utils/dateUtils";
import type { AgentStatus, AgentType } from "@/types/agent";

const statusColor: Record<AgentStatus, string> = {
  pending: "text-muted-foreground border-border",
  running: "text-accent border-accent",
  completed: "text-success border-success",
  failed: "text-danger border-danger",
};

const agentColor: Record<AgentType, string> = {
  scout: "text-success",
  matchmaker: "text-blue-400",
  catalyst: "text-accent",
};

export function AgentLog() {
  const { actions, loading } = useAgentLog(40);

  return (
    <div className="border border-border">
      <div className="border-b border-border px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Live Agent Log
        </span>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {loading && actions.length === 0 ? (
          <div className="p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading…
          </div>
        ) : null}
        {actions.map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
          >
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatTime(a.createdAt)}
            </span>
            <span className={cn("font-mono text-[10px] uppercase tracking-widest", agentColor[a.agentType])}>
              {a.agentType}
            </span>
            <span className="truncate font-sans text-sm text-foreground">{a.action}</span>
            <span className="flex items-center gap-3">
              <span className="hidden font-mono text-[10px] text-muted-foreground md:inline">
                {timeAgo(a.createdAt)}
              </span>
              <span
                className={cn(
                  "border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                  statusColor[a.status],
                )}
              >
                {a.status}
              </span>
            </span>
          </div>
        ))}
        {actions.length === 0 && !loading ? (
          <div className="p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No agent activity yet
          </div>
        ) : null}
      </div>
    </div>
  );
}
