"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, iconLeft, iconRight, className, children, disabled, ...rest },
    ref,
  ) => {
    const sizes: Record<Size, string> = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
    };

    const base =
      "inline-flex items-center justify-center gap-2 font-sans font-medium uppercase tracking-widest transition-[color,background-color,border-color,transform] duration-200 ease-editorial disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants: Record<Variant, string> = {
      primary:
        "relative bg-transparent text-foreground hover:text-accent after:content-[''] after:absolute after:left-5 after:right-5 after:bottom-2 after:h-px after:bg-current after:scale-x-100 after:origin-left",
      secondary:
        "border border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground",
      ghost: "bg-transparent text-muted-foreground hover:text-foreground",
      accent:
        "bg-accent text-accent-foreground hover:bg-foreground hover:text-background border border-accent hover:border-foreground",
      danger: "border border-danger text-danger hover:bg-danger hover:text-foreground",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, sizes[size], variants[variant], "min-h-[44px]", className)}
        {...rest}
      >
        {iconLeft}
        <span>{loading ? "…" : children}</span>
        {iconRight}
      </button>
    );
  },
);
Button.displayName = "Button";
