import { onDocumentCreated } from "firebase-functions/v2/firestore";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

const SCRAPER_SECRET = defineSecret("SCRAPER_SECRET");
const APP_URL = defineSecret("APP_URL");

export const onNewUser = onDocumentCreated(
  { document: "users/{userId}", secrets: [SCRAPER_SECRET, APP_URL] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const uid = event.params.userId;
    const displayName = (data.displayName as string) ?? "Builder";

    // Fire Scout enrichment + Catalyst welcome
    await Promise.allSettled([
      axios.post(
        `${APP_URL.value()}/api/agents/scout`,
        { action: "enrich-self", city: data.location?.city ?? "Kolkata" },
        { headers: { "x-sahayak-secret": SCRAPER_SECRET.value() }, timeout: 60000 },
      ),
      axios.post(
        `${APP_URL.value()}/api/agents/catalyst`,
        { action: "welcome", uid, displayName },
        { headers: { "x-sahayak-secret": SCRAPER_SECRET.value() }, timeout: 60000 },
      ),
    ]);
  },
);
