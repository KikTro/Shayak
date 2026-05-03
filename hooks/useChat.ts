"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  addDoc,
  doc,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { chatsCol, messagesCol } from "@/lib/firebase/firestore";
import type { ChatMessage, ChatRoom } from "@/types/message";

export function useChatRooms(uid: string | null) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      chatsCol(),
      (snap) => {
        const all = snap.docs.map((d) => ({ ...(d.data() as ChatRoom), id: d.id }));
        // Filter: public channels/community + participant rooms
        const filtered = all.filter((r) => r.isPublic || (uid && r.participants?.includes(uid)));
        setRooms(filtered);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [uid]);

  return { rooms, loading };
}

export function useChatMessages(roomId: string | null, max = 200) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }
    const q = query(messagesCol(roomId), orderBy("sentAt", "asc"), fsLimit(max));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ ...(d.data() as ChatMessage), id: d.id }));
        setMessages(msgs);
        msgs.forEach((m) => seen.current.add(m.id));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [roomId, max]);

  const send = useCallback(
    async (
      roomIdToUse: string,
      payload: { senderId: string; senderName: string; senderPhotoURL: string; text: string; replyTo?: ChatMessage["replyTo"]; attachmentURL?: string; attachmentType?: ChatMessage["attachmentType"] },
    ) => {
      const ref = await addDoc(messagesCol(roomIdToUse), {
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderPhotoURL: payload.senderPhotoURL,
        text: payload.text,
        replyTo: payload.replyTo ?? null,
        attachmentURL: payload.attachmentURL ?? null,
        attachmentType: payload.attachmentType ?? null,
        reactions: {},
        sentAt: serverTimestamp(),
        deleted: false,
      } as unknown as ChatMessage);
      await updateDoc(doc(chatsCol(), roomIdToUse), {
        lastMessage: {
          text: payload.text,
          senderName: payload.senderName,
          sentAt: serverTimestamp(),
        },
      });
      return ref.id;
    },
    [],
  );

  return { messages, loading, send };
}
