import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "outline" | "success" | "warning" | "danger";
  children: ReactNode;
}

export function Badge({ variant = "default", className, children, ...rest }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-muted text-foreground border-border",
    accent: "bg-transparent text-accent border-accent",
    outline: "bg-transparent text-muted-foreground border-border",
    success: "bg-transparent text-success border-success",
    warning: "bg-transparent text-warning border-warning",
    danger: "bg-transparent text-danger border-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
