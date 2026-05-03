import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, H3, Body, Label } from "@/components/shared/Typography";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/dateUtils";
import type { SahayakEvent } from "@/types/event";
import { Calendar, MapPin, Users, ExternalLink, MessageCircle } from "lucide-react";

interface Props {
  params: { eventId: string };
}

async function getEvent(eventId: string): Promise<SahayakEvent | null> {
  try {
    const snap = await adminDb().collection("events").doc(eventId).get();
    if (!snap.exists) return null;
    const data = snap.data() as SahayakEvent;
    return { ...data, id: snap.id };
  } catch {
    return null;
  }
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEvent(params.eventId);
  if (!event) notFound();

  const isGdg = event.source === "gdg";

  return (
    <article className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>
            {isGdg ? event.gdgChapter ?? "GDG Event" : event.source.replace("_", " ")}
          </Label>
        </div>

        <H1 className="mt-6">{event.title}</H1>

        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <Body className="whitespace-pre-wrap text-muted-foreground">
              {event.description || "No description provided."}
            </Body>

            {event.tags?.length ? (
              <div className="mt-10 flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="md:col-span-4 md:sticky md:top-28 md:self-start">
            <div className="flex flex-col gap-6 border border-border p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    When
                  </span>
                  <span className="text-foreground">{formatDateTime(event.startTime)}</span>
                  <span className="text-xs text-muted-foreground">
                    → {formatDateTime(event.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    Where
                  </span>
                  <span className="text-foreground">{event.location.venueName || event.location.city}</span>
                  <span className="text-xs text-muted-foreground">
                    {event.location.address}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-5 w-5" strokeWidth={1.5} />
                <span className="font-mono text-sm">
                  {event.attendees?.length ?? 0}
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attending
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-3">
                <Link href={`/chat/${event.chatRoomId}`}>
                  <Button
                    variant="secondary"
                    className="w-full"
                    iconLeft={<MessageCircle className="h-4 w-4" strokeWidth={1.5} />}
                  >
                    Open Event Chat
                  </Button>
                </Link>
                {event.sourceUrl ? (
                  <Link href={event.sourceUrl} target="_blank" rel="noreferrer">
                    <Button
                      variant="ghost"
                      className="w-full"
                      iconRight={<ExternalLink className="h-4 w-4" strokeWidth={1.5} />}
                    >
                      View on GDG
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 border border-border p-5">
              <H3 as="div" className="font-mono text-2xl text-accent">
                {event.attendees?.length ?? 0}
              </H3>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Builders going
              </span>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
