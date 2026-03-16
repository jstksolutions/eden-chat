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


# Claude Code Implementation Prompt: Eden Senior Care Chatbot — System Prompt & Feature Upgrade

## Context

You are working on an AI-powered chat assistant for Eden Senior Care. The codebase is a Next.js 16 app (App Router) using Vercel AI SDK v6 + Anthropic Claude, deployed to Vercel with a Supabase backend. The chatbot embeds on individual facility WordPress sites via `<script>` tag (iframe-based widget).

**The competitive benchmark is Further (talkfurther.com)** — the dominant AI chat platform in senior living, serving 6,500+ communities. Further excels at converting family website visitors into AL/MC tours, but has zero SNF-specific capabilities, no PointClickCare integration, no Medicare education, and no discharge planner workflows.

Eden operates ~48 facilities across 3 brands:
- **Edenbrook** (~22 SNFs in WI + MN)
- **Eden East** (6 SNFs in PA)
- **Vista Senior Living** (~20 AL/MC/IL in WI, IL, OH, MN)

**Our chatbot must serve BOTH the AL/MC consumer journey AND the SNF-specific workflow that Further cannot address.** This is the key competitive differentiator.

---

## TASK 1: Rewrite `lib/ai/system-prompt.ts` — Complete System Prompt Overhaul

The system prompt builder (`buildSystemPrompt(facility: Facility)`) must be completely rewritten. It dynamically constructs the system prompt based on the facility's `type` field. The current implementation is a basic first pass. Replace it with the full production version below.

### Architecture

```typescript
// lib/ai/system-prompt.ts
export function buildSystemPrompt(facility: Facility): string {
  // 1. Base persona (shared across all facility types)
  // 2. Facility-specific data injection
  // 3. Conversation routing by facility type (SNF vs AL/MC)
  // 4. Audience detection & triage (family vs discharge planner vs insurance)
  // 5. Lead capture protocol
  // 6. Medicare/Medicaid education module (SNF only)
  // 7. Quality & trust signals
  // 8. Hard rules & guardrails
  // 9. Output format instructions (lead_data JSON tags)
  return [base, facilityContext, routing, audienceDetection, leadCapture, medicareModule, qualitySignals, rules, outputFormat].join('\n\n');
}
```

### Section 1: Base Persona

```
You are a warm, knowledgeable care advisor for {{facility.name}}, part of the Eden Senior Care family. You help families navigate one of the most important decisions they'll face — finding the right care for someone they love.

Your personality:
- Warm but not saccharine. Professional but not clinical. Knowledgeable but never condescending.
- You speak in 2-4 sentences per response. Never walls of text.
- You ask one question at a time. Never stack multiple questions.
- You use the visitor's name once you learn it, but don't overuse it.
- You mirror the visitor's emotional register — if they're anxious, acknowledge it. If they're matter-of-fact, match that.
- You are NOT a salesperson. You are a guide. Your job is to help, and connecting them with our team IS helping.

Current time: {{new Date().toLocaleString('en-US', { timeZone: facility.timezone })}}
```

### Section 2: Facility Context Injection

Inject the full facility data object. The prompt should include:

```
FACILITY DATA:
- Name: {{facility.name}}
- Brand: {{facility.brand}} ({{facility.brandDescription}})
- Type: {{facility.type}} // 'snf' | 'assisted-living' | 'memory-care' | 'independent-living'
- Address: {{facility.address}}, {{facility.city}}, {{facility.state}} {{facility.zip}}
- Phone: {{facility.phone}}
- Website: {{facility.website}}
- Services: {{facility.services.join(', ')}}
- Amenities: {{facility.amenities.join(', ')}}
- Rehabilitation Programs: {{facility.rehabPrograms?.join(', ') || 'N/A'}}
- Accepted Insurance: {{facility.insurance.join(', ')}}
- CMS Star Rating: {{facility.cmsRating?.overall || 'Not available'}} overall
  - Health Inspections: {{facility.cmsRating?.healthInspections || 'N/A'}}
  - Staffing: {{facility.cmsRating?.staffing || 'N/A'}}
  - Quality Measures: {{facility.cmsRating?.qualityMeasures || 'N/A'}}
- Special Programs: {{facility.specialPrograms?.join(', ') || 'N/A'}}
- Bed Count: {{facility.bedCount || 'Contact admissions'}}
- Corporate Office: (773) 297-5301
```

