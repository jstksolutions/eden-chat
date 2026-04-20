# Eden Chat — Demo Notes (Apr 20, 2026)

## URLs
- Production: https://eden.jstech-inc.com
- Embed (demo anchor): https://eden.jstech-inc.com/embed/mission-creek
- Admin Stats: https://eden.jstech-inc.com/app/stats
- All Conversations: https://eden.jstech-inc.com/app/conversations
- Bill's Detail: https://eden.jstech-inc.com/app/conversations/1c13a336-c58e-4e72-ad7d-00c960d607a9
- All Communities: https://eden.jstech-inc.com/app/communities
- Phase 2 stub (for "what ships next"): https://eden.jstech-inc.com/app/phone-calls

## Demo credentials (password: `demo-2026`)
| Email | Role | Display name |
|---|---|---|
| `demo-sima@edenseniorhc.com` | admin | Sima Lerman (Demo) |
| `demo-matt@edenseniorhc.com` | regional | Matt Dunn (Demo) |
| `jonathan@jstech-inc.com` | owner | Jonathan Serle |

`/login` shows a **Demo Login (Sima Lerman)** one-click button while `NEXT_PUBLIC_DEMO_MODE=true` is set in the production env.

## Anchor lead
- **Bill Henderson** — son inquiring for mother Margaret, 82, memory care
- Community: Mission Creek, Waukegan IL
- Lead score: 🔴 Urgent (92 move-in score), tour scheduled
- Deep link: [/app/conversations/1c13a336-c58e-4e72-ad7d-00c960d607a9](https://eden.jstech-inc.com/app/conversations/1c13a336-c58e-4e72-ad7d-00c960d607a9)

## Demo flow (suggested)
1. **`/embed/mission-creek`** — show the visitor-facing chat widget. Try "My mother has mid-stage dementia — can you tell me about your memory care?" and "I'd like to schedule a tour this weekend."
2. **`/app/stats`** — Sima's view after login. Funnel (Visitors → Interactions → Leads → Tours → Move-ins) + 30-day trend. Teal bars for positive conversion, coral when step drop-off exceeds 50%.
3. **`/app/conversations`** — search "Bill" to land on the anchor.
4. **Bill's detail** — walk through the three columns: QuickJumpRail on the left, the conversation + Rachel's note in the center, Community / Details / Processing / Lists tabs on the right. Change the CRM stage dropdown live to show write-back.
5. **`/app/communities`** — Matt's regional view. 6 communities, edit drawer, pause toggle.
6. **`/app/phone-calls`** — click through to show the Phase 2 stub (specific Sima copy about phone tracking).

## Reset demo button
Top-right of the chat widget (chevron/refresh icon). Clears the session cookie and returns to the welcome state. Only visible when `NEXT_PUBLIC_DEMO_MODE=true`.

## What's live vs Phase 2
**Live:** chat widget with facility context, password + demo login, auth-protected admin shell, Stats funnel + trend, All Conversations table, Bill's detail page (including live CRM writes), All Communities + edit drawer, Web Assistant embed snippet tool, Settings (Profile, Users & Permissions, Tour Availability).

**Phase 2 stubs (all render a branded empty state + teal "Ships in Phase 2" pill):** AI Insights, Static Webforms, Landing Pages, AI Agents, Phone Calls, Messaging, plus ten Settings sub-items (Move-In Upload, Amenities, Campaigns, Marketing Email, Email Suppression List, Google Ads, Qualifying Leads, Unqualified Lead Filter, Content Hub, VSA Banner).

**Phase 3 stub:** Job Applicants.

## Sanity checks pre-call
- [x] `/` returns 200
- [x] `/app/stats` 307 → `/login` when unauthenticated; renders funnel + chart when authenticated
- [x] `/embed/mission-creek` returns 200
- [x] `/robots.txt` disallows all
- [x] `/api/chat` streams real AI responses grounded in facility data
- [x] Bill Henderson appears on `/app/conversations` and at the deep link
- [x] All 6 communities render on `/app/communities`
- [x] Every Phase 2 stub route renders its empty state (not a crash or 404)
- [x] Custom domain `eden.jstech-inc.com` is live
- [x] Vercel Deployment Protection is **OFF** for production (user verified)
- [x] Preview + production share the same env vars (user added Preview scope)

## Email notifications
`lib/notifications/email.ts` reads `RESEND_FROM_ADDRESS`; defaults to Resend's sandbox `onboarding@resend.dev` if not set. Custom sender will need `eden.jstech-inc.com` verified in Resend — not blocking for the demo.

## Known quirks
- `/api/lead` is a stub that logs leads but doesn't persist. Real persistence happens inside `/api/chat` via `<lead_data>` tag extraction — the route that matters for the demo.
- Chat widget at `/embed/[slug]` fills its iframe. When visited directly on a full desktop window it stretches. Designed for iframe embed on Eden WordPress sites.
- The Chrome extension I used from the automation pane throws `Cannot access a chrome-extension:// URL of different extension` on some interactive actions — doesn't affect the actual app, only automated click testing. E2E was instead validated via scripted HTTP + cookie-authenticated request path.

## Running locally
```bash
npm install
npm run build
npm run start   # http://localhost:3000
```

Requires `.env.local` populated per `.env.example`.
