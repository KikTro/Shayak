"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AccentBar } from "@/components/shared/AccentBar";
import { Display, Body, Label } from "@/components/shared/Typography";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      {/* Oversized decorative background word */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden select-none items-center justify-center md:flex"
      >
        <span className="font-sans text-[18rem] font-bold uppercase leading-none tracking-tightest text-foreground/[0.03]">
          Sahayak
        </span>
      </div>

      <div className="sahayak-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
          className="flex flex-col gap-6"
        >
          <Label>Community Intelligence · Kolkata</Label>
          <AccentBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0, 0, 1] }}
          className="mt-8"
        >
          <Display className="text-pretty">
            Build Together.
            <br />
            <span className="text-accent">Grow Together.</span>
          </Display>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0, 0, 1] }}
          className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12"
        >
          <div className="md:col-span-7">
            <Body className="max-w-2xl text-muted-foreground">
              Sahayak is an agentic AI platform that discovers Kolkata&rsquo;s
              builders, connects them with purpose, and keeps the community alive —
              in honour of{" "}
              <span className="text-foreground">Kiran Mishra</span>.
            </Body>
          </div>
          <div className="md:col-span-5 md:pt-2">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/events">
                <Button variant="primary" size="lg" iconRight={<ArrowRight strokeWidth={1.5} className="h-4 w-4" />}>
                  Explore Events
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="secondary" size="lg">
                  View Community
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
