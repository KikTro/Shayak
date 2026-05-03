import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

/**
 * On new chat message → push notification to other participants.
 */
export const fcmNotifier = onDocumentCreated(
  "chats/{roomId}/messages/{messageId}",
  async (event) => {
    const msg = event.data?.data();
    if (!msg) return;
    const { senderId, senderName, text } = msg as {
      senderId: string;
      senderName: string;
      text: string;
    };

    const db = getFirestore();
    const roomSnap = await db.collection("chats").doc(event.params.roomId).get();
    if (!roomSnap.exists) return;
    const room = roomSnap.data() as { participants?: string[]; name?: string; type?: string };

    const recipients = (room.participants ?? []).filter((u) => u !== senderId);
    if (recipients.length === 0) return;

    const userSnaps = await Promise.all(
      recipients.map((u) => db.collection("users").doc(u).get()),
    );
    const tokens = userSnaps.flatMap((s) => {
      const d = s.data() as { notificationTokens?: string[] } | undefined;
      return d?.notificationTokens ?? [];
    });
    if (tokens.length === 0) return;

    await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: `${senderName} · ${room.name ?? "Sahayak"}`,
        body: text?.slice(0, 140) ?? "",
      },
      data: { roomId: event.params.roomId },
    });
  },
);
