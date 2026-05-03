"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { setTyping } from "@/lib/firebase/realtime";

interface ChatInputProps {
  roomId: string;
  uid: string;
  placeholder?: string;
  onSend: (text: string) => Promise<void>;
  onAttach?: (file: File) => Promise<void>;
}

const MAX = 2000;

export function ChatInput({ roomId, uid, placeholder, onSend, onAttach }: ChatInputProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setTyping(uid, roomId, false);
    };
  }, [uid, roomId]);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value.slice(0, MAX);
    setText(v);

    setTyping(uid, roomId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(uid, roomId, false), 2000);
  }

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setText("");
    setTyping(uid, roomId, false);
    await onSend(t);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const countdownVisible = text.length > MAX * 0.8;

  return (
    <div
      className={cn(
        "border-t bg-muted",
        focused ? "border-accent" : "border-border",
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 p-3"
      >
        <button
          type="button"
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && onAttach) onAttach(f);
          }}
        />
        <textarea
          className="flex-1 resize-none bg-transparent px-2 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          rows={1}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? "Write a message…"}
          aria-label="Message"
        />
        <div className="flex items-center gap-2">
          {countdownVisible ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              {MAX - text.length}
            </span>
          ) : null}
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send"
            className={cn(
              "flex h-10 w-10 items-center justify-center border transition-colors",
              text.trim()
                ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
