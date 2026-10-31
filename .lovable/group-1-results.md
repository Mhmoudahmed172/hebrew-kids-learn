# Group 1 implementation and verification

## Changes

- `src/pages/Admin.tsx`: four game preview frames lose `allow-same-origin`; script/form/popup/fullscreen attributes otherwise retained.
- `src/components/StoryViewerModal.tsx`: inline HTML no longer enters parent DOM; URL HTML frame loses same-origin permission. PDF branch unchanged.
- `src/components/IsolatedStoryHtml.tsx`: isolated document with RTL/default reading layout and bounded font-size messages; font updates do not replace `srcDoc`.
- `src/components/IsolatedStoryHtml.test.tsx`: two working tests for document preservation and font message updates.
- `AGENTS.md`, `roadmap.md`: document boundary and outstanding verification.

No cookie/cache implementation, permission changes, production database changes, content edits, progress writes or deployment.

## Results

- Unit tests: 21 pass, including placeholder; 10 acceptance TODOs remain unverified.
- New-file lint: no errors; one fast-refresh warning for helper export.
- Full lint: 178 errors, 18 warnings, predominantly pre-existing. Not a pass.
- Automatic report: build OK after implementation. Standalone typecheck/production command not independently run because workspace checks are automatic.
- Authenticated read-only inventory: six saved inline games, one HTML story, one PDF story; no URL-backed HTML story, uploaded-folder game or external-provider example found.
- Chromium: all six real games render with identical action lists under old/new sandbox; initial text matches for five (one game has dynamic/random text). Limited first-action probes did not prove scoring/reset/fullscreen compatibility for every game. These were controlled iframe probes using existing content, NOT the full authenticated admin workflow.
- Real HTML story renders empty in the probe, so compatibility cannot be claimed. It is a saved XHTML document; the exact cause and baseline difference remain unverified.
- Synthetic malicious event handler: parent DOM access, parent localStorage access and removal of its sandbox all blocked in Chromium.
- Font update from 18 to 24 preserves synthetic frame state in Chromium.

## Remaining blockers

Group 1 is implemented but not fully verified. Need representative uploaded-folder/provider/URL-story examples and full authenticated modal/admin/PDF checks; saved empty HTML story needs comparison before claiming preservation. No relaxation of isolation was made. Later groups remain unapproved.