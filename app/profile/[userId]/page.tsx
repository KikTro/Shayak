import Link from "next/link";
import { notFound } from "next/navigation";
import { Github, Twitter, Linkedin, MapPin, Sparkles, MessageCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SahayakUser } from "@/types/user";

interface Props {
  params: { userId: string };
}

async function getUser(userId: string): Promise<SahayakUser | null> {
  try {
    const snap = await adminDb().collection("users").doc(userId).get();
    if (!snap.exists) return null;
    return { ...(snap.data() as SahayakUser), uid: snap.id };
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: Props) {
  const user = await getUser(params.userId);
  if (!user) notFound();

  return (
    <article className="py-12 md:py-20">
      <div className="sahayak-container grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-6">
            <AccentBar width="sm" />
            <Label>Developer</Label>
          </div>
          <H1 className="mt-6">{user.displayName}</H1>
          {user.bio ? <Body className="mt-6 max-w-2xl text-muted-foreground">{user.bio}</Body> : null}

          {user.skills?.length ? (
            <section className="mt-12">
              <div className="flex items-center gap-4">
                <AccentBar width="sm" />
                <Label>Skills</Label>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {user.interests?.length ? (
            <section className="mt-12">
              <div className="flex items-center gap-4">
                <AccentBar width="sm" />
                <Label>Interests</Label>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {user.interests.map((s) => (
                  <Badge key={s} variant="default">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="h-40 w-40 overflow-hidden bg-muted">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-5xl text-foreground">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-mono text-sm">{user.location?.city || "Unknown"}</span>
            </div>

            {user.agentDiscovered ? (
              <div className="mt-4 flex items-center gap-2 border border-accent px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-accent w-fit">
                <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                Discovered by Scout
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              {user.socialLinks?.github ? (
                <Link
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-4 w-4" strokeWidth={1.5} />
                  <span className="link-underline font-sans text-sm">GitHub</span>
                </Link>
              ) : null}
              {user.socialLinks?.twitter ? (
                <Link
                  href={
                    user.socialLinks.twitter.startsWith("http")
                      ? user.socialLinks.twitter
                      : `https://twitter.com/${user.socialLinks.twitter.replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="h-4 w-4" strokeWidth={1.5} />
                  <span className="link-underline font-sans text-sm">Twitter</span>
                </Link>
              ) : null}
              {user.socialLinks?.linkedin ? (
                <Link
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                  <span className="link-underline font-sans text-sm">LinkedIn</span>
                </Link>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link href={`/chat/dm_${params.userId}`}>
                <Button
                  variant="secondary"
                  className="w-full"
                  iconLeft={<MessageCircle className="h-4 w-4" strokeWidth={1.5} />}
                >
                  Message
                </Button>
              </Link>
              <Button variant="primary" className="w-full">
                Connect
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
