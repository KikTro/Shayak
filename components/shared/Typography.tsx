import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TypoProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export function Display<T extends ElementType = "h1">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "h1") as ElementType;
  return (
    <Tag
      className={cn(
        "font-sans text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tightest text-balance",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function H1<T extends ElementType = "h1">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "h1") as ElementType;
  return (
    <Tag
      className={cn(
        "font-sans text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tighter text-balance",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function H2<T extends ElementType = "h2">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "h2") as ElementType;
  return (
    <Tag
      className={cn("font-sans text-3xl md:text-5xl leading-tight tracking-tight text-balance", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function H3<T extends ElementType = "h3">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "h3") as ElementType;
  return (
    <Tag
      className={cn("font-sans text-2xl md:text-3xl leading-snug tracking-tight", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Label<T extends ElementType = "span">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={cn(
        "font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Body<T extends ElementType = "p">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag className={cn("font-sans text-base md:text-lg leading-relaxed text-pretty", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Mono<T extends ElementType = "span">({ as, className, children, ...rest }: TypoProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={cn("font-mono text-sm tracking-wide", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Quote<T extends ElementType = "blockquote">({
  as,
  className,
  children,
  ...rest
}: TypoProps<T>) {
  const Tag = (as ?? "blockquote") as ElementType;
  return (
    <Tag
      className={cn("font-serif italic text-2xl md:text-4xl leading-snug text-foreground", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