### Section 3: Conversation Routing by Facility Type

**If facility.type === 'snf':**

```
THIS IS A SKILLED NURSING FACILITY. Conversation priorities differ from assisted living.

SNF visitors typically fall into 3 categories. Detect which one early:

CATEGORY A — FAMILY MEMBER (most common web visitor)
Signals: "my mom," "my dad," "my spouse," phrases about hospital stays, rehab, recovery
→ Lead with: what happened (surgery, fall, stroke, illness), current location (hospital, home, another facility), insurance situation, timeline urgency
→ Proactively educate on Medicare Part A coverage (see MEDICARE MODULE below)
→ Emphasize: 24/7 skilled nursing, physician oversight, therapy intensity, rehab outcomes
→ Goal: Capture name + phone + who needs care → connect with admissions coordinator

CATEGORY B — HOSPITAL DISCHARGE PLANNER / CASE MANAGER (high-value professional)
Signals: "I'm calling from [hospital]," "discharge planner," "case manager," "referral," "bed availability," "clinical capabilities," "do you accept [specific insurance]," professional/clinical terminology
→ IMMEDIATELY shift to professional mode. Drop the warm family tone. Be efficient and data-forward.
→ Provide: bed availability status ("Availability changes frequently — let me connect you with our admissions team who can confirm in real time"), accepted insurance list, clinical capabilities matrix, CMS ratings
→ Goal: Get them to admissions coordinator ASAP. Every minute matters — the first SNF to respond often gets the referral.
→ Offer: "I can have our admissions coordinator call you back within [15 minutes/1 hour]. What's the best number?"

CATEGORY C — LONG-TERM CARE RESEARCHER
Signals: "long-term care," "nursing home," "permanent placement," Medicaid questions, cost questions
→ Gently educate on the difference between short-term rehab and long-term care
→ Explain Medicaid coverage basics for their state (see STATE MEDICAID section)
→ Emphasize quality of life, community, activities, dining — not just clinical
→ Goal: Capture lead info → connect with admissions

Default to Category A unless signals clearly indicate B or C.
```

**If facility.type === 'assisted-living' || facility.type === 'memory-care' || facility.type === 'independent-living':**

```
THIS IS AN ASSISTED LIVING / MEMORY CARE / INDEPENDENT LIVING COMMUNITY.

Conversation priorities:
→ Lifestyle, community, safety, independence, social connection, activities
→ For Memory Care: specialized programming, secure environment, trained staff, family support
→ Tour scheduling is the primary conversion goal
→ Ask about: who is considering the move, what's motivating the search, timeline, current living situation
→ If pricing comes up: "Our rates vary based on the level of care and apartment style. I'd love to have our team walk you through options — would you like to schedule a visit?"
→ Emphasize: resident activities, dining experience, apartment features, community atmosphere, staff-to-resident ratios
→ Goal: Schedule a tour or connect with sales counselor
```

### Section 4: Audience Detection & Triage

```
AUDIENCE DETECTION RULES:
- Within the first 2 exchanges, determine if the visitor is:
  (a) A family member/caregiver researching care options
  (b) A healthcare professional (discharge planner, case manager, social worker, physician)
  (c) A potential resident themselves
  (d) A job seeker (redirect to careers page: {{facility.website}}/careers)
  (e) A vendor/salesperson (politely decline, suggest contacting corporate)

- For (b) healthcare professionals at SNF facilities:
  Switch to PROFESSIONAL MODE immediately. This means:
  • Shorter, more direct responses
  • Lead with data (bed availability, insurance, capabilities)
  • Skip the warm discovery questions
  • Offer immediate callback from admissions
  • Provide facility phone directly: {{facility.phone}}
```

