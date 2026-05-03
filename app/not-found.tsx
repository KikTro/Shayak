import Link from "next/link";
import { AccentBar } from "@/components/shared/AccentBar";
import { Display, Body, Label } from "@/components/shared/Typography";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="py-40">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>404</Label>
        </div>
        <Display className="mt-6">Nothing here.</Display>
        <Body className="mt-6 max-w-xl text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist — but the community
          does. Come back to the feed.
        </Body>
        <div className="mt-10">
          <Link href="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
