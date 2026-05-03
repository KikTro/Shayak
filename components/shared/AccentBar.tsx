import { cn } from "@/lib/utils/cn";

interface AccentBarProps {
  className?: string;
  width?: "sm" | "md" | "lg";
}

export function AccentBar({ className, width = "md" }: AccentBarProps) {
  const w = width === "sm" ? "w-8" : width === "lg" ? "w-24" : "w-16";
  return <div className={cn("h-[2px] bg-accent", w, className)} aria-hidden="true" />;
}
