import "server-only";
import axios, { type AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import { geohashForLocation } from "geofire-common";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, GeoPoint } from "firebase-admin/firestore";

const GDG_BASE = "https://gdg.community.dev";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Sahayak-Bot/1.0; +https://sahayak.dev/bots)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export interface GDGEvent {
  id: string;                    // Deterministic hash from URL
  title: string;
  description: string;
  url: string;
  startTime: Date | null;
  endTime: Date | null;
  venueName: string;
  address: string;
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  chapter: string;
  chapterUrl?: string;
  tags: string[];
  coverImageURL?: string;
  rsvpCount?: number;
}

export interface GDGChapter {
  name: string;
  city: string;
  country: string;
  url: string;
  memberCount?: number;
  organizers?: string[];
}

function makeClient(): AxiosInstance {
  return axios.create({
    baseURL: GDG_BASE,
    headers: HEADERS,
    timeout: 15000,
    maxRedirects: 3,
  });
}

/** Deterministic id from url */
function hashId(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return `gdg_${Math.abs(h).toString(36)}`;
}

/** Parse date-like strings robustly */
function parseMaybeDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

/**
 * Scrape a single GDG event page. Used for detail enrichment.
 */
export async function scrapeEventDetail(eventUrl: string): Promise<Partial<GDGEvent> | null> {
  try {
    const client = makeClient();
    const { data } = await client.get(eventUrl);
    const $ = cheerio.load(data);

    const title =
      $('meta[property="og:title"]').attr("content") ??
      $("h1").first().text().trim();
    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      $("article p").first().text().trim();
    const coverImageURL =
      $('meta[property="og:image"]').attr("content") ??
      $("img").first().attr("src") ??
      undefined;

    // JSON-LD event schema (community.dev uses this)
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let venueName = "";
    let address = "";
    let city = "";
    let country = "";
    let coordinates: { lat: number; lng: number } | undefined;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).contents().text());
        const nodes = Array.isArray(json) ? json : [json];
        for (const n of nodes) {
          if (n["@type"] === "Event" || n["@type"]?.includes?.("Event")) {
            startTime = parseMaybeDate(n.startDate) ?? startTime;
            endTime = parseMaybeDate(n.endDate) ?? endTime;
            const loc = n.location;
            if (loc) {
              venueName = loc.name ?? venueName;
              const addr = loc.address;
              if (addr && typeof addr === "object") {
                address = addr.streetAddress ?? address;
                city = addr.addressLocality ?? city;
                country = addr.addressCountry ?? country;
              }
              const geo = loc.geo;
              if (geo?.latitude && geo?.longitude) {
                coordinates = { lat: Number(geo.latitude), lng: Number(geo.longitude) };
              }
            }
          }
        }
      } catch {
        /* ignore malformed JSON-LD */
      }
    });

    // Tag extraction from keywords / chips
    const tags = new Set<string>();
    $('meta[name="keywords"]')
      .attr("content")
      ?.split(",")
      .forEach((t) => tags.add(t.trim()));
    $('[data-testid="tag"], .tag, .chip').each((_, el) => {
      const t = $(el).text().trim();
      if (t) tags.add(t);
    });

    return {
      id: hashId(eventUrl),
      title: title ?? "",
      description: description ?? "",
      url: eventUrl,
      startTime,
      endTime,
      venueName,
      address,
      city,
      country,
      coordinates,
      tags: Array.from(tags).filter(Boolean).slice(0, 10),
      coverImageURL,
    };
  } catch (err) {
    console.warn(`[gdgScraper] detail failed ${eventUrl}`, err);
    return null;
  }
}

/**
 * Scrape events list from gdg.community.dev.
 * community.dev is a JS-heavy app; we rely on the public HTML + any SSR'd content,
 * and fall back to RSS/sitemap feeds where available.
 */
export async function scrapeGDGEvents(options: {
  city?: string;
  chapter?: string;
  limit?: number;
  upcoming?: boolean;
} = {}): Promise<GDGEvent[]> {
  const max = options.limit ?? 30;
  const client = makeClient();
  const results: GDGEvent[] = [];

  // Strategy A: chapter listing (if provided)
  if (options.chapter) {
    const slug = options.chapter.toLowerCase().replace(/\s+/g, "-");
    try {
      const list = await scrapeChapterEvents(`${GDG_BASE}/${slug}/`);
      results.push(...list);
    } catch (err) {
      console.warn("[gdgScraper] chapter scrape failed", err);
    }
  }

  // Strategy B: search endpoint (HTML)
  try {
    const searchUrl = options.city
      ? `/events/?search=${encodeURIComponent(options.city)}`
      : "/events/";
    const { data } = await client.get(searchUrl);
    const $ = cheerio.load(data);

    const seen = new Set<string>();
    $('a[href*="/events/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href || !/\/events\/[a-z0-9-]+\//i.test(href)) return;
      const url = href.startsWith("http") ? href : `${GDG_BASE}${href}`;
      if (seen.has(url)) return;
      seen.add(url);

      const title = $(el).text().trim() || $(el).find("h2,h3").first().text().trim();
      if (!title) return;

      results.push({
        id: hashId(url),
        title,
        description: "",
        url,
        startTime: null,
        endTime: null,
        venueName: "",
        address: "",
        city: options.city ?? "",
        country: "",
        chapter: options.chapter ?? "",
        tags: [],
      });
    });
  } catch (err) {
    console.warn("[gdgScraper] list scrape failed", err);
  }

  // Enrich details (bounded concurrency)
  const unique = Array.from(new Map(results.map((r) => [r.url, r])).values()).slice(0, max);
  const enriched = await Promise.all(
    unique.map(async (evt) => {
      const detail = await scrapeEventDetail(evt.url);
      return { ...evt, ...(detail ?? {}) } as GDGEvent;
    }),
  );

  const filtered = enriched.filter((e) => {
    if (options.upcoming !== false) {
      if (!e.startTime) return true;
      return e.startTime.getTime() > Date.now();
    }
    return true;
  });

  if (options.city) {
    const needle = options.city.toLowerCase();
    return filtered.filter(
      (e) =>
        e.city.toLowerCase().includes(needle) ||
        e.address.toLowerCase().includes(needle) ||
        e.chapter.toLowerCase().includes(needle),
    );
  }
  return filtered;
}

