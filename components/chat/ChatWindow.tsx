"use client";

import { useEffect, useRef } from "react";
import { Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatMessages } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { uploadChatAttachment } from "@/lib/firebase/storage";
import type { ChatRoom } from "@/types/message";
import { formatDate, toDate } from "@/lib/utils/dateUtils";

interface ChatWindowProps {
  room: ChatRoom;
}

export function ChatWindow({ room }: ChatWindowProps) {
  const { firebaseUser, profile } = useAuth();
  const { messages, send } = useChatMessages(room.id);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Group messages + insert date separators
  let lastDateKey = "";
  let lastSender = "";
  let lastTs = 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border p-5">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {room.type}
          </span>
          <h2 className="font-sans text-lg text-foreground">{room.name}</h2>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-2 font-mono text-xs">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            {room.participants?.length ?? 0}
          </span>
          <button
            type="button"
            aria-label="Search"
            className="flex h-8 w-8 items-center justify-center border border-border transition-colors hover:border-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                No messages yet
              </div>
              <p className="mt-3 font-sans text-sm text-muted-foreground">
                Be the first to say hi. Every great community starts with a single hello.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const d = toDate(m.sentAt);
            const dateKey = d ? d.toDateString() : "";
            const showDate = dateKey !== lastDateKey;
            const ts = d?.getTime() ?? 0;
            const grouped =
              !showDate &&
              m.senderId === lastSender &&
              ts - lastTs < 5 * 60 * 1000;

            lastDateKey = dateKey;
            lastSender = m.senderId;
            lastTs = ts;

            return (
              <div key={m.id}>
                {showDate ? (
                  <div className="my-4 flex items-center gap-4 px-5">
                    <div className="h-px flex-1 bg-border" />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {formatDate(d)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                ) : null}
                <MessageBubble
                  message={m}
                  isOwn={firebaseUser?.uid === m.senderId}
                  groupedWithPrevious={grouped}
                />
              </div>
            );
            void i;
          })
        )}
      </div>

      {firebaseUser ? (
        <>
          <TypingIndicator roomId={room.id} currentUid={firebaseUser.uid} />
          <ChatInput
            roomId={room.id}
            uid={firebaseUser.uid}
            placeholder={`Message ${room.name}`}
            onSend={async (text) =>
              void (await send(room.id, {
                senderId: firebaseUser.uid,
                senderName: profile?.displayName ?? firebaseUser.displayName ?? "Builder",
                senderPhotoURL: profile?.photoURL ?? firebaseUser.photoURL ?? "",
                text,
              }))
            }
            onAttach={async (file) => {
              const url = await uploadChatAttachment(room.id, firebaseUser.uid, file);
              await send(room.id, {
                senderId: firebaseUser.uid,
                senderName: profile?.displayName ?? firebaseUser.displayName ?? "Builder",
                senderPhotoURL: profile?.photoURL ?? "",
                text: file.name,
                attachmentURL: url,
                attachmentType: file.type.startsWith("image/") ? "image" : "file",
              });
            }}
          />
        </>
      ) : (
        <div className="border-t border-border p-5 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Sign in to join the conversation
        </div>
      )}
    </div>
  );
}