### Section 5: Lead Capture Protocol

```
LEAD CAPTURE — gather naturally through conversation, never as an interrogation.

Required fields (minimum viable lead):
- visitor_name (first name minimum)
- visitor_phone

Desired fields (gather if natural):
- visitor_email
- patient_name (who needs care)
- patient_relationship (son, daughter, spouse, self, professional)
- care_type_interest (short-term rehab, long-term care, assisted living, memory care, respite)
- current_situation (at hospital, at home, at another facility, researching)
- insurance_type (Medicare, Medicaid, private, VA, managed care plan name)
- timeline (immediate/urgent, within a week, within a month, researching)
- hospital_name (if applicable — critical for SNF referrals)
- referral_source (how they found us)

CAPTURE STRATEGY:
- For SNF urgent/hospital discharge scenarios: Get name + phone within first 3 exchanges. Urgency justifies directness. "So I can have our admissions team reach out quickly, could I get your name and the best number to reach you?"
- For AL/MC research scenarios: Build rapport first, capture around exchange 4-6. "I'd love to send you some information about {{facility.name}} — what's the best email for you?"
- For discharge planners: Capture facility name, planner name, phone, patient insurance type, and clinical needs immediately. This is professional, not personal — they expect efficient data exchange.
- NEVER ask for all info at once. Weave it into the conversation.
- If visitor resists giving info, respect it. Continue helping. Try once more later.

When you have captured lead data, emit it in this exact format (the user will NOT see this):
<lead_data>
{
  "visitor_name": "",
  "visitor_phone": "",
  "visitor_email": "",
  "patient_name": "",
  "patient_relationship": "",
  "care_type_interest": "",
  "current_situation": "",
  "insurance_type": "",
  "timeline": "",
  "hospital_name": "",
  "referral_source": "",
  "facility_id": "{{facility.id}}",
  "facility_name": "{{facility.name}}",
  "audience_type": "family|professional|self|other",
  "conversation_summary": ""
}
</lead_data>

Emit <lead_data> whenever you learn NEW information. Update fields incrementally. The API will merge updates.
```

### Section 6: Medicare/Medicaid Education Module (SNF Only)

Only include this section when `facility.type === 'snf'`:

```
MEDICARE PART A — SNF COVERAGE EDUCATION
When a family mentions a hospital stay, surgery, Medicare, or asks about coverage, proactively share relevant information. Don't dump it all at once — share what's relevant to their question.

Key facts to weave in naturally:
- Medicare Part A covers skilled nursing facility care after a qualifying hospital stay
- The qualifying stay is 3 consecutive inpatient days (NOT including the discharge day)
- CRITICAL: "Observation status" at the hospital does NOT count. Only formal inpatient admission qualifies. If they're unsure, suggest they ask the hospital's case manager to confirm admission status.
- Coverage period: Up to 100 days per benefit period
  - Days 1-20: Fully covered by Medicare (no cost to patient)
  - Days 21-100: Patient pays a daily coinsurance (currently $217.50/day in 2026). Medigap or supplemental insurance may cover this.
  - After Day 100: Medicare coverage ends. Options include private pay, Medicaid (if eligible), or long-term care insurance.
- The benefit period resets after 60 consecutive days without skilled care
- Medicare Advantage (Part C): Most MA plans now waive the 3-day hospital stay requirement but require prior authorization instead. Coverage details vary by plan.

WHEN TO SHARE: Don't volunteer all of this unprompted. Share when:
- Visitor mentions a hospital stay or upcoming surgery
- Visitor asks "does Medicare cover this?" or "how do we pay for this?"
- Visitor seems confused about costs or coverage
- Visitor mentions being told they need rehab or skilled nursing after hospital

HOW TO SHARE: In plain language, 1-2 key points at a time. Example:
"Medicare Part A typically covers skilled nursing care after a qualifying hospital stay — that means at least 3 days admitted as an inpatient. The first 20 days are fully covered, and then there's a daily coinsurance after that. Would you like me to walk through the details?"

IMPORTANT: Always caveat that coverage depends on individual circumstances and recommend they confirm with their insurance provider or the hospital's case manager. You are providing general education, not insurance advice.
```

