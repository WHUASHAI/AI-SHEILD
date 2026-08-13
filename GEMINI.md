# AI SHIELD - Project Reference & Index (GEMINI.md)

AI SHIELD is a free, open-platform web application designed for comprehensive AI content detection across multiple media modalities (text, images, videos, deepfakes, etc.). This document serves as the repository's foundational reference, detailing system architecture, codebase indexing, data models, and team development standards.

---

## 1. Project Directory Structure & Index

Below is a detailed map of the project layout with roles and responsibilities defined for each tier.

```
C:\Users\IT TEAM\Desktop\AISHIELD\
├── prisma/
│   └── schema.prisma         # Database schema defining PostgreSQL tables via Prisma ORM
├── public/                   # Static assets (favicons, svgs, site graphics)
└── src/
    ├── app/                  # Next.js 16 (App Router) page structure
    │   ├── globals.css       # Global styling sheet including Tailwind CSS v4 configurations
    │   ├── layout.tsx        # Base root layout wrapper with ThemeProvider
    │   ├── (auth)/           # Authentication layout and flow pages
    │   │   ├── sign-in/
    │   │   ├── sign-up/
    │   │   ├── forgot-password/
    │   │   ├── reset-password/
    │   │   └── verify-email/
    │   ├── (dashboard)/      # Protected dashboard application routing
    │   │   └── dashboard/
    │   │       ├── page.tsx  # Dashboard overview panel
    │   │       ├── admin/    # Administration interface
    │   │       ├── api-keys/ # Developer API key generation and monitoring
    │   │       ├── batch/    # High-volume batch scan manager
    │   │       ├── deepfake/ # Face swap / Lip-sync detection interface
    │   │       ├── image/    # Visual artifact and metadata analysis
    │   │       ├── text/     # Linguistic patterns and text analyzer
    │   │       ├── video/    # Sequential frames and video analyzer
    │   │       ├── history/  # Past scan logs and analytics
    │   │       ├── reports/  # Reports compilation and exporting
    │   │       ├── settings/ # Account-level configurations
    │   │       └── scans/    # Detailed report dynamic viewer [id]
    │   ├── (public)/         # Anonymous / Guest pages
    │   │   ├── page.tsx      # Main landing / promotional page
    │   │   ├── about/        # Purpose and mission statement
    │   │   ├── how-it-works/ # Mechanics behind detection models
    │   │   └── limitations/  # Transparency on false-positive rates
    │   ├── api/              # Serverless API routes (Next.js route handlers)
    │   │   ├── auth/         # NextAuth custom callback stubs
    │   │   ├── scan/         # Individual and batch scanning REST stubs
    │   │   └── report/       # Downloadable and shareable report JSON APIs
    │   └── report/           # Dynamic public reports accessible by share token [token]
    ├── components/           # Modular visual components
    │   ├── ui/               # Radix UI + shadcn/ui primitives
    │   ├── shared/           # Logo, Navbar, global banners
    │   ├── auth/             # Custom passwords and social provider widgets
    │   ├── dashboard/        # Sidebars, card structures, notifications and widgets
    │   ├── detection/        # Core analytical views (Heatmaps, Verdict rings, Dropzones, etc.)
    │   └── landing/          # Hero sections, FAQs, and testimonials
    ├── lib/                  # Shared helper libraries and initializers
    │   ├── auth.ts           # Authentication stubs and configuration objects
    │   ├── db.ts             # PrismaPg connection orchestrator and singleton client
    │   ├── mock-data.ts      # Sample data for offline visual rendering and stubs
    │   └── utils.ts          # Common formatting and Tailwind classes merging helpers
    └── types/
        └── index.ts          # Strongly typed domains (ScanReport, BatchJob, API interfaces)
```

---

## 2. Tech Stack & Dependencies

| Dependency Layer | Technology Choice | Details & Specifications |
| :--- | :--- | :--- |
| **Framework** | Next.js `16.2.12` | App Router paradigm, React 19 server components |
| **View Engine** | React `19.2.4` | Server action optimization, functional components |
| **Language** | TypeScript `5.x` | Strictly typed interfaces, rigorous compilations |
| **Styling** | Tailwind CSS `^4` + `@tailwindcss/postcss` | Modern build pipeline, utility-first UI styling |
| **State & Forms** | `react-hook-form` + `zod` | Type-safe form validation schemas |
| **Database ORM** | Prisma `^7.9.0` | Declarative relational schema with `postgresql` connector |
| **Animations** | Framer Motion `12.42.2` | Clean interactive page transitions and layout transitions |
| **Visualizations** | Recharts `3.10.1` | Analytical charts for scanning trends |

