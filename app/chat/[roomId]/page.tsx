"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { attachPresence } from "@/lib/firebase/realtime";
import { chatsCol } from "@/lib/firebase/firestore";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatRoom } from "@/types/message";

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const { firebaseUser } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const detach = attachPresence(firebaseUser.uid);
    return () => detach();
  }, [firebaseUser]);

  useEffect(() => {
    const unsub = onSnapshot(doc(chatsCol(), params.roomId), (snap) => {
      if (snap.exists()) {
        setRoom({ ...(snap.data() as ChatRoom), id: snap.id });
      } else {
        setRoom(null);
      }
    });
    return () => unsub();
  }, [params.roomId]);

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 md:grid-cols-[280px_1fr]">
      <ChatSidebar uid={firebaseUser?.uid ?? null} />
      {room ? (
        <ChatWindow room={room} />
      ) : (
        <div className="flex items-center justify-center border-t border-border md:border-l md:border-t-0">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading room…
          </div>
        </div>
      )}
    </div>
  );
}
