import "server-only";
import { FieldValue, GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import { adminDb } from "@/lib/firebase/admin";
import {
  fetchGDGProfile,
  fetchGitHubUser,
  fetchTwitterProfile,
  searchGitHubByLocation,
  type ScrapedGitHubUser,
} from "@/lib/scraping/profileScraper";
import { forwardGeocode } from "@/lib/maps/geocoding";
import { generateJSON } from "@/lib/agents/gemini";
import { logAgentAction, updateAgentAction } from "@/lib/agents/common";
import type { DeveloperGraphNode } from "@/types/developer";

interface SynthesizedProfile {
  name: string;
  handle: string;
  bio: string;
  city: string;
  skills: string[];
  interests: string[];
  recentProjects: string[];
  socialLinks: { github?: string; twitter?: string };
  confidence: number;
}

const SCOUT_PROMPT = (city: string, data: unknown) => `
You are the Scout Agent for Sahayak, a community intelligence system.
Your job is to find developers in ${city} who are actively building things.

Given the following public data about a single developer, extract:
- Full name and handle
- Primary skills (top 5, be specific: "Next.js" not "JavaScript")
- Current projects or interests (from recent repos)
- Community involvement (GDG, meetups, open source)
- Location (confirm it matches ${city})

Be concise and factual. Do not invent information. If location doesn't match, lower confidence.

Respond with strict JSON of shape:
{
  "name": string,
  "handle": string,
  "bio": string,
  "city": string,
  "skills": string[],
  "interests": string[],
  "recentProjects": string[],
  "socialLinks": { "github"?: string, "twitter"?: string },
  "confidence": number   // 0..1
}

Input data:
${JSON.stringify(data, null, 2)}
`;

export async function scoutRun(options: {
  city: string;
  language?: string;
  max?: number;
}): Promise<{ discovered: number; actionId: string }> {
  const actionId = await logAgentAction(
    "scout",
    `Scanning ${options.city} for active developers`,
    { city: options.city, language: options.language },
  );

  try {
    await updateAgentAction(actionId, { status: "running" });

    const usernames = await searchGitHubByLocation(
      options.city,
      options.language,
      options.max ?? 10,
    );

    let discovered = 0;

    for (const username of usernames) {
      try {
        const gh = await fetchGitHubUser(username);
        if (!gh) continue;

        let twitter = null;
        if (gh.twitter) twitter = await fetchTwitterProfile(gh.twitter);

        const synth = await synthesizeProfile(options.city, gh, twitter);
        if (!synth || synth.confidence < 0.4) continue;

        await upsertDeveloperProfile(synth, gh);
        discovered += 1;
      } catch (err) {
        console.warn("[scout] profile failed", username, err);
      }
    }

    await updateAgentAction(actionId, {
      status: "completed",
      output: { discovered, city: options.city },
    });

    return { discovered, actionId };
  } catch (err) {
    await updateAgentAction(actionId, {
      status: "failed",
      output: { error: (err as Error).message },
    });
    throw err;
  }
}

async function synthesizeProfile(
  city: string,
  gh: ScrapedGitHubUser,
  twitter: Awaited<ReturnType<typeof fetchTwitterProfile>>,
): Promise<SynthesizedProfile | null> {
  const payload = {
    github: {
      username: gh.username,
      name: gh.name,
      bio: gh.bio,
      location: gh.location,
      company: gh.company,
      topLanguages: gh.topLanguages,
      recentRepos: gh.recentRepos,
    },
    twitter: twitter
      ? { handle: twitter.handle, bio: twitter.bio, location: twitter.location }
      : null,
  };
  return generateJSON<SynthesizedProfile>(SCOUT_PROMPT(city, payload));
}

export async function upsertDeveloperProfile(
  synth: SynthesizedProfile,
  gh: ScrapedGitHubUser,
): Promise<string> {
  const db = adminDb();
  const uid = `scout_${synth.handle.toLowerCase()}`;

  const geo = await forwardGeocode(synth.city).catch(() => null);
  const coords = geo
    ? new GeoPoint(geo.lat, geo.lng)
    : new GeoPoint(22.5726, 88.3639); // fallback Kolkata
  const geohash = geo
    ? geohashForLocation([geo.lat, geo.lng])
    : geohashForLocation([22.5726, 88.3639]);

  await db.collection("users").doc(uid).set(
    {
      uid,
      displayName: synth.name || gh.username,
      email: "",
      photoURL: gh.avatarUrl ?? "",
      bio: synth.bio ?? gh.bio ?? "",
      skills: synth.skills ?? [],
      interests: synth.interests ?? [],
      socialLinks: {
        github: synth.socialLinks?.github ?? `https://github.com/${gh.username}`,
        twitter: synth.socialLinks?.twitter,
      },
      location: {
        city: synth.city,
        state: "",
        country: geo?.country ?? "",
        coordinates: coords,
        geohash,
      },
      role: "developer",
      agentDiscovered: true,
      agentSource: "github",
      notificationTokens: [],
      joinedAt: FieldValue.serverTimestamp(),
      lastActiveAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const graphNode: Partial<DeveloperGraphNode> = {
    uid,
    displayName: synth.name || gh.username,
    skills: synth.skills ?? [],
    interests: synth.interests ?? [],
    recentProjects: synth.recentProjects ?? gh.recentRepos.map((r) => r.name),
    connections: [],
    matchScore: {},
  };

  await db.collection("developerGraph").doc(uid).set(
    { ...graphNode, lastGraphUpdate: FieldValue.serverTimestamp() },
    { merge: true },
  );

  return uid;
}

export async function enrichSelfProfile(uid: string, city?: string): Promise<void> {
  const db = adminDb();
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) return;
  const user = userSnap.data() as { socialLinks?: { github?: string } };
  const gh = user.socialLinks?.github?.split("/").pop();
  if (!gh) return;

  const actionId = await logAgentAction("scout", `Enriching ${uid} from GitHub ${gh}`, { uid });
  try {
    const ghData = await fetchGitHubUser(gh);
    if (!ghData) {
      await updateAgentAction(actionId, { status: "failed" });
      return;
    }
    const synth = await synthesizeProfile(city ?? "Kolkata", ghData, null);
    if (synth) {
      await db.collection("users").doc(uid).set(
        {
          bio: synth.bio ?? "",
          skills: synth.skills ?? [],
          interests: synth.interests ?? [],
          agentSource: "github",
        },
        { merge: true },
      );
      await db.collection("developerGraph").doc(uid).set(
        {
          uid,
          skills: synth.skills ?? [],
          interests: synth.interests ?? [],
          recentProjects: synth.recentProjects ?? [],
          connections: [],
          matchScore: {},
          lastGraphUpdate: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    await updateAgentAction(actionId, { status: "completed", output: { enriched: true } });
  } catch (err) {
    await updateAgentAction(actionId, { status: "failed", output: { error: (err as Error).message } });
  }

  // Reference imports to avoid unused warnings in strict mode
  void fetchGDGProfile;
}
