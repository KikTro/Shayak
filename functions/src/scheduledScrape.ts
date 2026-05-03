import { onSchedule } from "firebase-functions/v2/scheduler";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

const SCRAPER_SECRET = defineSecret("SCRAPER_SECRET");
const APP_URL = defineSecret("APP_URL");

/**
 * Runs every 4 hours — triggers the Next.js API route that owns scraping logic.
 * This keeps scraping code in a single place and centralizes rate-limiting.
 */
export const scheduledScrape = onSchedule(
  {
    schedule: "every 4 hours",
    timeZone: "Asia/Kolkata",
    timeoutSeconds: 540,
    secrets: [SCRAPER_SECRET, APP_URL],
  },
  async () => {
    const url = `${APP_URL.value()}/api/scrape/gdg`;
    await axios.post(
      url,
      { cities: ["Kolkata", "Mumbai", "Bangalore", "Delhi", "Hyderabad"] },
      { headers: { "x-sahayak-secret": SCRAPER_SECRET.value() }, timeout: 300000 },
    );
  },
);
