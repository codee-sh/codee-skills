---
name: payload-security
description: Security review and hardening guide for Payload CMS apps. Use when reviewing a project for security, or when adding/modifying collections, auth, access control, uploads, CORS/CSRF, headers, or logging. Self-contained — lists what to check and how to fix it with copy-paste patterns.
---

# Payload — Security review & hardening

Payload is **not secure-by-default**: access control, CORS/CSRF, auth limits, upload
restrictions and headers must all be configured explicitly. Use this skill to analyze a
project for security gaps and fix them consistently.

Each item is: **what to check → how to fix**. All patterns are inline and self-contained —
no project-specific helpers or paths are assumed; adapt names to the codebase at hand.

---

## Audit file — always keep it current

Every run of this skill is tracked in a single living document at
**`.ai/audits/security-audit.md`**.

**On starting** (review or any auth/access/upload/CORS/headers/logging change):
1. If the file does **not** exist, create it from the template below.
2. If it exists, read it first — it is the current status; build on it, don't restart.

**While working**, update the file **as you go**, not just at the end: when an item moves
from `[missing]`/`[partial]` to `[done]`, change its line immediately and note the
commit/migration/file that delivered it. The file must always reflect the real state of the
codebase — verify against the actual code before marking anything `[done]`, never trust a
stale status.

This file lists unpatched gaps, so it stays out of version control (it is `.gitignore`d
alongside `.ai/things`). Do not commit it to a public repo.

Status markers: `[done]`, `[partial]`, `[missing]`, `[out-of-repo]` (infra/process).

Template:
```markdown
# Payload security audit — status & plan

**Date:** <YYYY-MM-DD>
**Status:** in progress

Status markers: [done] · [partial] · [missing] · [out-of-repo] (infra/process)

## Implemented
- [done] <item> — <what + file/commit/migration reference>

## To do
### High priority
- [missing] <item> — <note, blocker, decision needed>
### Medium priority
- [partial] <item> — <note>

## Out of repo (infra/process)
- [out-of-repo] <item>

## Strengths (already good)
- [done] <item>
```

The checks below feed the rows of this file; map each one to a status marker.

---

## Access control

**Check:** every collection declares explicit `access` for `create / read / update /
delete`. A collection with no `access` block is fully open. Owned-data reads must return a
`Where` constraint, not `true`. Sensitive fields need field-level `access`.

**Fix:** define small reusable access functions and apply least privilege — `admin` for
writes, scoped reads for owned data.
```ts
import type { Access, FieldAccess } from 'payload'

// 'users' = slug of your admin collection — adjust if named differently
export const isAdmin: Access = ({ req: { user } }) => user?.collection === 'users'
export const isAdminField: FieldAccess = ({ req: { user } }) => user?.collection === 'users'
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

// Owner-scoped read: admins see all, owners see only their own rows.
export const adminOrOwn: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { owner: { equals: user.id } } // <-- adjust field name to the collection
}
```
```ts
access: {
  create: isAdmin,
  read: adminOrOwn,   // returns a Where for non-admins, never `true`
  update: isAdmin,
  delete: isAdmin,
}
```
Sensitive field (PII, internal notes):
```ts
{ name: 'notes', type: 'textarea', access: { read: isAdminField, update: isAdminField } }
```

## Auth hardening

**Check:** auth collections must not use bare `auth: true` — that ships default token
lifetime and no explicit lockout/cookie policy.

**Fix:** explicit `auth` block on every auth-enabled collection:
```ts
auth: {
  tokenExpiration: 60 * 60 * 2,   // 2h session
  maxLoginAttempts: 5,
  lockTime: 1000 * 60 * 10,       // 10 min lockout
  cookies: {
    secure: process.env.NODE_ENV === 'production', // HTTPS-only cookie in prod
    sameSite: 'Lax',
  },
}
```

## Password policy

**Check:** is there any minimum password strength? Payload has no native `minLength`.

**Fix:** enforce strength in a `beforeValidate` hook on every auth collection. Payload
exposes the plaintext on `data.password` during create and password changes (absent on
ordinary updates), so the hook is a no-op otherwise.

**Pick one option** when applying this skill - confirm with the project owner which they want:

