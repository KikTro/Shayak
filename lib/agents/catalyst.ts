import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";
import { generateJSON } from "@/lib/agents/gemini";
import { logAgentAction, updateAgentAction } from "@/lib/agents/common";
import type { SahayakEvent } from "@/types/event";

type PostType = "shoutout" | "reminder" | "teamup" | "reflection" | "welcome";

interface CatalystOutput {
  text: string;
  type: PostType;
}

const CATALYST_PROMPT = (context: Record<string, unknown>) => `
You are the Catalyst Agent for Sahayak, the community voice.
Context:
${JSON.stringify(context, null, 2)}

Generate a community post that:
- Feels authentic and human, like a community manager who genuinely cares
- Is concise (max 280 characters for social, max 500 for channel posts)
- Includes a clear call to action
- Uses the community's language (builders, makers, the Kolkata tech scene)
- NEVER uses corporate jargon or emoji overuse (max 2 emojis per post)

Output strict JSON: { "text": string, "type": "shoutout" | "reminder" | "teamup" | "reflection" | "welcome" }
`;

async function postToChannel(channelId: string, text: string): Promise<void> {
  const db = adminDb();
  await db
    .collection("chats")
    .doc(channelId)
    .collection("messages")
    .add({
      senderId: "catalyst",
      senderName: "Catalyst Agent",
      senderPhotoURL: "",
      text,
      reactions: {},
      sentAt: FieldValue.serverTimestamp(),
      deleted: false,
    });

  await db.collection("chats").doc(channelId).set(
    {
      lastMessage: {
        text,
        senderName: "Catalyst Agent",
        sentAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true },
  );
}

async function ensureChannel(id: string, name: string): Promise<void> {
  const db = adminDb();
  const ref = db.collection("chats").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      id,
      type: "channel",
      name,
      participants: [],
      createdBy: "catalyst",
      createdAt: FieldValue.serverTimestamp(),
      isPublic: true,
    });
  }
}

export async function catalystShoutoutForEvent(eventId: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection("events").doc(eventId).get();
  if (!snap.exists) return;
  const event = snap.data() as SahayakEvent;

  const actionId = await logAgentAction(
    "catalyst",
    `Crafting shoutout for "${event.title}"`,
    { eventId },
  );

  try {
    await updateAgentAction(actionId, { status: "running" });
    const out = await generateJSON<CatalystOutput>(
      CATALYST_PROMPT({
        kind: "new_event",
        title: event.title,
        description: event.description,
        chapter: event.gdgChapter,
        venue: event.location?.venueName,
        city: event.location?.city,
        tags: event.tags,
        startTime: event.startTime,
      }),
    );

    if (out?.text) {
      await ensureChannel("general", "# general");
      await postToChannel("general", out.text);
      await db.collection("events").doc(eventId).set(
        { agentShoutoutGenerated: true },
        { merge: true },
      );
    }

    await updateAgentAction(actionId, {
      status: "completed",
      output: { posted: !!out?.text },
    });
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
  }
}

export async function catalystReminderForEvent(eventId: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection("events").doc(eventId).get();
  if (!snap.exists) return;
  const event = snap.data() as SahayakEvent;
  const attending = event.attendees?.length ?? 0;
  const cap = event.maxAttendees ?? 0;
  if (cap && attending / cap >= 0.3) return; // only FOMO if under-filled

  const actionId = await logAgentAction(
    "catalyst",
    `FOMO reminder for "${event.title}"`,
    { eventId, attending, cap },
  );
  try {
    await updateAgentAction(actionId, { status: "running" });
    const out = await generateJSON<CatalystOutput>(
      CATALYST_PROMPT({
        kind: "under_filled_event",
        hoursToStart: 24,
        title: event.title,
        attending,
        cap,
        tags: event.tags,
      }),
    );
    if (out?.text) {
      await ensureChannel("general", "# general");
      await postToChannel("general", out.text);
      await sendPushToRelevant(event.tags ?? [], `Join "${event.title}"`, out.text);
    }
    await updateAgentAction(actionId, {
      status: "completed",
      output: { posted: !!out?.text },
    });
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
  }
}

export async function catalystTeamUpForHackathon(eventId: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection("events").doc(eventId).get();
  if (!snap.exists) return;
  const event = snap.data() as SahayakEvent;
  const isHack = event.tags?.some((t) => /hack/i.test(t));
  if (!isHack) return;

  const actionId = await logAgentAction(
    "catalyst",
    `Team-up thread for "${event.title}"`,
    { eventId },
  );
  try {
    await updateAgentAction(actionId, { status: "running" });
    const out = await generateJSON<CatalystOutput>(
      CATALYST_PROMPT({
        kind: "hackathon_teamup",
        title: event.title,
        tags: event.tags,
      }),
    );
    if (out?.text) {
      await ensureChannel("general", "# general");
      await postToChannel("general", out.text);
    }
    await updateAgentAction(actionId, {
      status: "completed",
      output: { posted: !!out?.text },
    });
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
  }
}

export async function catalystWelcome(uid: string, displayName: string): Promise<void> {
  const actionId = await logAgentAction("catalyst", `Welcome post for ${displayName}`, { uid });
  try {
    await updateAgentAction(actionId, { status: "running" });
    const out = await generateJSON<CatalystOutput>(
      CATALYST_PROMPT({ kind: "welcome_new_member", name: displayName }),
    );
    if (out?.text) {
      await ensureChannel("general", "# general");
      await postToChannel("general", out.text);
    }
    await updateAgentAction(actionId, { status: "completed", output: { posted: !!out?.text } });
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
  }
}

export async function catalystReflection(eventId: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection("events").doc(eventId).get();
  if (!snap.exists) return;
  const event = snap.data() as SahayakEvent;

  const actionId = await logAgentAction("catalyst", `Reflection post for "${event.title}"`, { eventId });
  try {
    await updateAgentAction(actionId, { status: "running" });
    const out = await generateJSON<CatalystOutput>(
      CATALYST_PROMPT({ kind: "post_event_reflection", title: event.title }),
    );
    if (out?.text) {
      await postToChannel(event.chatRoomId ?? "general", out.text);
    }
    await updateAgentAction(actionId, { status: "completed", output: { posted: !!out?.text } });
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
  }
}

async function sendPushToRelevant(
  tags: string[],
  title: string,
  body: string,
): Promise<void> {
  try {
    const db = adminDb();
    const users = await db
      .collection("users")
      .where("skills", "array-contains-any", tags.slice(0, 10))
      .limit(200)
      .get();

    const tokens = users.docs
      .flatMap((d) => (d.data() as { notificationTokens?: string[] }).notificationTokens ?? [])
      .filter(Boolean);
    if (!tokens.length) return;
    await adminMessaging().sendEachForMulticast({
      tokens: tokens.slice(0, 500),
      notification: { title, body },
    });
  } catch (err) {
    console.warn("[catalyst] push failed", err);
  }
}