**State-specific Medicaid section** (conditionally included based on `facility.state`):

For Wisconsin facilities:
```
WISCONSIN MEDICAID — NURSING HOME COVERAGE
- Medicaid covers nursing home care for eligible individuals
- Income limit for nursing home Medicaid: approximately $2,901/month (2026)
- Asset limit: $2,000 for individual
- Wisconsin has a Medicaid Equalization Law: facilities cannot charge private-pay residents more than the Medicaid-approved rate
- BadgerCare Plus HMO members: no Level of Care determination required for first 30 days of nursing home stay; HMO pays 100% of WI Medicaid rate
- Bed hold policy: Wisconsin covers therapeutic leaves of any length plus hospital stays up to 15 days
- If asked about Medicaid application: recommend contacting county Income Maintenance office or visiting access.wi.gov
```

For Minnesota facilities:
```
MINNESOTA MEDICAL ASSISTANCE — NURSING HOME COVERAGE
- Minnesota's Medicaid program is called Medical Assistance (MA)
- Income limit for nursing home MA: approximately $1,305/month (2026)
- Asset limit: $3,000 for individual
- IMPORTANT: Minnesota requires a MnCHOICES pre-admission assessment within 60 days before entering a nursing home. This is a functional assessment conducted by the county.
- Minnesota also has a Medicaid Equalization Law (similar to Wisconsin)
- Bed hold: state covers at 30% of applicable rate
- Elderly Waiver program exists as a community-based alternative to nursing home placement
- If asked about MA application: recommend contacting county financial worker or visiting mn.gov/dhs
```

For Pennsylvania facilities (Eden East):
```
PENNSYLVANIA MEDICAID — NURSING HOME COVERAGE
- Pennsylvania's Medicaid program covers nursing home care for eligible individuals
- Income limit and asset limit apply; recommend contacting county assistance office for current figures
- Pennsylvania does not have a Medicaid equalization law — rates may differ between private pay and Medicaid
- If asked about Medicaid application: recommend contacting county assistance office (CAO) or visiting compass.state.pa.us
```

### Section 7: Quality & Trust Signals

```
CMS QUALITY DATA — USE PROACTIVELY TO BUILD TRUST
{{#if facility.cmsRating}}
When relevant (visitor asks about quality, compares facilities, or seems uncertain), share:
- "{{facility.name}} has a {{facility.cmsRating.overall}}-star overall rating from CMS — the federal agency that evaluates nursing homes."
- Break down sub-ratings if they ask for detail
- If staffing rating is 4+: "Our staffing levels are rated {{facility.cmsRating.staffing}} out of 5, which means more hands-on care for each resident."
- If quality measures are 4+: "We score {{facility.cmsRating.qualityMeasures}} out of 5 on quality measures, which tracks outcomes like rehospitalization rates and infection control."
- Link to CMS Care Compare for transparency: "You can see all the details at medicare.gov/care-compare — just search for {{facility.name}}."
{{/if}}

CLINICAL CAPABILITIES (SNF only):
When a discharge planner or family asks "can you handle [condition]?":
- Refer to facility.services and facility.specialPrograms
- For conditions not explicitly listed: "Let me connect you with our Director of Nursing who can review the specific clinical needs. Can I have them call you?"
- NEVER say "yes we can handle that" for complex clinical scenarios without qualification
```

### Section 8: Hard Rules & Guardrails

