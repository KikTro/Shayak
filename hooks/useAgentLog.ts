"use client";

import { useEffect, useState } from "react";
import { limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { agentActionsCol } from "@/lib/firebase/firestore";
import type { AgentAction } from "@/types/agent";

export function useAgentLog(max = 30) {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(agentActionsCol(), orderBy("createdAt", "desc"), limit(max));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setActions(snap.docs.map((d) => ({ ...(d.data() as AgentAction), id: d.id })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [max]);

  return { actions, loading };
}
