# SAHAYAK

> Community intelligence for developer communities.
> **Built in loving memory of Kiran Mishra · GDG Cloud Kolkata 🕊️**

Sahayak is a multi-agent, AI-powered community growth platform for developer
communities — starting with GDG chapters. Three autonomous agents (Scout,
Matchmaker, Catalyst) continuously discover builders, introduce them with
purpose, and keep the community alive with timely, human-sounding posts.

---

## Architecture

```
                       ┌──────────────────────────────────────┐
                       │        Next.js 14 (App Router)       │
                       │    Tailwind · Framer Motion · TS     │
                       └──────────────────────────────────────┘
                                         │
                 ┌───────────────────────┼────────────────────────┐
                 │                       │                        │
         ┌───────▼────────┐     ┌────────▼────────┐      ┌────────▼────────┐
         │    Firebase    │     │  Next API (SSR) │      │  Google Maps    │
         │  Firestore     │◄────┤   /api/*        │─────▶│  + Places API   │
         │  Auth          │     └────────┬────────┘      └─────────────────┘
         │  Realtime DB   │              │
         │  Storage       │              ▼
         │  FCM           │     ┌─────────────────┐
         └────────┬───────┘     │ Vertex AI Gemini│
                  │             │   2.0 Flash     │
                  │             └─────────────────┘
                  │
      ┌───────────┼───────────────┐
      │           │               │
┌─────▼────┐ ┌────▼─────┐  ┌──────▼─────┐
│  SCOUT   │ │MATCHMAKER│  │  CATALYST  │
│ finds    │ │ connects │  │  narrates  │
│builders  │ │builders  │  │  community │
└──────────┘ └──────────┘  └────────────┘
      │           │               │
      └───────────┴──────┬────────┘
                         │
                 Cloud Functions
             (Firestore + Scheduler triggers)
                         │
                 Cloud Run / Cloud Functions
              (Puppeteer-heavy scrape fallback)
```

## Stack

- **Frontend** — Next.js 14 App Router, React 18, TypeScript (strict), Tailwind CSS, Framer Motion, Lucide icons
- **Backend / AI** — Vertex AI (Gemini 2.0 Flash), Cloud Functions, Cloud Run, Cloud Scheduler
- **Data** — Firestore (primary), Realtime Database (presence/typing), Cloud Storage, FCM
- **Scraping** — Cheerio + Axios for HTML, Puppeteer (optional) for JS-heavy pages
- **Design** — Dark-only, editorial: sharp corners, no shadows, Inter Tight / Playfair / JetBrains Mono

---

## Getting started

```bash
# 1. Clone & install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in Firebase, Gemini, Maps, and scraper secret values.

# 3. Run dev
npm run dev
# http://localhost:3000
```

### Firebase setup

```bash
npm i -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes,storage:rules,database
cd functions && npm install && npm run build && firebase deploy --only functions
```

Secrets used by Cloud Functions:

```bash
firebase functions:secrets:set SCRAPER_SECRET
firebase functions:secrets:set APP_URL
```

### Vertex AI

1. Enable the **Vertex AI API** on your GCP project.
2. Create a service account with **Vertex AI User** role; download the JSON key.
3. Set `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`.
4. Set `GOOGLE_CLOUD_PROJECT_ID` and `VERTEX_AI_LOCATION` (`us-central1`).

### Google Maps

1. Create a Maps JS API key restricted to your domain.
2. Create a Geocoding / Places API server key with IP restrictions.
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_SERVER_KEY`.

### Cloud Run (optional Puppeteer worker)

For JS-heavy scrape targets, deploy Puppeteer in a container:

```Dockerfile
FROM node:20-bullseye
RUN apt-get update && apt-get install -y chromium fonts-liberation
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 8080
CMD ["node", "dist/scraper-worker.js"]
```

```bash
gcloud run deploy sahayak-scraper \
  --source . --region asia-south1 \
  --no-allow-unauthenticated \
  --set-env-vars SCRAPER_SECRET=$SCRAPER_SECRET
```

---

## Environment variables

See `.env.example` for the full list. Minimum required:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK |
| `FIREBASE_ADMIN_*` | Firebase Admin SDK (server) |
| `GOOGLE_CLOUD_PROJECT_ID` | Vertex AI / Admin SDK |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini generation |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client Maps |
| `GOOGLE_MAPS_SERVER_KEY` | Server geocoding |
| `SCRAPER_SECRET` | Protects scrape endpoints |
| `GITHUB_TOKEN` | Higher GitHub API limit |
| `TWITTER_BEARER_TOKEN` | Optional |

---

## Agent prompts

All three agents use Gemini 2.0 Flash with JSON output mode. Prompts live in
`lib/agents/*.ts`.

- **Scout** — `lib/agents/scout.ts`
- **Matchmaker** — `lib/agents/matchmaker.ts`
- **Catalyst** — `lib/agents/catalyst.ts`

Every agent logs each action into `agentActions/` with a `pending → running →
completed|failed` lifecycle. The admin panel at `/agent` visualises this live.

---

## Design system (zero-deviation)

- **Only dark mode** — `#0A0A0A` background, `#FAFAFA` foreground
- **Accent** — `#FF3D00` (vermillion), used sparingly
- **No border-radius anywhere** (globally `none` in `tailwind.config.ts`)
- **No shadows** — depth from typography, thin dividers, bg alternation
- **Outline icons only** — `lucide-react` `strokeWidth={1.5}`
- Typography: Inter Tight display / Playfair Display italic pull quotes / JetBrains Mono labels
- **Noise grain overlay** — 1.5% opacity `feTurbulence` on every page
- Container `max-w-[1200px]`, asymmetric 7/5 or 8/4 grids
- Animations: 150ms micro, 200ms transitions, curve `cubic-bezier(0.25, 0, 0, 1)`

---

## Deployment

```bash
# Vercel (recommended)
vercel --prod

# Functions
cd functions && firebase deploy --only functions
```

---

## Memorial

Every element of Sahayak carries Kiran's spirit:

- **Footer** — `Built in loving memory of Kiran Mishra · GDG Cloud Kolkata 🕊️`
- **Agent page** — *"The agents carry Kiran's spirit — always discovering, always connecting."*
- **Home** — Playfair pull-quote: *"While we planned to celebrate, our hearts knew — the best tribute is to keep building."*
- **Community page** — Counter of connections made in Kiran's memory.

---

## License

MIT for the code. The memorial is forever.