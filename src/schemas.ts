import { z } from "zod";

// ---------------------------------------------------------------------------
// Reply classification
// ---------------------------------------------------------------------------

export const ReplyClassificationSchema = z.enum([
  "positive",
  "negative",
  "neutral",
]);

// ---------------------------------------------------------------------------
// Replies detail — granular reply breakdown by classification
// ---------------------------------------------------------------------------

export const RepliesDetailSchema = z.object({
  interested: z.number().describe("lead_interested events"),
  meetingBooked: z.number().describe("lead_meeting_booked events"),
  closed: z.number().describe("lead_closed events"),
  notInterested: z.number().describe("lead_not_interested events"),
  wrongPerson: z.number().describe("lead_wrong_person events"),
  unsubscribe: z.number().describe("lead_unsubscribed events"),
  neutral: z.number().describe("lead_neutral events"),
  autoReply: z.number().describe("auto_reply_received events"),
  outOfOffice: z.number().describe("lead_out_of_office events"),
});

// ---------------------------------------------------------------------------
// Recipient-level stats (COUNT DISTINCT lead)
// ---------------------------------------------------------------------------

export const RecipientStatsSchema = z.object({
  contacted: z
    .number()
    .describe("Leads added to a campaign / send attempted"),
  sent: z.number().describe("Leads with at least 1 email sent (COUNT DISTINCT lead)"),
  delivered: z.number().describe("Leads delivered (sent - bounced)"),
  opened: z.number().describe("Leads who opened at least 1 email"),
  bounced: z.number().describe("Leads with at least 1 bounce"),
  clicked: z.number().describe("Leads who clicked at least 1 link"),
  unsubscribed: z.number().describe("Leads who unsubscribed"),
  // Provider-specific (instantly-only today; postmark padding follow-up will add).
  notSending: z
    .number()
    .optional()
    .describe(
      "Leads in campaigns currently flagged with Instantly's not_sending_status diagnostic. Optional in contract v1; will be required in v2 after postmark padding ships.",
    ),
  cancelled: z
    .number()
    .optional()
    .describe(
      "Leads whose campaign was cancelled by the retry-stuck job (delivery_status='cancelled'). Optional in contract v1; will be required in v2 after postmark padding ships.",
    ),
  repliesPositive: z.number().describe("interested + meetingBooked + closed"),
  repliesNegative: z
    .number()
    .describe("notInterested + wrongPerson + unsubscribe"),
  repliesNeutral: z.number().describe("neutral (lead_neutral events only)"),
  repliesAutoReply: z.number().describe("autoReply + outOfOffice"),
  repliesDetail: RepliesDetailSchema.describe(
    "Granular reply breakdown by classification",
  ),
});

// ---------------------------------------------------------------------------
// Step stats — per-step breakdown (used by Instantly broadcast sequences;
// always empty array for Postmark since transactional has no step concept)
// ---------------------------------------------------------------------------

export const StepStatsSchema = z.object({
  step: z.number().describe("Step number (1-based)"),
  sent: z.number().describe("Emails sent at this step"),
  delivered: z.number().describe("Delivered at this step (sent - bounced)"),
  opened: z.number().describe("Emails opened at this step"),
  clicked: z.number().describe("Link clicks at this step"),
  bounced: z.number().describe("Emails bounced at this step"),
  unsubscribed: z.number().describe("Unsubscribes at this step"),
  repliesPositive: z.number().describe("interested + meetingBooked + closed"),
  repliesNegative: z
    .number()
    .describe("notInterested + wrongPerson + unsubscribe"),
  repliesNeutral: z.number().describe("neutral (lead_neutral events only)"),
  repliesAutoReply: z.number().describe("autoReply + outOfOffice"),
  repliesDetail: RepliesDetailSchema.describe(
    "Granular reply breakdown by classification",
  ),
});

// ---------------------------------------------------------------------------
// Email-level stats (COUNT *)
// ---------------------------------------------------------------------------

export const EmailStatsSchema = z.object({
  sent: z.number().describe("Total emails sent (COUNT *, all steps)"),
  delivered: z.number().describe("Total emails delivered (sent - bounced)"),
  opened: z
    .number()
    .describe("Unique emails opened at least once (COUNT DISTINCT)"),
  clicked: z
    .number()
    .describe("Unique emails with at least 1 click (COUNT DISTINCT)"),
  bounced: z.number().describe("Total emails bounced"),
  unsubscribed: z.number().describe("Total unsubscribe events"),
  stepStats: z
    .array(StepStatsSchema)
    .optional()
    .describe(
      "Per-step breakdown (instantly broadcast only; empty/omitted for postmark transactional)",
    ),
});

