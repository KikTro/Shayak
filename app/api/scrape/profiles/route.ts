import { NextResponse, type NextRequest } from "next/server";
import {
  fetchGDGProfile,
  fetchGitHubUser,
  fetchTwitterProfile,
  searchGitHubByLocation,
} from "@/lib/scraping/profileScraper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const github = searchParams.get("github");
  const twitter = searchParams.get("twitter");
  const gdg = searchParams.get("gdg");
  const city = searchParams.get("city");
  const language = searchParams.get("language") ?? undefined;

  if (github) {
    const data = await fetchGitHubUser(github);
    return NextResponse.json({ ok: !!data, data });
  }
  if (twitter) {
    const data = await fetchTwitterProfile(twitter);
    return NextResponse.json({ ok: !!data, data });
  }
  if (gdg) {
    const data = await fetchGDGProfile(gdg);
    return NextResponse.json({ ok: !!data, data });
  }
  if (city) {
    const users = await searchGitHubByLocation(city, language, 20);
    return NextResponse.json({ ok: true, users });
  }
  return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
}
