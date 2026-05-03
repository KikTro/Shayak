import Link from "next/link";
import { AccentBar } from "@/components/shared/AccentBar";
import { Label } from "@/components/shared/Typography";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="sahayak-container py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-sans text-2xl font-bold uppercase tracking-widest text-foreground">
              Sahayak
            </div>
            <AccentBar className="mt-4" />
            <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-muted-foreground">
              A multi-agent intelligence system for developer communities —
              discovering, connecting, and keeping the community alive.
            </p>
          </div>

          <div className="md:col-span-3">
            <Label>Explore</Label>
            <ul className="mt-6 flex flex-col gap-3">
              <li><Link className="link-underline text-sm" href="/events">Events</Link></li>
              <li><Link className="link-underline text-sm" href="/community">Community</Link></li>
              <li><Link className="link-underline text-sm" href="/chat">Chat</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <Label>In Memory</Label>
            <p className="mt-6 font-serif italic text-lg leading-snug text-foreground">
              Built in loving memory of Kiran Mishra
              <span aria-hidden="true"> · 🕊️</span>
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              GDG Cloud Kolkata
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Sahayak · Community Intelligence
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            v0.1 · Built with care
          </span>
        </div>
      </div>
    </footer>
  );
}
