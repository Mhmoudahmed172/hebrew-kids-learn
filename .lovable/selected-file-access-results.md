# Selected access-policy results

## Changes applied

Only the five approved SELECT policies were altered. No records, triggers, historical points, write policies, bucket visibility, or application behavior code changed. No deployment was performed. Lovable Cloud applied the changes to the shared live database.

Files: `supabase/migrations/20261031064200_selected_file_access.sql`, identical applied `drizzle/migrations/0000_selected_file_access.sql` and generated migration metadata, `src/test/selected-file-access.test.ts`, `AGENTS.md`, approval/results notes. The migration tool also regenerated the managed database types.

## Verification

- 29 tests passed; 10 existing TODO cases remain unverified. Eight new tests check migration scope and SQL predicates; they are not live student-role tests.
- Live anonymous checks: no badge rows or storage listings; signed-link requests denied for published and orphan video/PDF examples.
- Live administrator checks: badge catalog, storage listing, and signed-link requests for published and orphan private files work.
- Chromium rendered the real published PDF into 13 canvases; screenshot confirms its illustrated cover.
- Public uploaded game HTML and CSS return HTTP 200. The tested HTML file renders source text rather than a playable game. No game content was changed; full gameplay compatibility is not claimed.
- Thumbnail bucket is empty; image rendering could not be verified.
- Non-admin student/parent flows were not end-to-end verified: only the requesting user's own admin session was minted. SQL predicates were inspected, but this is not a substitute for account-level checks.
- Lint: fails with 178 errors and 18 warnings, matching the prior baseline. No unrelated lint cleanup was made.
- Automatic check log reports `build OK`. Standalone production build/typecheck were not run because the environment requires automatic checks; no separate production-bundle result is available.

## Finding status

Three original findings marked fixed: anonymous badge access, public thumbnail listing, public game listing.

Two selected private-file findings remain active after the quick recheck. Their rules now deny anonymous access and tie non-admin reads to published content references, but the scanner still flags shared non-owner access. They were **not** ignored or marked fully fixed. Restricting reads to uploader ownership would break student access to admin-uploaded lessons; further changes require a separate approved design. All other findings were left untouched.

Fixed: 3 selected issues. Remaining: 2 selected issues. Re-scan for additional issues; common automated checks do not replace advanced penetration testing.