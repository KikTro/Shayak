import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils/dateUtils";
import { formatDistance } from "@/lib/utils/locationUtils";
import type { NearbyEvent, SahayakEvent } from "@/types/event";

interface EventCardProps {
  event: SahayakEvent | NearbyEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const isGdg = event.source === "gdg";
  const distance = (event as NearbyEvent).distanceKm;

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "group relative flex flex-col border border-border bg-transparent transition-colors duration-200 ease-editorial hover:border-foreground",
        isGdg ? "border-l-2 border-l-accent" : "",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <Badge variant={isGdg ? "accent" : "outline"}>
            {isGdg ? event.gdgChapter ?? "GDG" : event.source.replace("_", " ")}
          </Badge>
          {Number.isFinite(distance) ? (
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {formatDistance(distance)}
            </span>
          ) : null}
        </div>

        <h3 className="font-sans text-xl md:text-2xl leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2 text-muted-foreground">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>{formatDateTime(event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            <span className="truncate">
              {event.location.venueName || event.location.city || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span>
              {event.attendees?.length ?? 0}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attending
            </span>
          </div>
        </div>

        {event.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
