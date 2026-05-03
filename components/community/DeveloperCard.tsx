import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SahayakUser } from "@/types/user";
import { cn } from "@/lib/utils/cn";

interface DeveloperCardProps {
  user: SahayakUser;
  distanceKm?: number;
  className?: string;
}

export function DeveloperCard({ user, distanceKm, className }: DeveloperCardProps) {
  return (
    <Link
      href={`/profile/${user.uid}`}
      className={cn(
        "group flex flex-col gap-4 border border-border bg-transparent p-6 transition-colors duration-200 hover:border-foreground",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-muted">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-mono text-lg text-foreground">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        {user.agentDiscovered ? (
          <span className="flex items-center gap-1 border border-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Scout
          </span>
        ) : null}
      </div>

      <div className="font-sans text-lg tracking-tight text-foreground transition-colors group-hover:text-accent">
        {user.displayName}
      </div>
      <div className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <MapPin className="h-3 w-3" strokeWidth={1.5} />
        <span>
          {user.location?.city ?? "—"}
          {typeof distanceKm === "number" ? ` · ${distanceKm.toFixed(1)} km` : ""}
        </span>
      </div>

      {user.bio ? (
        <p className="line-clamp-2 font-sans text-sm text-muted-foreground">{user.bio}</p>
      ) : null}

      {user.skills?.length ? (
        <div className="flex flex-wrap gap-2">
          {user.skills.slice(0, 3).map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </div>
      ) : null}

      <Button
        variant="accent"
        className="mt-4"
        onClick={(e) => {
          e.preventDefault();
          // Redirect to chat with this user
          window.location.href = `/chat/${user.uid}`;
        }}
      >
        Chat
      </Button>

      <span className="link-underline mt-auto font-mono text-[11px] uppercase tracking-widest text-foreground">
        View Profile →
      </span>
    </Link>
  );
}