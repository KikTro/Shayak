"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/dateUtils";
import type { ChatMessage } from "@/types/message";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  groupedWithPrevious: boolean;
}

export function MessageBubble({ message, isOwn, groupedWithPrevious }: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative px-5 py-1",
        groupedWithPrevious ? "pt-0.5" : "pt-4",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        {!groupedWithPrevious ? (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-muted">
            {message.senderPhotoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.senderPhotoURL}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-mono text-xs text-foreground">
                {message.senderName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <div className="h-8 w-8 shrink-0" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          {!groupedWithPrevious ? (
            <div className="mb-1 flex items-baseline gap-3">
              <span
                className={cn(
                  "font-sans text-sm font-semibold",
                  isOwn ? "text-accent" : "text-foreground",
                )}
              >
                {message.senderName}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {formatTime(message.sentAt)}
              </span>
            </div>
          ) : null}

          {message.replyTo ? (
            <div className="mb-2 border-l-2 border-border pl-3 text-muted-foreground">
              <div className="font-mono text-[10px] uppercase tracking-widest">
                {message.replyTo.senderName}
              </div>
              <div className="truncate text-xs">{message.replyTo.text}</div>
            </div>
          ) : null}

          <div
            className={cn(
              "whitespace-pre-wrap break-words font-sans text-[15px] leading-relaxed",
              message.deleted ? "italic text-muted-foreground" : "text-foreground",
            )}
          >
            {message.deleted ? "[message deleted]" : message.text}
          </div>

          {message.attachmentURL ? (
            <div className="mt-2">
              {message.attachmentType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={message.attachmentURL}
                  alt=""
                  className="max-h-80 max-w-sm border border-border"
                />
              ) : (
                <a
                  href={message.attachmentURL}
                  className="link-underline font-mono text-xs text-accent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Attachment
                </a>
              )}
            </div>
          ) : null}

          {message.reactions && Object.keys(message.reactions).length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(message.reactions).map(([emoji, uids]) => (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-1 border border-border px-2 py-0.5 font-mono text-xs"
                >
                  <span>{emoji}</span>
                  <span className="text-muted-foreground">{uids.length}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {hovered ? (
          <div className="absolute right-4 top-0 flex items-center gap-1 border border-border bg-background px-1">
            {["👍", "❤️", "🔥"].map((e) => (
              <button
                key={e}
                type="button"
                className="px-1.5 py-1 text-sm transition-transform hover:scale-110"
                aria-label={`React ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
