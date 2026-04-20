# Eden Chat — Demo Notes

## Live URL
- Production: `https://eden.jstech-inc.com` (attach the domain in Vercel after first auto-deploy)
- Fallback: the auto-generated `eden-chat-*.vercel.app` URL from the first demo-hardening deploy

## Demo credentials (password auth — `demo-2026`)
| Email | Role | Display name |
|---|---|---|
| `demo-sima@edenseniorhc.com` | admin | Sima Lerman (Demo) |
| `demo-matt@edenseniorhc.com` | regional | Matt Dunn (Demo) |
| `jonathan@jstech-inc.com` | owner | Jonathan Serle |

`NEXT_PUBLIC_DEMO_MODE=true` surfaces a **one-click Demo Login** button on `/login` that signs in as Sima instantly.

## The 3 demo routes
1. `/embed/mission-creek` — public chat widget, the anchor of the demo. Try the memory-care flow; tour request triggers a confirmation card and writes a lead.
2. `/app/stats` — live Stats funnel (Visitors → Interactions → Leads → Tours → Move-ins) over the last 30 days, plus daily trend chart.
3. `/app/conversations` — all scored and stage-tracked chats. Click through to a conversation detail page.

## Anchor lead for the demo
- **Bill Henderson** (Mission Creek, memory_care, move-in score 92, urgent, tour_scheduled)
- Deep-link: `/app/conversations/1c13a336-c58e-4e72-ad7d-00c960d607a9`

## Seeded state
- 1 organization: Eden Senior Care
- 6 communities (IL/OH): Eden Vista Barrington, Eden Vista Wheaton, Mission Creek, Eden Vista Skokie, Eden Heritage Arlington, Eden Gardens Columbus
- 12 leads across 14 days (urgent/hot/warm/cold mix)
- 52 conversation messages, 47 CRM timeline events
- 3 user profiles tied to the Eden org

## What's live vs stubbed

**Live (functional):**
- `/` — chat widget picker, 6 communities + 30+ legacy facilities
- `/embed/[slug]` — public embed route (iframe-safe)
- `/login` — password + Demo Login
- `/app/stats`, `/app/conversations`, `/app/conversations/[id]`, `/app/communities`, `/app/web-assistant`
- `/app/settings` (Profile, Users & Permissions, Tour Availability)

**Phase 2 stubs (every nav item renders a branded empty state with the "Ships in Phase 2" pill):**
- AI Insights, Static Webforms, Landing Pages, AI Agents, Phone Calls, Messaging
- Settings: Move-In Upload, Amenities, Campaigns, Marketing Email, Email Suppression List, Google Ads, Qualifying Leads, Unqualified Lead Filter, Content Hub, VSA Banner

**Phase 3 stub:**
- Job Applicants

## Demo-day safety checklist
Before showing the dashboard live:
- [ ] Vercel **Deployment Protection** turned **OFF** on production — Sima must not hit a 403
- [ ] `NEXT_PUBLIC_DEMO_MODE=true` set in Vercel production env
- [ ] `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` present in Vercel production env
- [ ] Custom domain `eden.jstech-inc.com` attached in Vercel and DNS pointing at the Vercel CNAME
- [ ] `/robots.txt` serves `Disallow: /` (blocks indexing)
- [ ] Spot-check: visit `/app/phone-calls` — should render the Phase 2 empty state, no 404
- [ ] Spot-check: visit `/app/conversations/1c13a336-c58e-4e72-ad7d-00c960d607a9` — Bill Henderson's detail view renders

## Running locally
```bash
npm install
npm run build
npm run start    # http://localhost:3000
```

Requires `.env.local` with the Supabase + Anthropic + Resend credentials (see `.env.example`).

## Email notifications
`lib/notifications/email.ts` defaults `FROM` to `onboarding@resend.dev` when `RESEND_FROM_ADDRESS` isn't set. That address is always deliverable but only to the Resend account owner — fine for demo, swap when a custom domain is Resend-verified.

## What's intentionally NOT built
Per the hardening brief, these stayed out of scope:
- Real WelcomeHome / Twilio / SMS / phone recording integrations
- Real ad-platform connections (Google Ads / Facebook)
- Email campaign builder, suppression lists, calendar sync
- Benchmarking, Content Hub, Job Applicants flow
- Move-In batch upload, financial-provider handoff

Each of these has a Phase 2 stub page so the demo surface matches the SOW scope.