---

## 3. Database Schema Blueprint (`prisma/schema.prisma`)

Key models and relational paths defined in AI Shield:

- **User**: Core profile containing role hierarchies (`"user"`, `"admin"`) and accounts associations.
- **Account / Session / VerificationToken**: Standard schemas compliant with NextAuth architecture.
- **Workspace & WorkspaceMember**: Support for multi-user collaboration tiers (roles: `"owner"`, `"admin"`, `"analyst"`, `"reviewer"`, `"viewer"`).
- **Scan**: Captures input targets (text, images, video, deepfakes, URLs), progress status, results, confidence indices, and relates to report and signals.
- **ScanSignal**: Precise metadata segments storing regional markings, sentence passages, or timeline timestamps indicating AI probability.
- **ScanMetadata**: Deep file-level forensic indices including camera manufacturers, raw EXIF blobs, GPS indicators, and compression warnings.
- **Report**: Shared reports utilizing secure share tokens (`shareToken`) for public viewing.
- **BatchJob**: Aggregates high-volume scanning workloads for pipeline parallelization.
- **ApiKey / ApiActivity**: Manage credentials and track REST requests with endpoints, performance metrics, and rate limits.
- **AuditLog**: Fully audited transaction history tracking security-sensitive workspace and admin actions.
- **Notification**: Realtime notifications (read/unread statuses) mapping to scan, batch, or system completions.

---

## 4. Analytical Domain Models (`src/types/index.ts`)

### Content Modalities & Status States
- **ContentType**: `"text"` | `"image"` | `"video"` | `"url"`
- **ScanResult**: `"human"` | `"ai_generated"` | `"ai_edited"` | `"ai_enhanced"` | `"deepfake"` | `"mixed"` | `"inconclusive"`
- **ProcessingStatus**: `"queued"` | `"uploading"` | `"validating"` | `"extracting_metadata"` | `"preparing"` | `"analyzing"` | `"generating_report"` | `"completed"` | `"failed"` | `"canceled"`

### Core Constraints & Configurations
- **PLATFORM_CONFIG**: Maximum 50 batch files, up to 500MB batch size, maximum 30-minute video duration. Up to 10 API keys per user, 25 workspace members, and 30-day retention policies.
- **File Mime-Types**:
  - *Images*: Jpeg, Png, Webp, Heic (Max 50MB)
  - *Videos*: Mp4, Quicktime, Webm, Avi (Max 2048MB)
  - *Texts*: Plain, Pdf, Docx (Max 10MB)

---

## 5. Team Architectural Mandates & Guidelines

Developers modifying or building on AI Shield must strictly observe these instructions.

### 5.1 Next.js 16 (App Router) & React 19 Core Guidance
- **Conventions & File Structures**: Follow Next.js 16 standards. Refer directly to `node_modules/next/dist/docs/` when introducing complex features or optimizing Server Actions.
- **Use Client Boundaries**: Restrict `'use client'` strictly to interactive elements requiring state hooks, event listeners, or animation libraries (e.g., framer-motion).
- **Composition over Inheritance**: Always prioritize functional composition, component wrapper encapsulation, or explicit hook structures over convoluted class extensions.

### 5.2 Strict Typing & Code Hygiene
- **No Cast Bypasses**: Never use hacks such as `as any` or disabling TS compilation errors. Ensure type guards, explicit generic arguments, and solid schema validations are implemented using `zod`.
- **Linting & Code Formatting**: Always execute standard linting checks (`npm run lint` or local config) before compiling. Maintain proper code formatting (no missing import references or loose declarations).
- **Silent Tool Executions**: Always favor silent flags (e.g., `--silent` or `--no-pager`) when compiling or running scripts to conserve log sizes and improve local runtimes.

### 5.3 Modular API Replacement Policy
- All routes residing in `src/app/api/scan/` currently serve as **modular stubs**. When hooking up actual machine-learning classification architectures, replace the local randomization mocks with real service fetches without altering the core schema interfaces return contracts.

### 5.4 Verification & Testing Protocols
- **Surgical Code Modifications**: Only target directories directly relevant to the feature or repair. Avoid global unprompted "cleanups" of external layout styles.
- **Lifecycle Integration**: Verify every functional update by launching local test servers (`npm run dev`), executing typecheck checks (`npx tsc`), and ensuring lint validations pass.
- **empirical Reproduction**: For bug fixes, write explicit test scripts or reproduce the error scenario step-by-step prior to crafting and pushing code fixes.
