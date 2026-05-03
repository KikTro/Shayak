import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { AgentAction, AgentStatus, AgentType } from "@/types/agent";

export async function logAgentAction(
  agentType: AgentType,
  action: string,
  input: Record<string, unknown> = {},
  requiresApproval = false,
): Promise<string> {
  const db = adminDb();
  const ref = db.collection("agentActions").doc();
  const payload: Omit<AgentAction, "createdAt"> & { createdAt: FieldValue } = {
    id: ref.id,
    agentType,
    action,
    status: "pending",
    input,
    requiresApproval,
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload);
  return ref.id;
}

export async function updateAgentAction(
  id: string,
  updates: Partial<{
    status: AgentStatus;
    output: Record<string, unknown>;
    approvedBy: string;
    approvedAt: FieldValue | Date;
  }>,
): Promise<void> {
  const db = adminDb();
  const patch: Record<string, unknown> = { ...updates };
  if (updates.status === "completed" || updates.status === "failed") {
    patch.completedAt = FieldValue.serverTimestamp();
  }
  await db.collection("agentActions").doc(id).set(patch, { merge: true });
}