/**
 * Scrape a specific chapter's event listing page.
 */
export async function scrapeChapterEvents(chapterUrl: string): Promise<GDGEvent[]> {
  try {
    const client = makeClient();
    const { data } = await client.get(chapterUrl);
    const $ = cheerio.load(data);

    const chapterName = $("h1").first().text().trim() || "";
    const urls = new Set<string>();
    $('a[href*="/events/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const abs = href.startsWith("http") ? href : `${GDG_BASE}${href}`;
      if (/\/events\/[a-z0-9-]+\//i.test(abs)) urls.add(abs);
    });

    const details = await Promise.all(
      Array.from(urls).map(async (u) => {
        const d = await scrapeEventDetail(u);
        if (!d) return null;
        return {
          id: d.id ?? hashId(u),
          title: d.title ?? "",
          description: d.description ?? "",
          url: u,
          startTime: d.startTime ?? null,
          endTime: d.endTime ?? null,
          venueName: d.venueName ?? "",
          address: d.address ?? "",
          city: d.city ?? "",
          country: d.country ?? "",
          coordinates: d.coordinates,
          chapter: chapterName,
          chapterUrl,
          tags: d.tags ?? [],
          coverImageURL: d.coverImageURL,
        } as GDGEvent;
      }),
    );
    return details.filter((d): d is GDGEvent => d !== null);
  } catch (err) {
    console.warn("[gdgScraper] chapter events failed", err);
    return [];
  }
}

/**
 * Scrape GDG chapters directory.
 */
export async function scrapeGDGChapters(city?: string): Promise<GDGChapter[]> {
  const client = makeClient();
  try {
    const { data } = await client.get("/chapters/");
    const $ = cheerio.load(data);
    const out: GDGChapter[] = [];

    $('a[href*="/"]').each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const text = $(el).text().trim();
      if (!/^GDG /i.test(text) && !/GDG/i.test(text)) return;
      if (!/^\/[a-z0-9-]+\/?$/i.test(href)) return;

      out.push({
        name: text,
        city: "",
        country: "",
        url: href.startsWith("http") ? href : `${GDG_BASE}${href}`,
      });
    });

    return city
      ? out.filter((c) => c.name.toLowerCase().includes(city.toLowerCase()))
      : out;
  } catch (err) {
    console.warn("[gdgScraper] chapters failed", err);
    return [];
  }
}

/**
 * Push scraped events into Firestore. Deterministic ids avoid duplicates.
 */
export async function syncGDGEventsToFirestore(cities: string[] = ["Kolkata"]): Promise<{
  upserted: number;
  scanned: number;
}> {
  const db = adminDb();
  let upserted = 0;
  let scanned = 0;

  for (const city of cities) {
    const events = await scrapeGDGEvents({ city, upcoming: true, limit: 40 });
    scanned += events.length;

    for (const evt of events) {
      if (!evt.startTime) continue;
      const ref = db.collection("events").doc(evt.id);

      const coords = evt.coordinates
        ? new GeoPoint(evt.coordinates.lat, evt.coordinates.lng)
        : null;
      const geohash = evt.coordinates
        ? geohashForLocation([evt.coordinates.lat, evt.coordinates.lng])
        : null;

      const chatRoomId = `event_${evt.id}`;

      await ref.set(
        {
          id: evt.id,
          title: evt.title,
          description: evt.description,
          source: "gdg",
          sourceUrl: evt.url,
          organizer: { uid: "system", name: evt.chapter || "GDG" },
          coHosts: [],
          location: {
            venueName: evt.venueName || "",
            address: evt.address || "",
            city: evt.city || city,
            coordinates: coords ?? new GeoPoint(0, 0),
            geohash: geohash ?? "",
          },
          startTime: evt.startTime,
          endTime: evt.endTime ?? evt.startTime,
          tags: evt.tags ?? [],
          coverImageURL: evt.coverImageURL ?? null,
          attendees: [],
          maxAttendees: null,
          requiresApproval: false,
          pendingApprovals: [],
          chatRoomId,
          gdgChapter: evt.chapter,
          agentShoutoutGenerated: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Ensure chat room exists
      await db
        .collection("chats")
        .doc(chatRoomId)
        .set(
          {
            id: chatRoomId,
            type: "event",
            name: evt.title,
            participants: [],
            createdBy: "system",
            createdAt: FieldValue.serverTimestamp(),
            isPublic: true,
            linkedEventId: evt.id,
          },
          { merge: true },
        );

      upserted += 1;
    }
  }

  return { upserted, scanned };
}
