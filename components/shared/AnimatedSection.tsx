"use client";

import { motion, type Variants } from "framer-motion";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

interface AnimatedSectionProps {
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "section" | "div" | "article" | "header" | "footer";
}

const container: Variants = {
  hidden: {},
  show: (custom: { stagger: number; delay: number }) => ({
    transition: { staggerChildren: custom.stagger, delayChildren: custom.delay },
  }),
};

export function AnimatedSection({
  children,
  className,
  delay = 0.1,
  stagger = 0.08,
  as = "section",
}: PropsWithChildren<AnimatedSectionProps>) {
  const MotionTag = motion[as] as typeof motion.section;
  return (
    <MotionTag
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "-50px" }}
      custom={{ stagger, delay }}
    >
      {children}
    </MotionTag>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0, 0, 1] },
  },
};

export function AnimatedItem({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div className={cn(className)} variants={item}>
      {children}
    </motion.div>
  );
}
