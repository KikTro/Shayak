import { HeroSection } from "@/components/home/HeroSection";
import { AgentStatusStrip } from "@/components/home/AgentStatusStrip";
import { CommunityStats } from "@/components/home/CommunityStats";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { AccentBar } from "@/components/shared/AccentBar";
import { Quote, Label, H2, Body } from "@/components/shared/Typography";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AgentStatusStrip />

      {/* Tribute / About */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="sahayak-container grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-6">
              <AccentBar width="sm" />
              <Label>In Memory</Label>
            </div>
            <H2 className="mt-6">For Kiran.</H2>
          </div>
          <div className="md:col-span-8">
            <Quote>
              &ldquo;While we planned to celebrate, our hearts knew — the best
              tribute is to keep building.&rdquo;
            </Quote>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              — GDG Cloud Kolkata
            </p>
            <Body className="mt-10 max-w-2xl text-muted-foreground">
              Sahayak continues the work Kiran started: bringing builders together,
              amplifying their voices, and making community easier to find. Every
              connection made here carries his spirit forward.
            </Body>
          </div>
        </div>
      </section>

      <FeaturedEvents />
      <CommunityStats />

      {/* Agent architecture teaser */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="sahayak-container">
          <div className="flex items-center gap-6">
            <AccentBar width="sm" />
            <Label>The Three Agents</Label>
          </div>
          <H2 className="mt-6 max-w-3xl">
            A small team of <span className="text-accent">autonomous agents</span>{" "}
            that runs your community while you sleep.
          </H2>

          <div className="mt-16 grid grid-cols-1 gap-0 border border-border md:grid-cols-3">
            {[
              {
                name: "Scout",
                role: "Discovery",
                desc: "Finds active developers on GitHub, Twitter, and GDG — every six hours.",
              },
              {
                name: "Matchmaker",
                role: "Connection",
                desc: "Reads the knowledge graph and proposes high-value introductions.",
              },
              {
                name: "Catalyst",
                role: "Voice",
                desc: "Posts shoutouts, reminders, and team-up calls when the community needs them.",
              },
            ].map((a, i) => (
              <div
                key={a.name}
                className={`flex flex-col gap-4 p-8 ${i !== 2 ? "md:border-r md:border-border" : ""} ${
                  i !== 2 ? "border-b border-border md:border-b-0" : ""
                }`}
              >
                <Label>{a.role}</Label>
                <div className="font-sans text-3xl tracking-tight text-foreground">
                  {a.name}
                </div>
                <p className="font-sans text-base leading-relaxed text-muted-foreground">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