**Option A — length 15+ AND Have I Been Pwned breach check (stronger).** Rejects long but already-leaked passwords. Uses the **free, keyless** Pwned Passwords *range* API
(`api.pwnedpasswords.com/range/...`) — not the paid breach-by-email API. Only the first 5
chars of the SHA-1 hash leave the server (k-anonymity); the password never does. Fails
**open** on network/API errors so a HIBP outage can't block password changes. This adds a
runtime dependency on an external service — if that's unacceptable (privacy/policy), use Option B or a downloaded offline hash list.
```ts
import crypto from 'crypto'
import type { CollectionBeforeValidateHook } from 'payload'
import { APIError } from 'payload'

const MIN_PASSWORD_LENGTH = 15 // NIST SP 800-63B: favour length over composition rules

async function isBreachedPassword(password: string): Promise<boolean> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }, // hide how many hashes match the prefix
    })
    if (!res.ok) return false // fail open
    const body = await res.text()
    return body.split('\n').some((line) => line.split(':')[0]?.trim().toUpperCase() === suffix)
  } catch {
    return false // network failure: never block on an external outage
  }
}

export const validatePassword: CollectionBeforeValidateHook = async ({ data }) => {
  const password = (data as { password?: unknown } | undefined)?.password
  if (typeof password !== 'string' || password.length === 0) return data
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new APIError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, 400)
  }
  if (await isBreachedPassword(password)) {
    throw new APIError('This password has appeared in a known data breach. Choose a different one.', 400)
  }
  return data
}
```

**Option B — length 15+ only (no external dependency).** Same hook, drop `isBreachedPassword`
and its call. Zero network calls, simpler, but won't catch long-yet-leaked passwords.

Wire whichever you pick into each auth collection:
```ts
hooks: { beforeValidate: [validatePassword] }
```

## MFA

**Check:** admins have no second factor.

**Fix:** add TOTP via a plugin or move auth to an external IdP (Auth.js / Keycloak / Zitadel).

## CORS / CSRF / server URL

**Check:** the config must scope `cors` and `csrf` to trusted origins — never `*` or open
defaults.

**Fix:** tie them to an env-driven base URL:
```ts
const serverURL = process.env.SERVER_URL || 'http://localhost:3000'
// in buildConfig: serverURL, cors: [serverURL], csrf: [serverURL]
```
On production the base URL must be the real domain, or cookie-auth breaks.

## Public API surface (GraphQL)

**Check:** is GraphQL actually used? If not, it is extra attack surface.

**Fix:** disable it and remove its routes; only re-add if genuinely needed:
```ts
graphQL: { disable: true } // then delete the generated GraphQL route files
```

## Uploads

**Check:** every upload collection restricts file types and size.

**Fix:** `upload.mimeTypes` per collection + a global size cap in the config:
```ts
// collection
upload: { mimeTypes: ['image/*'] }
// buildConfig
upload: { limits: { fileSize: 5_000_000 }, abortOnLimit: true } // 5 MB
```
Also review public read on uploads (`read: () => true` is common on media) — narrow if
files can be sensitive.

## Versioning / audit log

**Check:** collections often default to no version history — no audit trail.

**Fix:** enable `versions` (and `drafts` where it fits) on critical collections. Adds
`_v` tables, so it **requires a DB migration** (`migrate:create`); never enable `db.push`
to apply it.
```ts
versions: { drafts: true }
```

## Security headers

**Check:** Next config usually sets no security headers.

**Fix:** add via `headers()` — HSTS (with preload), `X-Content-Type-Options: nosniff`,
`X-Frame-Options`/CSP `frame-ancestors`, and a CSP.

## Rate limiting

**Check:** only Payload's default rate limit is active.

**Fix:** set an explicit `rateLimit` in the config and add an edge layer (Cloudflare/WAF)
in front of admin routes.

## Logging / monitoring

**Check:** no centralized logging; failed logins and permission changes are not tracked.

**Fix:** wire Sentry (or CloudWatch/Datadog), log auth failures and permission changes.

## XSS / user input

**Check:** rich text and user-supplied URLs are the XSS surface. Plain `text`/`textarea`
fields rendered through JSX are escaped and low-risk.

**Fix:** never introduce `dangerouslySetInnerHTML`; if a `richText` field is rendered,
sanitize on output. Validate URL schemes from user data (e.g. a `videoUrl` field) — reject
`javascript:` before rendering as `href`.

## Secrets & database

**Check:** secrets out of the repo; schema not auto-pushed.

**Fix:** keep `.env` gitignored (commit only `.env.example`), never commit
`PAYLOAD_SECRET`; keep `db.push: false` (migrations only). Out of repo: DB SSL
(`sslmode=require`), private networking, credential rotation, backups + DR.

---

## Review checklist

- [ ] Every collection: explicit `access` for all four ops; owned reads return a `Where`
- [ ] Sensitive fields have field-level `access`
- [ ] Auth collections use the full `auth` block (token/lockout/cookies)
- [ ] `cors`/`csrf` scoped to a trusted base URL; GraphQL disabled unless needed
- [ ] Upload collections set `mimeTypes`; global `fileSize` cap intact
- [ ] Versioning enabled on critical collections (migration)
- [ ] Security headers set in the Next config
- [ ] Explicit `rateLimit` + edge protection
- [ ] Logging/monitoring for auth failures and permission changes
- [ ] No `dangerouslySetInnerHTML`; user URLs scheme-checked
- [ ] No secrets committed; `db.push` is `false`
