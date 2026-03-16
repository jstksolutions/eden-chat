# Eden Senior Care — AI Chat Assistant

## What This Is
A production-ready AI chatbot widget for Eden Senior Care's 50+ facility network. Deployable as a single JS snippet on any Eden website (WordPress). Handles both:
- **AL/IL lead gen** (Vista Senior Living facilities): tour scheduling, amenity questions, pricing inquiries
- **SNF admissions support** (Edenbrook facilities): insurance verification Q&A, rehab services, clinical capabilities, discharge planner info, CMS quality data

The chatbot is built to replace/outperform Further (talkfurther.com), the incumbent vendor Eden is evaluating.

## Why It Exists (Business Context)
Eden's CEO asked JS Tech to build a "ChatBox" application similar to Further's product. This is a proactive build — we're delivering a working system before they sign with Further. The goal is to demo a fully functional chatbot that:
1. Is immediately deployable across Eden's fragmented website architecture
2. Handles the SNF admissions workflow that Further doesn't support well
3. Is customized to Eden's actual facilities, services, and insurance panels
4. Captures leads and sends notifications to facility admissions teams

## Stack
- **Framework**: Next.js 14+ (App Router)
- **AI**: Vercel AI SDK + Anthropic Claude (claude-sonnet-4-5)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + pgvector for RAG)
- **Deployment**: Vercel
- **Widget delivery**: Standalone JS bundle served from Vercel, embedded via `<script>` tag on WordPress sites

## Architecture

### Three-Layer Design
```
[Widget Layer]  →  Embeddable JS chat bubble (iframe-based)
                   Loads on any Eden WordPress site
                   Auto-detects facility from hostname

[API Layer]     →  Next.js API routes
                   /api/chat — streaming chat endpoint
                   /api/lead — lead capture + email notification
                   /api/facilities — facility data endpoint

[Knowledge Layer] → Supabase pgvector
                    Facility-specific data (services, insurance, amenities)
                    FAQs and common questions
                    CMS quality metrics per facility
```

### Facility Detection
Each Eden facility has its own domain (e.g., edenbrookedina.com, edenbrookgreenbay.com). The widget auto-detects which facility it's on via `window.location.hostname` and loads facility-specific context. This is the key differentiator vs. Further — every conversation is grounded in that specific facility's real data.

## Key Files & Directories
```
/app                    → Next.js App Router pages
/app/api/chat/route.ts  → Streaming chat endpoint (Vercel AI SDK)
/app/api/lead/route.ts  → Lead capture + email notification
/app/demo/page.tsx      → Full-page demo (for showing Max/Sima)
/components/            → React components
/components/ChatWidget.tsx → Main chat widget component
/lib/                   → Utilities
/lib/ai/system-prompt.ts → System prompt construction
/lib/ai/facility-context.ts → Facility-specific data loader
/lib/facilities/        → Facility data files (JSON)
/lib/supabase/          → Supabase client + queries
/public/widget/         → Built widget JS bundle
/scripts/               → Build scripts for widget bundle
/data/                  → Facility seed data
```

## Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run build:widget` — Bundle embeddable widget JS
- `npm run seed` — Seed facility data to Supabase
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript strict check

## Code Style
- TypeScript strict mode, no `any` types
- ES modules (import/export), never CommonJS
- Functional components with hooks, no class components
- Tailwind utility classes, no custom CSS files
- Named exports, not default exports (except page.tsx)
- Use Vercel AI SDK patterns for all LLM interactions (useChat, streamText)
- All API routes use Edge Runtime where possible

## Facility Data Model
Each facility record includes:
```typescript
interface Facility {
  id: string;                    // e.g., "edenbrook-edina"
  name: string;                  // "Edenbrook Edina"
  type: "snf" | "al" | "memory_care" | "rehab";
  hostname: string;              // "www.edenbrookedina.com"
  address: string;
  phone: string;
  services: string[];            // ["skilled nursing", "long-term care", "short-term rehab"]
  amenities: string[];           // ["24/7 nursing", "beauty salon", "pet visitation"]
  insuranceAccepted: string[];   // ["Medicare Part A", "Medicaid", "Most Medicare Advantage"]
  rehab: {
    physical: boolean;
    occupational: boolean;
    speech: boolean;
    cardiac: boolean;
  };
  specialPrograms: string[];     // ["wound care", "IV therapy", "post-surgical"]
  cmsRating?: {
    overall: number;
    healthInspections: number;
    staffing: number;
    qualityMeasures: number;
  };
  contactEmail: string;          // admissions contact
  division: "edenbrook" | "vista" | "eden_east" | "eden_health";
  state: string;
}
```

## System Prompt Strategy
The system prompt is dynamically constructed per conversation:
1. Base persona (warm, knowledgeable senior care advisor)
2. Facility-specific context injected based on detected hostname
3. Conversation type routing:
   - SNF visitors → insurance/clinical/admissions focus
   - AL/IL visitors → lifestyle/amenity/tour-scheduling focus
4. Lead capture triggers (name, phone, email, care need, timeline)
5. Escalation rules (when to hand off to human)

## Critical Business Rules
- NEVER quote specific pricing — always say "pricing varies based on care needs, insurance, and length of stay" and offer to connect with admissions
- NEVER make clinical promises or diagnoses
- ALWAYS capture lead info before the conversation ends (name + phone minimum)
- For SNF inquiries: proactively mention Medicare Part A coverage, 3-day qualifying stay requirement, and rehabilitation services
- For AL inquiries: focus on lifestyle, community, and scheduling a tour
- If asked about a different Eden facility, provide basic info and offer to transfer/connect
- After-hours acknowledgment: if outside business hours, acknowledge and promise follow-up

## Widget Embed Code (Target Output)
The final deliverable is a single snippet that Eden can paste into their WordPress sites:
```html
<script
  src="https://eden-chat.vercel.app/widget/eden-chat.js"
  data-facility-id="edenbrook-edina"
  data-position="bottom-right"
  data-primary-color="#2E5A3A"
  async
></script>
```

## Testing
- Test each facility hostname mapping
- Test SNF vs AL conversation routing
- Test lead capture flow
- Test streaming responses
- Test mobile responsiveness of widget
- Test widget loading on WordPress (iframe isolation)

## Deployment
- Vercel for hosting (free tier sufficient for demo)
- Supabase free tier for database
- Anthropic API key needed (ANTHROPIC_API_KEY env var)
- Custom domain optional for demo (eden-chat.vercel.app works)

## What NOT to Build (Scope Control)
- No CRM integration (demo only — leads go to email)
- No PointClickCare integration (future phase)
- No real-time bed availability (static data for now)
- No SMS/phone channel (web chat only)
- No analytics dashboard (future phase)
- No multi-language support (English only for demo)

## Reference
- Further product: https://www.talkfurther.com/ (competitor benchmark)
- Eden corporate: https://www.edenseniorhc.com/
- Edenbrook sites share WordPress template: Home → About → Amenities → Rehabilitation → Careers → Blogs → Contact
- Each facility has its own domain: edenbrookedina.com, edenbrookgreenbay.com, etc.
- Current contact forms collect: first name, last name, phone, email, inquiry purpose, relationship to resident
