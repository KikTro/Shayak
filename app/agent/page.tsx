"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { AgentCard } from "@/components/agent/AgentCard";
import { AgentLog } from "@/components/agent/AgentLog";
import { IntroApproval } from "@/components/agent/IntroApproval";

export default function AgentControlCentre() {
  const { firebaseUser, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [busyAgent, setBusyAgent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [loading, isAdmin, router]);

  async function runScout() {
    if (!firebaseUser) return;
    setBusyAgent("scout");
    try {
      const token = await firebaseUser.getIdToken();
      await fetch("/api/agents/scout", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ city: "Kolkata", max: 8 }),
      });
    } finally {
      setBusyAgent(null);
    }
  }

  async function runMatchmaker() {
    if (!firebaseUser) return;
    setBusyAgent("matchmaker");
    try {
      const token = await firebaseUser.getIdToken();
      await fetch("/api/agents/matchmaker", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "run", targetUid: firebaseUser.uid }),
      });
    } finally {
      setBusyAgent(null);
    }
  }

  async function runCatalyst() {
    if (!firebaseUser) return;
    setBusyAgent("catalyst");
    try {
      const token = await firebaseUser.getIdToken();
      await fetch("/api/agents/catalyst", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "welcome", uid: firebaseUser.uid, displayName: "the community" }),
      });
    } finally {
      setBusyAgent(null);
    }
  }

  if (loading) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Admin</Label>
        </div>
        <H1 className="mt-6">Agent Control Centre.</H1>
        <Body className="mt-4 max-w-3xl text-muted-foreground">
          The agents carry Kiran&rsquo;s spirit — always discovering, always connecting.
          Trigger runs manually, approve introductions, and watch the log breathe.
        </Body>

        <div className="mt-12 grid grid-cols-1 gap-0 md:grid-cols-3">
          <AgentCard
            agent="scout"
            status={busyAgent === "scout" ? "running" : "idle"}
            stats={[
              { label: "City", value: "Kolkata" },
              { label: "Last run", value: "—" },
              { label: "Profiles", value: "live" },
            ]}
            primaryLabel="Run Scout Now"
            onPrimary={runScout}
            loading={busyAgent === "scout"}
          />
          <AgentCard
            agent="matchmaker"
            status={busyAgent === "matchmaker" ? "running" : "idle"}
            stats={[
              { label: "Target", value: "self" },
              { label: "Queue", value: "auto" },
              { label: "Confidence", value: "≥ 55%" },
            ]}
            primaryLabel="Run Matchmaker"
            onPrimary={runMatchmaker}
            loading={busyAgent === "matchmaker"}
          />
          <AgentCard
            agent="catalyst"
            status={busyAgent === "catalyst" ? "running" : "idle"}
            stats={[
              { label: "Channel", value: "# general" },
              { label: "Action", value: "welcome" },
              { label: "Emoji cap", value: "2" },
            ]}
            primaryLabel="Run Catalyst"
            onPrimary={runCatalyst}
            loading={busyAgent === "catalyst"}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <IntroApproval />
          </div>
          <div className="lg:col-span-5">
            <AgentLog />
          </div>
        </div>
      </div>
    </section>
  );
}
