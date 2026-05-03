"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const generatedId = id ?? rest.name ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="flex w-full flex-col gap-2">
        {label ? (
          <label htmlFor={generatedId} className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {label}
          </label>
        ) : null}
        <input
          id={generatedId}
          ref={ref}
          className={cn(
            "h-12 md:h-14 w-full bg-input px-4 font-sans text-base text-foreground placeholder:text-muted-foreground",
            "border border-border outline-none transition-colors duration-200",
            "focus:border-accent focus:ring-0",
            error ? "border-danger" : "",
            className,
          )}
          {...rest}
        />
        {hint && !error ? (
          <span className="font-mono text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
        {error ? <span className="font-mono text-[11px] text-danger">{error}</span> : null}
      </div>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const generatedId = id ?? rest.name ?? `ta-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="flex w-full flex-col gap-2">
        {label ? (
          <label htmlFor={generatedId} className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          id={generatedId}
          ref={ref}
          className={cn(
            "min-h-[120px] w-full bg-input px-4 py-3 font-sans text-base text-foreground placeholder:text-muted-foreground",
            "border border-border outline-none transition-colors duration-200",
            "focus:border-accent focus:ring-0 resize-y",
            error ? "border-danger" : "",
            className,
          )}
          {...rest}
        />
        {hint && !error ? (
          <span className="font-mono text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
        {error ? <span className="font-mono text-[11px] text-danger">{error}</span> : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
