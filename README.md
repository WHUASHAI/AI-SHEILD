# AI SHIELD

**Know Where Digital Content Really Came From**

Free, open platform for AI content detection across text, images, videos, deepfakes, and enhanced media.

> ⚠️ **Accuracy Notice:** AI Shield provides probability-based analysis. Results may contain false positives or false negatives and should not be treated as definitive proof that content was generated or modified by AI.

---

## Features

- **AI Text Detection** — Linguistic pattern analysis for AI generation signals
- **AI Image Detection** — Visual artifact and metadata forensics
- **AI Video Detection** — Frame, motion, and audio-video consistency analysis
- **Deepfake Detection** — Face swap, lip-sync, and facial landmark analysis
- **Enhancement Detection** — AI upscaling, restoration, and generative fill detection
- **Metadata Analysis** — EXIF, encoding history, and integrity warnings
- **Batch Analysis** — Analyze multiple files from one dashboard
- **Free API Access** — RESTful API with fair-use rate limits

## Everything is Free

- No subscription
- No payment information required
- No locked tools or premium tiers
- Free downloadable reports
- Free API access
- Guest scanning available

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Animations | Framer Motion |
| Charts | Recharts |
| File Uploads | React Dropzone |
| Forms | React Hook Form + Zod |
| Auth | Auth.js (NextAuth v5) — *configure separately* |
| Database | PostgreSQL via Prisma ORM |
| Storage | UploadThing / Supabase Storage |
| Background Jobs | Redis + BullMQ |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your values:
- `DATABASE_URL` — PostgreSQL connection string (Supabase/Neon recommended)
- `AUTH_SECRET` — Random 32+ character secret
- `UPLOADTHING_TOKEN` — From uploadthing.com (for file uploads)
- `REDIS_URL` — Redis connection string (for background jobs)

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Landing pages (no auth)
│   │   ├── page.tsx       # Home / Landing
│   │   ├── how-it-works/
│   │   ├── use-cases/
│   │   ├── limitations/
│   │   └── about/
│   ├── (auth)/            # Auth pages
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   ├── (dashboard)/       # Protected dashboard
│   │   └── dashboard/
│   │       ├── page.tsx   # Overview
│   │       ├── new-scan/
│   │       ├── text/
│   │       ├── image/
│   │       ├── video/
│   │       ├── deepfake/
│   │       ├── enhancement/
│   │       ├── batch/
│   │       ├── history/
│   │       ├── reports/
│   │       ├── api-keys/
│   │       ├── team/
│   │       ├── settings/
│   │       ├── admin/
│   │       └── scans/[id]/
│   ├── api/               # API routes
│   │   ├── auth/
│   │   ├── scan/
│   │   └── report/
│   └── report/[token]/    # Public shared reports
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Logo, Navbar, DisclaimerBanner
│   ├── landing/           # Landing page sections
│   ├── dashboard/         # Dashboard layout components
│   ├── detection/         # Detection UI components
│   └── auth/              # Auth form components
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # Auth config
│   └── mock-data.ts       # Development mock data
└── types/
    └── index.ts           # TypeScript types
prisma/
└── schema.prisma          # Database schema
```

---

## Connecting Real AI Detection Models

The detection routes in `src/app/api/scan/` are modular stubs. Replace the mock results with real ML service calls:

```typescript
// src/app/api/scan/text/route.ts
// Replace mock result with:
const response = await fetch(process.env.AI_SERVICE_URL + '/analyze/text', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}` },
  body: JSON.stringify({ text }),
});
const result = await response.json();
```

Suggested services:
- **Text**: GPTZero API, Winston AI, custom fine-tuned LLM
- **Image**: DeepDetector API, custom CNN/ViT model
- **Video/Deepfake**: DeepMedia API, custom temporal analysis model
- **Metadata**: ExifTool (via child_process or API), custom parser

---

## Setting Up Authentication

Install NextAuth v5:

```bash
npm install next-auth@beta @auth/prisma-adapter
```

Then configure `src/lib/auth.ts` with your providers. See [next-auth.js.org/v5](https://authjs.dev) for setup guide.

---

## Background Job Queue (Redis + BullMQ)

For video processing and batch analysis:

```bash
npm install ioredis bullmq
```

Set `REDIS_URL` in your `.env.local`. Workers in `src/workers/` handle:
- Video frame extraction
- Batch file processing
- Report generation

---

## API Documentation

Base URL: `https://api.originscan.ai/v1`

All API access is **free** for registered users.
Rate limits: 100 req/hour, 1,000 req/day, 10,000 req/month.

See `/dashboard/api-keys` for keys and full documentation.

---

## Disclaimer

Results are probabilistic. AI SHIELD should be used as one signal among many, not as definitive proof. See `/limitations` for full accuracy notes.

No personal identification is performed. No AI-based accusations are made.

---

## License

MIT License. Free to use, modify, and deploy.
