"use client";

import { useAuth } from "@/hooks/useAuth";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { H2, Body } from "@/components/shared/Typography";

export default function ChatIndexPage() {
  const { firebaseUser } = useAuth();

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 md:grid-cols-[280px_1fr]">
      <ChatSidebar uid={firebaseUser?.uid ?? null} />
      <div className="flex items-center justify-center border-t border-border p-10 md:border-l md:border-t-0">
        <div className="max-w-md text-center">
          <H2>Your messages.</H2>
          <Body className="mt-4 text-muted-foreground">
            Select a channel, event chat, or direct message from the sidebar.
            Presence and typing indicators are live.
          </Body>
        </div>
      </div>
    </div>
  );
}
