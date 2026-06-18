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

**Fix:** enforce NIST-style length (15+) via a custom validate / auth strategy, and add a
Have I Been Pwned breach check on create/update.

## MFA

**Check:** admins have no second factor.

**Fix:** add TOTP via a plugin or move auth to an external IdP (Auth.js / Keycloak /
Zitadel).

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
