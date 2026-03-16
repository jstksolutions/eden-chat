import { Resend } from "resend";
import type { LeadRow } from "@/lib/db/supabase";
import { SCORE_EMOJI } from "@/lib/leads/scoring";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Eden Care Assistant <notifications@eden-chat.vercel.app>";
const DEFAULT_TO = "admissions@edenseniorhc.com";

// Minimum data required before we bother sending an email.
function hasMinimumData(lead: LeadRow): boolean {
  return !!(lead.visitor_name?.trim() && lead.visitor_phone?.trim());
}

function effectiveScore(lead: LeadRow): string {
  return lead.lead_score ?? "warm";
}

function buildSubject(lead: LeadRow): string {
  const facility = lead.facility_name ?? "Eden Care";
  const score = effectiveScore(lead);
  const name = lead.visitor_name ?? "Prospective Family";
  const emoji = SCORE_EMOJI[score as keyof typeof SCORE_EMOJI] ?? "🟡";

  switch (score) {
    case "urgent": {
      const reason =
        lead.audience_type === "professional"
          ? "Discharge Planner Inquiry"
          : "Immediate Placement Needed";
      return `${emoji} URGENT — ${reason} | ${facility}`;
    }
    case "hot":
      return `${emoji} Hot Lead — ${name} | ${facility}`;
    case "warm":
      return `${emoji} New Care Inquiry — ${name} | ${facility}`;
    default:
      return `${emoji} New Inquiry — ${name} | ${facility}`;
  }
}

function row(label: string, value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#111827;font-size:13px;">${value}</td>
    </tr>`;
}

function section(title: string, rows: string): string {
  const content = rows.trim();
  if (!content) return "";
  return `
  <div style="margin-bottom:24px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">${title}</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
      <tbody>${content}</tbody>
    </table>
  </div>`;
}

function buildHtml(lead: LeadRow, sentAt: string): string {
  const score = effectiveScore(lead);
  const isUrgent = score === "urgent";
  const isHot = score === "hot";

  // Accent color: red for urgent, orange for hot, green otherwise
  const accentColor = isUrgent ? "#dc2626" : isHot ? "#ea580c" : "#2E5A3A";
  const bannerBg = isUrgent ? "#fef2f2" : isHot ? "#fff7ed" : "#f0fdf4";
  const bannerBorder = isUrgent ? "#fca5a5" : isHot ? "#fed7aa" : "#86efac";
  const bannerText = isUrgent
    ? "⚡ Urgent inquiry — respond within the hour"
    : isHot
    ? "🔥 Hot lead — hospital setting or imminent need. Follow up today."
    : "A prospective resident or family member reached out via the website chat widget.";

  // Score badge in header
  const scoreEmoji = SCORE_EMOJI[score as keyof typeof SCORE_EMOJI] ?? "🟡";
  const scoreLabel = score.charAt(0).toUpperCase() + score.slice(1);

  // Tour banner (shown above contact info when tour was requested)
  const tourBanner =
    lead.tour_requested === true
      ? `
  <div style="margin-bottom:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#1d4ed8;">
      🗓️ TOUR REQUESTED — ${lead.tour_preferred_time ?? "time TBD"}
    </p>
    <p style="margin:6px 0 0;font-size:12px;color:#3b82f6;">
      This visitor asked to schedule an in-person tour. Reach out to confirm a time.
    </p>
  </div>`
      : "";

  const contactRows =
    row("Name", lead.visitor_name) +
    row("Phone", lead.visitor_phone) +
    row("Email", lead.visitor_email);

  const careRows =
    row(
      "Inquiry for",
      lead.patient_name
        ? `${lead.patient_name} (${lead.patient_relationship ?? "relationship unknown"})`
        : lead.patient_relationship
    ) +
    row("Care type", lead.care_type_interest) +
    row("Current situation", lead.current_situation) +
    row("Insurance", lead.insurance_type) +
    row("Timeline", lead.timeline) +
    row("Hospital", lead.hospital_name) +
    row("Referral source", lead.referral_source) +
    row("Visitor type", lead.audience_type) +
    row("Lead score", `${scoreEmoji} ${scoreLabel}`);

  const summaryBlock = lead.conversation_summary?.trim()
    ? `
  <div style="margin-bottom:24px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Conversation Summary</p>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap;">${lead.conversation_summary}</p>
  </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${accentColor};padding:20px 28px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Eden Care Assistant</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">${lead.facility_name ?? "Eden Senior Care"} &nbsp;·&nbsp; ${scoreEmoji} ${scoreLabel} Lead</p>
          </td>
        </tr>

        <!-- Urgency banner -->
        <tr>
          <td style="background:${bannerBg};border-bottom:1px solid ${bannerBorder};padding:12px 28px;">
            <p style="margin:0;font-size:13px;color:${accentColor};">${bannerText}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            ${tourBanner}
            ${section("Contact Information", contactRows)}
            ${section("Care Details", careRows)}
            ${summaryBlock}

            <!-- CTA -->
            <div style="text-align:center;margin-top:8px;">
              <a href="tel:${(lead.visitor_phone ?? "").replace(/\D/g, "")}"
                 style="display:inline-block;background:${accentColor};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Call ${lead.visitor_name ?? "Prospect"} Now
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 28px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Captured via Eden Care Assistant widget &nbsp;·&nbsp; ${sentAt}<br>
              Session: ${lead.session_id}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendLeadEmail(lead: LeadRow): Promise<void> {
  if (!hasMinimumData(lead)) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — skipping email for lead", lead.session_id);
    return;
  }

  const to = process.env.LEAD_NOTIFICATION_EMAIL ?? DEFAULT_TO;
  const sentAt = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: buildSubject(lead),
    html: buildHtml(lead, sentAt),
  });

  if (error) {
    console.error("[email send error]", error);
  }
}
