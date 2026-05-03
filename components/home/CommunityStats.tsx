"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { AccentBar } from "@/components/shared/AccentBar";
import { Label } from "@/components/shared/Typography";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

const STATS: Stat[] = [
  { value: 247, label: "Developers Discovered" },
  { value: 38, label: "Events Synced" },
  { value: 12, label: "Chapters Connected" },
  { value: 3, label: "Agents Active" },
];

function Counter({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-mono text-5xl md:text-7xl text-foreground tracking-tight">
      {value}
    </span>
  );
}

export function CommunityStats() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>By the numbers</Label>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-0 border border-border md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0, 0, 1] }}
              className={`relative flex flex-col gap-4 p-6 md:p-8 ${
                i !== STATS.length - 1 ? "md:border-r md:border-border" : ""
              } ${i < 2 ? "border-b border-border md:border-b-0" : ""} ${
                i % 2 === 0 ? "border-r border-border md:border-r" : ""
              }`}
            >
              <Counter target={s.value} />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
