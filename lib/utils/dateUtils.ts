import type { Timestamp } from "firebase/firestore";

type TimeLike = Date | Timestamp | number | string | null | undefined;

export function toDate(value: TimeLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && "toDate" in value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return null;
}

export function formatDate(value: TimeLike, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, opts ?? { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(value: TimeLike): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(value: TimeLike): string {
  const d = toDate(value);
  if (!d) return "—";
  return `${formatDate(d)} · ${formatTime(d)}`;
}

export function timeAgo(value: TimeLike): string {
  const d = toDate(value);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function isFuture(value: TimeLike): boolean {
  const d = toDate(value);
  return d ? d.getTime() > Date.now() : false;
}
