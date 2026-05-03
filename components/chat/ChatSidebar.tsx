"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Hash, Diamond, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChatRooms } from "@/hooks/useChat";
import type { ChatRoom } from "@/types/message";

interface ChatSidebarProps {
  uid: string | null;
}

export function ChatSidebar({ uid }: ChatSidebarProps) {
  const { rooms } = useChatRooms(uid);
  const pathname = usePathname();

  const channels = rooms.filter((r) => r.type === "channel" || r.type === "community");
  const eventChats = rooms.filter((r) => r.type === "event");
  const dms = rooms.filter((r) => r.type === "dm");

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-background md:w-[280px]">
      <div className="flex items-center justify-between border-b border-border p-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Messages
        </span>
        <button
          type="button"
          aria-label="New DM"
          className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <RoomGroup title="Channels" rooms={channels} pathname={pathname} icon="hash" />
        <RoomGroup title="Event Chats" rooms={eventChats} pathname={pathname} icon="diamond" />
        <RoomGroup title="Direct Messages" rooms={dms} pathname={pathname} icon="dot" />
      </div>
    </aside>
  );
}

function RoomGroup({
  title,
  rooms,
  pathname,
  icon,
}: {
  title: string;
  rooms: ChatRoom[];
  pathname: string | null;
  icon: "hash" | "diamond" | "dot";
}) {
  if (!rooms.length) return null;
  return (
    <div className="border-b border-border py-4">
      <div className="px-5 pb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-col">
        {rooms.map((r) => {
          const href = `/chat/${r.id}`;
          const active = pathname === href;
          return (
            <Link
              key={r.id}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted",
                active ? "bg-muted" : "",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-0 h-full w-[2px] bg-accent" aria-hidden="true" />
              ) : null}
              <Icon type={icon} />
              <span className="flex-1 truncate font-sans text-sm text-foreground">
                {r.name}
              </span>
              {r.unreadCount ? (
                <span className="font-mono text-xs text-accent">{r.unreadCount}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Icon({ type }: { type: "hash" | "diamond" | "dot" }) {
  if (type === "hash") return <Hash className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
  if (type === "diamond") return <Diamond className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
  return <Circle className="h-2 w-2 text-success" strokeWidth={1.5} fill="currentColor" />;
}
