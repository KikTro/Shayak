"use client";

import { useAgentLog } from "@/hooks/useAgentLog";
import { cn } from "@/lib/utils/cn";
import { timeAgo } from "@/lib/utils/dateUtils";
import type { AgentType } from "@/types/agent";

const dotColor: Record<AgentType, string> = {
  scout: "bg-success",
  matchmaker: "bg-blue-400",
  catalyst: "bg-accent",
};

const agentLabel: Record<AgentType, string> = {
  scout: "Scout",
  matchmaker: "Match",
  catalyst: "Catalyst",
};

export function AgentStatusStrip() {
  const { actions } = useAgentLog(12);

  const items = actions.length
    ? actions
    : [
        { id: "p1", agentType: "scout", action: "Idle · awaiting schedule" } as const,
        { id: "p2", agentType: "matchmaker", action: "Idle · awaiting signals" } as const,
        { id: "p3", agentType: "catalyst", action: "Idle · awaiting events" } as const,
      ];

  return (
    <div className="relative overflow-hidden border-y border-border bg-[#0F0F0F]">
      <div className="flex gap-12 whitespace-nowrap py-3 animate-marquee">
        {[...items, ...items].map((a, i) => {
          const agent = a.agentType as AgentType;
          const ts = "createdAt" in a ? timeAgo((a as { createdAt: unknown }).createdAt as never) : "now";
          return (
            <div key={`${a.id}-${i}`} className="flex shrink-0 items-center gap-3">
              <span className={cn("h-2 w-2 rounded-full", dotColor[agent])} />
              <span className="font-mono text-[11px] uppercase tracking-widest text-foreground">
                {agentLabel[agent]}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {a.action}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground/70">
                · {ts}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
