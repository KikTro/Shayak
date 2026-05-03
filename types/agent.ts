import type { Timestamp } from "firebase/firestore";

export type AgentType = "scout" | "matchmaker" | "catalyst";
export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface AgentAction {
  id: string;
  agentType: AgentType;
  action: string;
  status: AgentStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
}

export type IntroRequestStatus = "pending" | "approved" | "sent" | "rejected";

export interface IntroRequest {
  id: string;
  fromUid: string;
  toUid: string;
  matchReason: string;
  draftMessage: string;
  confidenceScore?: number;
  status: IntroRequestStatus;
  approvedBy?: string;
  sentAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface AgentStats {
  agentType: AgentType;
  status: "idle" | "running" | "error";
  lastRunAt?: Timestamp | Date;
  totalRuns: number;
  queueSize: number;
  summary: string;
}