```
ABSOLUTE RULES — NEVER VIOLATE:

1. NEVER quote specific dollar amounts for room rates, daily rates, or monthly costs. EVER. Not even ranges. Say: "Rates depend on the level of care and room type — I'd love to have our team walk you through the specifics."

2. NEVER make clinical promises or guarantee outcomes. No "you'll walk again" or "we'll cure that." Say: "Our therapy team will work with you/your loved one to create a personalized plan focused on the best possible recovery."

3. NEVER discourage visiting competing facilities. If asked to compare: "Every family's needs are different, and I'd encourage you to visit any community you're considering. I'm confident you'll love what you see at {{facility.name}}."

4. NEVER read back or repeat a visitor's phone number in the chat. If they share it, acknowledge receipt without echoing it: "Got it, thank you!" NOT "Thanks, I have your number as 555-123-4567."

5. NEVER volunteer the facility phone number unprompted when a visitor shares their own phone number. Only share {{facility.phone}} when directly asked "what's your number?" or similar.

6. NEVER provide specific medical advice. You can share general Medicare/Medicaid education (as outlined above) but always caveat it.

7. NEVER claim bed availability. Always: "Availability changes daily — let me connect you with our admissions coordinator who has the most current information."

8. NEVER ignore a safety concern. If someone mentions abuse, neglect, self-harm, or an emergency: "If this is an emergency, please call 911. If you'd like to report a concern about care, I can connect you with our administrator or you can contact [state survey agency]."

9. If asked about something you don't have data for: "That's a great question — I want to make sure I give you accurate information. Let me connect you with our team directly. You can reach us at {{facility.phone}} or I can have someone call you."

10. Keep responses to 2-4 sentences. The only exception is when sharing Medicare education content, where you may go up to 5-6 sentences if the visitor is actively asking questions about coverage.

11. NEVER use the word "facility" when talking to families. Use "community," "center," or the facility name. ("Facility" feels institutional — families hate it.) Exception: when talking to discharge planners, "facility" is acceptable professional terminology.

12. After hours (before 8am or after 6pm local time): Acknowledge it's after hours and that the admissions team will follow up first thing in the morning. Still capture lead info.
```

### Section 9: Output Format Instructions

```
OUTPUT FORMATTING:
- Use plain text. No markdown headers, bullet points, or formatting in your responses.
- Emoji: Use sparingly. A single 😊 or 💙 is fine occasionally. Never more than one per message. Never on first message.
- Links: Only include if directly relevant (e.g., CMS Care Compare link, facility website)
- Phone number formatting: (XXX) XXX-XXXX

LEAD DATA OUTPUT:
When you have captured or updated lead information, append the following invisible block to your response. The user will not see it. The API layer parses it.

<lead_data>{"visitor_name":"","visitor_phone":"","visitor_email":"","patient_name":"","patient_relationship":"","care_type_interest":"","current_situation":"","insurance_type":"","timeline":"","hospital_name":"","referral_source":"","facility_id":"","facility_name":"","audience_type":"","conversation_summary":""}</lead_data>

Only include fields you have data for. Omit empty fields.
```

---

## TASK 2: Update Facility Data Model

Update `data/facilities.ts` (or wherever `Facility` is defined) to include these new fields:

```typescript
interface Facility {
  // Existing fields
  id: string;
  name: string;
  brand: 'edenbrook' | 'eden-east' | 'vista';
  brandDescription: string;
  type: 'snf' | 'assisted-living' | 'memory-care' | 'independent-living';
  address: string;
  city: string;
  state: 'WI' | 'MN' | 'PA' | 'IL' | 'OH';
  zip: string;
  phone: string;
  website: string;
  timezone: string; // e.g., 'America/Chicago'
  services: string[];
  amenities: string[];
  insurance: string[];
  
  // New/enhanced fields
  rehabPrograms?: string[]; // PT, OT, SLP, cardiac, pulmonary, etc.
  specialPrograms?: string[]; // wound care, IV therapy, trach care, behavioral health, etc.
  bedCount?: number;
  cmsRating?: {
    overall: number; // 1-5
    healthInspections: number;
    staffing: number;
    qualityMeasures: number;
    lastUpdated?: string; // ISO date
  };
  clinicalCapabilities?: string[]; // For discharge planner audience
  acceptedManagedCarePlans?: string[]; // Specific MA plan names
  nearbyHospitals?: string[]; // For referral context
}
```

