# Telegram OIDC with our own session cookie instead of better-auth

The repo follows the nextjs-vertical-slice-starter-pack conventions, but deliberately drops its better-auth `auth` slice. Telegram is the only way to log in, so we use a hand-written Telegram OpenID Connect flow (PKCE, ID token verified with `jose`) and our own signed session cookie. better-auth's value here would mostly be email/password flows we don't offer, and its `user` table assumes a required unique email, which Telegram accounts don't provide.

## Consequences

- There are no better-auth tables (`session`, `account`, `verification`); a Creator is a row in `users` keyed by Telegram ID.
- `proxy.ts` checks our session cookie, not `getSessionCookie()` from better-auth.
- Adding a second login method later (e.g. email) means either extending this code or migrating to better-auth's generic OAuth plugin.
