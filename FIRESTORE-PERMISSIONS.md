# Firestore permissions investigation

## Confirmed failure

Project: `corexit-652f5`, default database. `.firebaserc` and the public Firebase project environment variable agree. `firebase.json` points to `firestore.rules` and `firestore.indexes.json`.

Read-only production reproduction (`node scripts/check-public-firestore.mjs`), with `auth.currentUser === null`:

- `company_highlights/main`: GET denied (`permission-denied`). The deployed rules require `resource.data.isActive == true`, but the current single statistics document/schema does not use that field.
- `client_brands`: LIST with `isActive == true` and `displayOrder ASC` denied. The deployed rules have no match for this collection, so the fallback denies it for both signed-out visitors and admins.
- `settings/company`, published testimonials, and active website images: reads allowed.

The captured browser messages in `.next/dev/logs/next-development.log` corroborate the brand failure in `components/client-brands-section.tsx` and `app/corexit-admin/page.tsx`. Earlier logs also show a fallback reference error (the current source already uses the defined `FALLBACK_LOGOS`) and missing fallback React keys (fixed).

The deployed rules release inspected was `projects/corexit-652f5/rulesets/f65d4bf0-b3f2-45da-82f7-e6ccd692c810`, updated September 8, 2026. It differs from the local file. No production rules or data were changed during the investigation.

## Access model

- Highlights: public reads; authenticated admin writes.
- Brands: public reads of active documents only; the Home query includes `where("isActive", "==", true)`. Authenticated admins can read all brands and create/update/delete.
- `isAdmin()` reuses the existing condition `request.auth != null`. The login page uses email/password Firebase Auth, the panel waits for `onAuthStateChanged`, and `verifyAdminIdToken` verifies a Firebase ID token without a role or allowlist check. Therefore **every Firebase Auth account is currently treated as an admin**. This change does not add a second authorization system or claim stronger role enforcement than the existing implementation provides.
- Unmatched collections remain denied. No global public-write rule was added.

Both public subscriptions have error callbacks and retain their fallbacks. Diagnostics now identify collection/query, operation, project, auth state and error code in development without printing tokens or document data. Settings and testimonial read failures are also caught and reported. No UI layout changes were made.

## Deployment required

The production index inventory also lacks `client_brands(isActive ASC, displayOrder ASC)`. It is included locally. The existing deployed legacy highlights index is retained in the local index inventory to avoid a deletion prompt for that index.

Run from this repository:

```powershell
firebase deploy --only "firestore:rules,firestore:indexes" --project corexit-652f5
```

Rules alone, if indexes have already been deployed:

```powershell
firebase deploy --only firestore:rules --project corexit-652f5
```

Wait for the brand index to finish building, then reload the Home page and admin panel. Local edits and a Next.js build do not deploy Firebase rules. Firebase documentation: https://firebase.google.com/docs/rules/manage-deploy

## Verification commands

```powershell
npm run build
firebase emulators:exec --project demo-corexit-permissions --config firebase.test.json --only auth,firestore "node scripts/test-firestore-security.mjs"
node scripts/check-public-firestore.mjs
```

The last command is a read-only production check and will continue to report the confirmed denials until deployment. The emulator test uses a demo project and tests email/password login, public reads, rejected public writes, inactive brand privacy, admin CRUD, subscriptions, and visibility of admin edits. It does not modify production data.

Production browser login, CRUD and visual Home-page verification still require a connected browser after deployment. Browser automation was unavailable in this session; captured browser logs and direct client SDK requests were used instead.

## Results in this session

- `npm run build`: passed, including TypeScript and static page generation.
- Firebase rules compiler: passed.
- `node scripts/validate-firestore-rules.cjs`: all 21 simulated request expectations passed, including denied public create/update/delete, denied inactive-brand get, allowed admin read/create/update/delete, and the fallback deny. These are rules simulations, not an actual admin login or production CRUD test.
- Emulator integration: not completed; the Firestore emulator JAR download stalled. The runnable test and configuration remain available.
- Live SDK checks: reproduced both permission denials above; other Home reads succeeded. These failures remain until deployment.
- Full browser/console and real admin login/CRUD verification: pending deployment and browser access.

The inspection and rules-simulation utilities use the existing globally installed Firebase CLI on Windows and its signed-in account. No credentials are embedded in these scripts.