// ---------------------------------------------------------------------------
// Channel stats — wraps recipient + email
// ---------------------------------------------------------------------------

export const ChannelStatsSchema = z.object({
  recipientStats: RecipientStatsSchema.describe(
    "Recipient-level stats (COUNT DISTINCT lead)",
  ),
  emailStats: EmailStatsSchema.describe("Email-level stats (COUNT *)"),
});

// ---------------------------------------------------------------------------
// Status scope — delivery state for one recipient in a given scope
// (per-campaign, per-brand aggregate, or per-campaign single)
// ---------------------------------------------------------------------------

export const StatusScopeSchema = z.object({
  contacted: z
    .boolean()
    .describe("Whether at least one sending exists in this scope"),
  sent: z.boolean().describe("Whether an email was sent in this scope"),
  delivered: z
    .boolean()
    .describe(
      "Whether an email was delivered in this scope (sent AND not bounced)",
    ),
  opened: z
    .boolean()
    .describe("Whether the recipient opened any email in this scope"),
  clicked: z
    .boolean()
    .describe("Whether the recipient clicked any link in this scope"),
  replied: z
    .boolean()
    .describe(
      "Whether the recipient replied in this scope (always false for postmark — no reply tracking)",
    ),
  replyClassification: ReplyClassificationSchema.nullable().describe(
    "Classification of most recent reply: positive / negative / neutral, or null if no reply (always null for postmark)",
  ),
  bounced: z.boolean().describe("Whether an email bounced in this scope"),
  unsubscribed: z
    .boolean()
    .describe("Whether the recipient unsubscribed in this scope"),
  // Provider-specific (instantly-only today; postmark padding follow-up).
  cancelled: z
    .boolean()
    .optional()
    .describe(
      "Whether the campaign was cancelled by the retry-stuck job. Optional in contract v1; required in v2 after postmark padding ships.",
    ),
  lastDeliveredAt: z
    .string()
    .nullable()
    .describe(
      "ISO 8601 timestamp of last delivery in this scope; null if none",
    ),
  // Per-event first-occurrence (MIN) timestamps — mirror of lastDeliveredAt (MAX).
  // first*=MIN(event time in scope), null if the event never happened in scope.
  // Surfaced for funnel chronology / cumulative revenue time-series (DIS-229).
  firstContactedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a contacted event in this scope; null if it never happened in scope",
    ),
  firstSentAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a sent event in this scope; null if it never happened in scope",
    ),
  firstDeliveredAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a delivered event in this scope; null if it never happened in scope",
    ),
  firstOpenedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of an opened event in this scope; null if it never happened in scope",
    ),
  firstClickedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a clicked event in this scope; null if it never happened in scope",
    ),
  firstRepliedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a replied event in this scope; null if it never happened in scope (always null for postmark — no reply tracking)",
    ),
  firstBouncedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of a bounced event in this scope; null if it never happened in scope",
    ),
  firstUnsubscribedAt: z
    .string()
    .nullable()
    .optional()
    .describe(
      "First-occurrence (MIN) ISO 8601 timestamp of an unsubscribed event in this scope; null if it never happened in scope",
    ),
});

// ---------------------------------------------------------------------------
// Global status — org-wide bounce / unsubscribe signals
// ---------------------------------------------------------------------------

export const GlobalStatusSchema = z.object({
  email: z
    .object({
      bounced: z
        .boolean()
        .describe("True if this email bounced anywhere in the org"),
      unsubscribed: z
        .boolean()
        .describe("True if this email unsubscribed anywhere in the org"),
    })
    .describe("Global email signals (technical/legal)"),
});

// ---------------------------------------------------------------------------
// Provider status — full status payload from one provider for one email
// ---------------------------------------------------------------------------

export const ProviderStatusSchema = z.object({
  byCampaign: z
    .record(z.string(), StatusScopeSchema)
    .nullable()
    .describe(
      "Per-campaign breakdown keyed by campaignId — present in brand mode, null otherwise",
    ),
  campaign: StatusScopeSchema.nullable().describe(
    "Status scoped to the given campaign — present in campaign mode, null otherwise",
  ),
  brand: StatusScopeSchema.nullable().describe(
    "Aggregated status across all campaigns for the brand — present in brand mode, null otherwise",
  ),
  global: GlobalStatusSchema.describe(
    "Global signals across all brands and campaigns (always present)",
  ),
});
