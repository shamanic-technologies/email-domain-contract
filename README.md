# @shamanic-technologies/email-domain-contract

Single source of truth for the cross-provider canonical shapes used by the email-domain services:

- [postmark-service](https://github.com/shamanic-technologies/postmark-service) — transactional email via Postmark
- [instantly-service](https://github.com/shamanic-technologies/instantly-service) — broadcast email via Instantly.ai
- [email-gateway-service](https://github.com/shamanic-technologies/email-gateway-service) — domain-level router + cross-provider stats/status projection

## Why this exists

The three services historically duplicated Zod schemas (`StatusScope`, `RecipientStats`, `EmailStats`, `RepliesDetail`, `StepStats`, `ChannelStats`, `ProviderStatus`, `GlobalStatus`, `ReplyClassification`). Drift emerged: instantly-service had `cancelled` and `notSending`, postmark-service did not, email-gateway dropped them silently. This package puts the canonical shapes in one place so a change in one service forces a discussion across all of them.

## Install

```bash
npm install @shamanic-technologies/email-domain-contract
```

Add this to your `.npmrc`:

```
@shamanic-technologies:registry=https://npm.pkg.github.com
```

No auth token needed — the package is public.

## Usage

```ts
import {
  StatusScopeSchema,
  RecipientStatsSchema,
  EmailStatsSchema,
  type StatusScope,
  type RecipientStats,
} from "@shamanic-technologies/email-domain-contract";

// Validate at trust boundaries (incoming webhooks, cross-service replies)
const validated = StatusScopeSchema.parse(rawResponse);

// Or type-only when the data was already validated upstream
function process(scope: StatusScope): void { /* ... */ }
```

## Exported schemas + types

| Schema | Type | Description |
|--------|------|-------------|
| `ReplyClassificationSchema` | `ReplyClassification` | `"positive" \| "negative" \| "neutral"` |
| `RepliesDetailSchema` | `RepliesDetail` | Granular reply breakdown (9 keys) |
| `RecipientStatsSchema` | `RecipientStats` | Recipient-level stats (COUNT DISTINCT lead) |
| `StepStatsSchema` | `StepStats` | Per-step breakdown (broadcast sequences) |
| `EmailStatsSchema` | `EmailStats` | Email-level stats (COUNT *) |
| `ChannelStatsSchema` | `ChannelStats` | `{ recipientStats, emailStats }` |
| `StatusScopeSchema` | `StatusScope` | Per-scope delivery state for one recipient |
| `GlobalStatusSchema` | `GlobalStatus` | Org-wide bounce/unsubscribe signals |
| `ProviderStatusSchema` | `ProviderStatus` | Full status payload from one provider |

## Provider-specific fields

Two fields are currently provider-specific:

- `cancelled` (on `StatusScope` and `RecipientStats`) — Instantly only (retry-stuck cancellation)
- `notSending` (on `RecipientStats`) — Instantly only (`not_sending_status` diagnostic)

In v1 they are **optional** so postmark-service can return responses without them. v2 will tighten them to **required** once postmark-service ships padding (`cancelled: false`, `notSending: 0`).

## Versioning

[Semantic Versioning](https://semver.org/). Breaking changes to any schema = major bump. Additions = minor.

## Publish

Pushing a `v*` tag triggers `.github/workflows/publish.yml`, which runs tests, builds, and publishes to `npm.pkg.github.com` using the auto-injected `GITHUB_TOKEN`. No manual token setup required.

```bash
npm version major | minor | patch
git push --follow-tags
```

## License

MIT
