import "server-only";
import axios from "axios";
import * as cheerio from "cheerio";

const GH_TOKEN = process.env.GITHUB_TOKEN;
const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN;

export interface ScrapedGitHubUser {
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter: string | null;
  avatarUrl: string | null;
  publicRepos: number;
  followers: number;
  topLanguages: string[];
  recentRepos: Array<{ name: string; description: string | null; language: string | null }>;
}

export async function fetchGitHubUser(username: string): Promise<ScrapedGitHubUser | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (GH_TOKEN) headers.Authorization = `Bearer ${GH_TOKEN}`;

    const [user, repos] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 10000 }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        headers,
        timeout: 10000,
      }),
    ]);

    const langs = new Map<string, number>();
    const recentRepos = (repos.data as Array<{ name: string; description: string | null; language: string | null; fork?: boolean }>)
      .filter((r) => !r.fork)
      .slice(0, 6)
      .map((r) => {
        if (r.language) langs.set(r.language, (langs.get(r.language) ?? 0) + 1);
        return { name: r.name, description: r.description, language: r.language };
      });

    const topLanguages = Array.from(langs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([l]) => l);

    const d = user.data as Record<string, unknown>;
    return {
      username,
      name: (d.name as string | null) ?? null,
      bio: (d.bio as string | null) ?? null,
      location: (d.location as string | null) ?? null,
      company: (d.company as string | null) ?? null,
      blog: (d.blog as string | null) ?? null,
      twitter: (d.twitter_username as string | null) ?? null,
      avatarUrl: (d.avatar_url as string | null) ?? null,
      publicRepos: (d.public_repos as number) ?? 0,
      followers: (d.followers as number) ?? 0,
      topLanguages,
      recentRepos,
    };
  } catch (err) {
    console.warn("[profileScraper] github failed", username, err);
    return null;
  }
}

export async function searchGitHubByLocation(
  city: string,
  language?: string,
  limit = 20,
): Promise<string[]> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (GH_TOKEN) headers.Authorization = `Bearer ${GH_TOKEN}`;
    const q = [`location:"${city}"`, language ? `language:${language}` : "", "followers:>5"]
      .filter(Boolean)
      .join(" ");
    const res = await axios.get(
      `https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=${Math.min(limit, 30)}`,
      { headers, timeout: 12000 },
    );
    return ((res.data.items as Array<{ login: string }>) ?? []).map((u) => u.login);
  } catch (err) {
    console.warn("[profileScraper] github search failed", err);
    return [];
  }
}

export interface ScrapedTwitterUser {
  handle: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  pinnedTweet: string | null;
}

export async function fetchTwitterProfile(handle: string): Promise<ScrapedTwitterUser | null> {
  const cleaned = handle.replace(/^@/, "");
  if (TWITTER_BEARER) {
    try {
      const res = await axios.get(
        `https://api.twitter.com/2/users/by/username/${cleaned}?user.fields=description,location,pinned_tweet_id`,
        {
          headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
          timeout: 10000,
        },
      );
      const d = res.data?.data;
      if (!d) return null;
      return {
        handle: cleaned,
        name: d.name ?? null,
        bio: d.description ?? null,
        location: d.location ?? null,
        pinnedTweet: null,
      };
    } catch (err) {
      console.warn("[profileScraper] twitter api failed", err);
    }
  }
  // Fallback: fetch the public page and extract og meta (best-effort)
  try {
    const { data } = await axios.get(`https://nitter.net/${cleaned}`, {
      headers: { "User-Agent": "Mozilla/5.0 Sahayak-Bot" },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    return {
      handle: cleaned,
      name: $(".profile-card-fullname").first().text().trim() || null,
      bio: $(".profile-bio").first().text().trim() || null,
      location: $(".profile-location").first().text().trim() || null,
      pinnedTweet: null,
    };
  } catch {
    return null;
  }
}

export interface ScrapedGDGProfile {
  profileUrl: string;
  name: string | null;
  chapter: string | null;
  eventsAttended: number;
}

export async function fetchGDGProfile(profileUrl: string): Promise<ScrapedGDGProfile | null> {
  try {
    const { data } = await axios.get(profileUrl, {
      headers: { "User-Agent": "Mozilla/5.0 Sahayak-Bot" },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    return {
      profileUrl,
      name: $("h1").first().text().trim() || null,
      chapter: $('[data-testid="chapter"]').first().text().trim() || null,
      eventsAttended: $('[data-testid="event-card"]').length,
    };
  } catch (err) {
    console.warn("[profileScraper] gdg profile failed", err);
    return null;
  }
}
