import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { generateJSON } from "@/lib/agents/gemini";
import { logAgentAction, updateAgentAction } from "@/lib/agents/common";
import type { DeveloperGraphNode } from "@/types/developer";

interface MatchOutput {
  matchReason: string;
  draftMessage: string;
  confidenceScore: number;
}

const MATCH_PROMPT = (a: DeveloperGraphNode, b: DeveloperGraphNode) => `
You are the Matchmaker Agent for Sahayak.

You have two developer profiles:

Developer A: ${JSON.stringify({
    uid: a.uid,
    name: a.displayName,
    skills: a.skills,
    interests: a.interests,
    recentProjects: a.recentProjects,
  })}

Developer B: ${JSON.stringify({
    uid: b.uid,
    name: b.displayName,
    skills: b.skills,
    interests: b.interests,
    recentProjects: b.recentProjects,
  })}

Your job:
1. Assess why these two people should meet (be specific, not generic).
2. Draft a warm, personal, brief intro message (max 3 sentences) that:
   - References a specific skill or project from each person
   - Explains the concrete benefit of the connection
   - Sounds like a thoughtful human community manager wrote it
   - Does NOT sound like AI or a template

Output JSON: { "matchReason": string, "draftMessage": string, "confidenceScore": number }
`;

function scoreOverlap(a: string[], b: string[]): number {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const overlap = a.filter((s) => setB.has(s.toLowerCase())).length;
  return overlap / Math.max(1, Math.min(a.length, b.length));
}

export async function getSimilarDevelopers(
  uid: string,
  limit = 5,
): Promise<DeveloperGraphNode[]> {
  const db = adminDb();
  const self = await db.collection("developerGraph").doc(uid).get();
  if (!self.exists) return [];
  const selfData = self.data() as DeveloperGraphNode;

  const others = await db.collection("developerGraph").limit(50).get();
  return others.docs
    .map((d) => ({ ...(d.data() as DeveloperGraphNode), uid: d.id }))
    .filter((n) => n.uid !== uid)
    .map((n) => ({ node: n, score: scoreOverlap(selfData.skills, n.skills) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.node);
}

export async function getComplementaryDevelopers(
  uid: string,
  limit = 5,
): Promise<DeveloperGraphNode[]> {
  const db = adminDb();
  const self = await db.collection("developerGraph").doc(uid).get();
  if (!self.exists) return [];
  const selfData = self.data() as DeveloperGraphNode;
  const selfSet = new Set(selfData.skills.map((s) => s.toLowerCase()));

  const others = await db.collection("developerGraph").limit(50).get();
  return others.docs
    .map((d) => ({ ...(d.data() as DeveloperGraphNode), uid: d.id }))
    .filter((n) => n.uid !== uid)
    .map((n) => {
      const novel = n.skills.filter((s) => !selfSet.has(s.toLowerCase())).length;
      const shared = n.skills.length - novel;
      // Complementary = some shared interests but significant novel skills
      const score = (novel / Math.max(1, n.skills.length)) * 0.7 + (shared > 0 ? 0.3 : 0);
      return { node: n, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.node);
}

export async function matchmakerRun(uid: string): Promise<{ created: number; actionId: string }> {
  const actionId = await logAgentAction("matchmaker", `Evaluating matches for ${uid}`, { uid });
  try {
    await updateAgentAction(actionId, { status: "running" });
    const db = adminDb();

    const selfSnap = await db.collection("developerGraph").doc(uid).get();
    if (!selfSnap.exists) {
      await updateAgentAction(actionId, { status: "failed", output: { reason: "no_graph_node" } });
      return { created: 0, actionId };
    }
    const self = { ...(selfSnap.data() as DeveloperGraphNode), uid };

    const [similar, complementary] = await Promise.all([
      getSimilarDevelopers(uid, 3),
      getComplementaryDevelopers(uid, 3),
    ]);
    const candidates = dedupeByUid([...similar, ...complementary]).slice(0, 4);

    let created = 0;
    for (const other of candidates) {
      const match = await generateJSON<MatchOutput>(MATCH_PROMPT(self, other));
      if (!match || match.confidenceScore < 0.55) continue;

      const reqRef = db.collection("introRequests").doc();
      await reqRef.set({
        id: reqRef.id,
        fromUid: uid,
        toUid: other.uid,
        matchReason: match.matchReason,
        draftMessage: match.draftMessage,
        confidenceScore: match.confidenceScore,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
      created += 1;
    }

    await updateAgentAction(actionId, {
      status: "completed",
      output: { created, evaluated: candidates.length },
    });
    return { created, actionId };
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
    throw err;
  }
}

function dedupeByUid(nodes: DeveloperGraphNode[]): DeveloperGraphNode[] {
  const seen = new Set<string>();
  const out: DeveloperGraphNode[] = [];
  for (const n of nodes) {
    if (seen.has(n.uid)) continue;
    seen.add(n.uid);
    out.push(n);
  }
  return out;
}

export async function approveIntroRequest(
  requestId: string,
  approverUid: string,
): Promise<void> {
  const db = adminDb();
  const ref = db.collection("introRequests").doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("not_found");
  const req = snap.data() as { fromUid: string; toUid: string; draftMessage: string };

  await ref.set(
    {
      status: "approved",
      approvedBy: approverUid,
      approvedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  // Create a DM chat room
  const roomId = `dm_${[req.fromUid, req.toUid].sort().join("_")}`;
  await db.collection("chats").doc(roomId).set(
    {
      id: roomId,
      type: "dm",
      name: "Sahayak Introduction",
      participants: [req.fromUid, req.toUid],
      createdBy: "matchmaker",
      createdAt: FieldValue.serverTimestamp(),
      isPublic: false,
    },
    { merge: true },
  );

  // Post the drafted intro
  await db.collection("chats").doc(roomId).collection("messages").add({
    senderId: "matchmaker",
    senderName: "Matchmaker Agent",
    senderPhotoURL: "",
    text: req.draftMessage,
    reactions: {},
    sentAt: FieldValue.serverTimestamp(),
    deleted: false,
  });

  await ref.set({ status: "sent", sentAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function rejectIntroRequest(
  requestId: string,
  approverUid: string,
): Promise<void> {
  const db = adminDb();
  await db.collection("introRequests").doc(requestId).set(
    {
      status: "rejected",
      approvedBy: approverUid,
      approvedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
