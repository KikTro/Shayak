import { onDocumentCreated } from "firebase-functions/v2/firestore";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

const SCRAPER_SECRET = defineSecret("SCRAPER_SECRET");
const APP_URL = defineSecret("APP_URL");

export const onNewEvent = onDocumentCreated(
  { document: "events/{eventId}", secrets: [SCRAPER_SECRET, APP_URL] },
  async (event) => {
    const eventId = event.params.eventId;
    const data = event.data?.data();
    if (!data) return;

    const tags = (data.tags as string[] | undefined) ?? [];
    const isHack = tags.some((t) => /hack/i.test(t));

    await Promise.allSettled([
      axios.post(
        `${APP_URL.value()}/api/agents/catalyst`,
        { action: "shoutout", eventId },
        { headers: { "x-sahayak-secret": SCRAPER_SECRET.value() }, timeout: 60000 },
      ),
      isHack
        ? axios.post(
            `${APP_URL.value()}/api/agents/catalyst`,
            { action: "teamup", eventId },
            { headers: { "x-sahayak-secret": SCRAPER_SECRET.value() }, timeout: 60000 },
          )
        : Promise.resolve(null),
    ]);
  },
);