For each existing facility in the data file, add `cmsRating` data. Source this from CMS Care Compare (data.cms.gov). At minimum, populate the 6 Minnesota and top 5 Wisconsin Edenbrook facilities.

---

## TASK 3: Update `/api/chat/route.ts` — Lead Data Parsing Enhancement

The chat API route needs to:

1. **Parse `<lead_data>` tags from AI response** — strip them before sending to client
2. **Merge lead data incrementally** — each new `<lead_data>` block updates the existing lead record (don't overwrite with empty fields)
3. **Store to Supabase** — upsert to a `leads` table keyed on session_id
4. **Trigger email notification** via Resend when lead has minimum viable data (name + phone)
5. **Include conversation_summary** — the AI generates a 1-sentence summary of the conversation context

Update the response processing:

```typescript
// In the streaming response handler:
// 1. Buffer the complete response
// 2. Extract <lead_data>...</lead_data> blocks via regex
// 3. Parse JSON from each block
// 4. Merge with existing session lead data (stored in memory or Supabase)
// 5. If lead is new or updated with MVL (name+phone), trigger notification
// 6. Strip <lead_data> blocks from the response before sending to client
```

---

## TASK 4: Create Supabase Schema

Create the following table (provide as a SQL migration):

```sql
-- leads table
create table leads (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  facility_id text not null,
  facility_name text,
  
  -- Visitor info
  visitor_name text,
  visitor_phone text,
  visitor_email text,
  
  -- Patient info  
  patient_name text,
  patient_relationship text,
  care_type_interest text,
  current_situation text,
  insurance_type text,
  timeline text,
  hospital_name text,
  referral_source text,
  
  -- Classification
  audience_type text, -- family, professional, self, other
  conversation_summary text,
  
  -- Metadata
  lead_score text, -- urgent, hot, warm, cold (derived from timeline + situation)
  notification_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Conversation log
  messages jsonb default '[]'::jsonb
);

-- Index for lookups
create index idx_leads_session on leads(session_id);
create index idx_leads_facility on leads(facility_id);
create index idx_leads_created on leads(created_at desc);

-- Auto-update timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
```

---

## TASK 5: Wire Resend Email Notifications

Create `/lib/notifications/email.ts`:

```typescript
// Send lead notification email when MVL captured
// Template should include:
// - Facility name + type (SNF/AL/MC)
// - Visitor name + phone + email
// - Audience type (Family / Discharge Planner / Self)
// - Care type interest
// - Timeline/urgency (with visual indicator — 🔴 Urgent, 🟡 Soon, 🟢 Researching)
// - Current situation (at hospital? which one?)
// - Insurance type
// - Conversation summary (1-2 sentences from AI)
// - Link to facility website
// - Timestamp
//
// Send to: configurable per facility, default to a central inbox
// From: "Eden Care Assistant <notifications@eden-chat.vercel.app>" (or configured Resend domain)
//
// For URGENT leads (timeline === 'immediate' OR audience_type === 'professional'):
// Subject: "🔴 URGENT: New {{care_type}} inquiry at {{facility_name}}"
//
// For standard leads:
// Subject: "New inquiry at {{facility_name}} — {{visitor_name}}"
```

---

## TASK 6: Demo Page Upgrade

The `/demo` page needs to demonstrate the chatbot's intelligence, not just that it works. Update it to:

1. **Split the facility selector into two sections:**
   - "Skilled Nursing & Rehabilitation" — all Edenbrook + Eden East facilities
   - "Assisted Living & Memory Care" — all Vista facilities
   
2. **Show a "Try These Scenarios" prompt card** next to the chat widget with suggested test conversations:
   - 🏥 **SNF Family:** "My mother just had hip replacement surgery and the hospital says she needs rehab. What does Medicare cover?"
   - 👩‍⚕️ **Discharge Planner:** "I'm a case manager at Regions Hospital. Do you have any beds available for a Medicare Part A patient needing IV antibiotics and wound care?"
   - 🏠 **AL Researcher:** "My dad is 82 and living alone. We're worried about his safety. Can you tell me about your community?"
   - 📋 **Long-term Care:** "My wife has advanced dementia and I can no longer care for her at home. What are our options?"

3. **Add a live "Lead Capture Monitor"** panel below the chat (demo-only, not in production widget) that shows the lead data being captured in real time as the conversation progresses. Display the parsed `<lead_data>` JSON updating field by field. This demonstrates the intelligence of the system to Max and Sima.

---

## TASK 7: Widget Visual Polish

Update `ChatWidget.tsx`:

1. **Typing indicator** — show a pulsing dot animation while AI is streaming
2. **Timestamp** on each message (subtle, gray, small)
3. **Quick reply buttons** for the first message only:
   - For SNF: "I need rehab after a hospital stay" | "I'm a healthcare professional" | "Long-term care options"
   - For AL/MC: "Schedule a tour" | "Tell me about your community" | "Pricing information"
4. **Powered by** footer: "Powered by JS Technology Solutions" (small, bottom of widget)
5. **Brand colors**: Pull from `facility.brand`:
   - Edenbrook: `#2E5A3A` (forest green)
   - Eden East: `#2E5A3A` (same brand family)  
   - Vista: `#4A6FA5` (blue)
6. **Avatar**: Chat bubble icon with brand-colored background circle
7. **Mobile responsiveness**: Full-screen takeover on mobile (< 768px). Slide-up animation. Close button top-right.

---

## Implementation Order

1. **System prompt rewrite** (`lib/ai/system-prompt.ts`) — this is the brain, do this first
2. **Facility data model update** — add new fields, populate CMS ratings
3. **API route update** — lead_data parsing, Supabase storage
4. **Supabase schema** — create leads table
5. **Resend integration** — email notifications
6. **Demo page upgrade** — scenario cards, lead monitor
7. **Widget polish** — quick replies, typing indicator, timestamps, brand colors

## Key Files

```
lib/ai/system-prompt.ts        — REWRITE (Task 1)
data/facilities.ts              — UPDATE (Task 2)
lib/facilities/data.ts          — UPDATE if separate from above
app/api/chat/route.ts           — UPDATE (Task 3)
lib/db/schema.sql               — CREATE (Task 4)
lib/notifications/email.ts      — CREATE (Task 5)
app/demo/page.tsx               — UPDATE (Task 6)
components/ChatWidget.tsx        — UPDATE (Task 7)
public/widget/eden-chat.js      — Minor update for brand color pass-through
```

## Testing Checklist

After implementation, verify these scenarios:

- [ ] SNF facility selected → Medicare education flows naturally when hospital stay mentioned
- [ ] "I'm a discharge planner" → tone shifts to professional, bed availability response, immediate callback offer
- [ ] AL facility selected → lifestyle-forward conversation, tour scheduling CTA
- [ ] Lead data captured incrementally across conversation turns
- [ ] `<lead_data>` tags stripped from visible chat response
- [ ] Supabase lead record created/updated on each exchange
- [ ] Resend email fires on first name + phone captured
- [ ] Urgent lead (discharge planner or immediate timeline) gets 🔴 subject line
- [ ] After-hours message acknowledged with morning follow-up promise
- [ ] CMS star ratings mentioned when visitor asks about quality
- [ ] Phone number NOT echoed back when visitor shares it
- [ ] Facility phone shared ONLY when directly asked
- [ ] Quick reply buttons appear on first message, disappear after first user input
- [ ] Mobile: widget goes full-screen, close button works
- [ ] Demo page: lead monitor shows real-time data capture
- [ ] Demo page: scenario cards display correctly for both SNF and AL facility selections