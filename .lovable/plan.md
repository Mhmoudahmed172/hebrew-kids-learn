# Test setup complete; first security group awaiting approval

## Completed — test-only changes

The broken startup was caused by jsdom loading a missing optional native canvas binary. Vitest now uses **Happy DOM 20.8.4**, a test-only dependency. No framework upgrades, application security fixes, database writes, production policy/trigger changes, point corrections or deployments were applied.

### Files changed

| File | Change |
|---|---|
| `package.json`, `bun.lock` | Add pinned test-only Happy DOM dependency. No general dependency upgrade or lockfile consolidation. |
| `vitest.config.ts` | Change unit-test environment from jsdom to Happy DOM. |
| `src/test/setup.ts` | Explicitly clean up rendered components after each test. |
| `src/lib/dataCache.test.ts` | Eight working regressions: TTL, reuse, deduplication, per-user keys, rejected requests, invalidation, corrupt storage and quota failure. Three pending cache-isolation acceptance cases. |
| `src/hooks/usePermissions.test.tsx` | Ten tests preserving existing first-level, student and administrator permission behavior, including all five content kinds. Mocked checks do not prove backend access control. |
| `src/test/security-acceptance.test.ts` | Seven explicit pending HTML/cookie acceptance cases; not passing protection tests. |
| `AGENTS.md` | Record unit-test environment and browser-verification limitations. |
| `roadmap.md` | Track approved work and approval boundary. |

`src/test/example.test.ts` remains unchanged. Existing application files and content are unchanged. The existing npm/legacy Bun lockfiles were not consolidated; dependency audit work remains outside this group.

### Verification results

- **Tests:** 19 passed: 18 focused regressions plus the existing placeholder. **10 TODOs**, explicitly not verified fixes.
- **Changed-file lint:** Passed for configuration, setup and new tests.
- **Full-project lint:** Failed with **179 errors and 17 warnings**, in existing application/configuration files. No broad cleanup was attempted. Common issues include explicit `any` types, hook warnings and a `require()` import in Tailwind configuration.
- **Automatic verification:** Latest available preview report, 30 October 2026 09:58:42 UTC, says **build OK**, with no reported type errors. This is the available automatic signal, not a separately recorded command-level typecheck result.
- **Production build:** Not independently invoked. This workspace performs builds/typechecks automatically and prohibits manually duplicating them; the report does not independently identify a fresh production-mode command. Therefore a separate `build` command and standalone typecheck are **not verified**.
- **Browser baseline:** Home renders; signed-out `/admin` redirects to `/login`; zero page runtime errors during these checks. This does **not** verify authenticated admin editing, real games/stories, videos, PDF rendering or student progress.

## Proposed Group 1 — HTML injection and sandbox isolation only

Approve this group independently. Cookie/cache changes below are NOT included in Group 1 approval.

### Exact proposed application changes

1. **`src/pages/Admin.tsx:1945,2001,2122,2124`** — change the four preview iframe attributes:

   Before: `sandbox="allow-scripts allow-same-origin allow-popups allow-forms"`

   After: `sandbox="allow-scripts allow-popups allow-forms"`

   Retain source selection, scripts, forms, popups, current dimensions, fullscreen/autoplay attributes and upload logic. No provider allowlist or unrelated game parsing changes in this group.

2. **`src/components/StoryViewerModal.tsx:152–157`** — replace direct `dangerouslySetInnerHTML` rendering with an opaque-origin `srcDoc` iframe. Proposed sandbox: `allow-scripts`, without `allow-same-origin`. Existing modal title, open/close, fullscreen, HTML-field fallbacks and PDF viewer remain intact.

   The exact content-document wrapper must preserve the current reading layout, RTL, scrolling and initial font size. Font-size changes must not reload the story or reset interactive state. If live font updates require a small message bridge, send only font size, check the receiving message source, and expose no session/data API. No parent-storage bridge will be added. Verify the resulting implementation against real content before calling it complete.

3. **`src/components/StoryViewerModal.tsx:159–164`** — URL-backed HTML iframe:

   Before: `sandbox="allow-scripts allow-same-origin"`

   After: `sandbox="allow-scripts"`

4. **`src/pages/GamePlayer.tsx:178` and `src/pages/StoryReader.tsx:118`** — already omit `allow-same-origin`; leave their behavior and attributes unchanged in this group.

### Intentional behavior changes

- Embedded HTML cannot access the parent page DOM, authentication storage or application APIs through same-origin access.
- Admin previews keep script/form/popup capabilities, but content-dependent browser storage and same-origin fetch behavior may differ under an opaque origin.
- Modal story HTML no longer inherits the application's DOM or styles implicitly. Reading presentation must be preserved explicitly and checked.
- HTML event-handler scripts become isolated; this is not a guarantee that embedded content cannot make network requests.
- No lesson access rules, routes, student progress recording, scoring, uploads or database contents change.

### Access before and after Group 1

| User/resource | Before | After |
|---|---|---|
| Administrator / games and story previews | Existing admin access, including unsafe same-origin embedded scripts. | Same admin access; embedded scripts isolated from the administrator's parent page/session. |
| Student / first published level | Existing first-level exception in `usePermissions`. | Unchanged. |
| Student / other individual content | Existing level/item checks where currently applied. | Unchanged; no entitlement redesign. |
| Signed-out visitor / content | Existing public catalog and first-level behavior. | Unchanged. |
| Direct story-reader route | Existing level-only check. | Unchanged in Group 1; the item-aware permission fix requires separate approval. |
| Direct data/storage APIs | Current production policies. | Completely unchanged; Group 1 does not fix broad backend access. |

### Verification required before completing Group 1

Use an authenticated representative account and existing content, without altering saved game/story records or student progress solely to test.

- At least one real pasted HTML game, an uploaded HTML folder with relative images/CSS, and each actually configured external-provider type.
- Test admin card, expanded preview and upload-dialog preview: game interactions, reset, assets, fullscreen and resizing.
- At least one real inline HTML story and one URL-backed HTML story; test reading, actions, scroll, font controls, fullscreen and reopen. Compare before/after. Verify PDF behavior remains unchanged with a real existing PDF.
- In Chromium, demonstrate a synthetic malicious frame cannot read parent DOM/storage or remove its sandbox. This is a browser-enforcement test, not an attribute assertion or snapshot.
- Convert the relevant TODOs to executable tests only when the approved implementation exists. Use unit tests for functional behavior, Chromium for isolation/media compatibility.
- Run available tests and changed-file/full-project lint; inspect automatic type/build output and identify any remaining unavailable check. Do not describe pre-existing full-project lint failures as a pass.

**Real game/story compatibility is currently unverified.** If an account/session or representative example is unavailable, report the specific blocked check and do not claim preservation was verified. Do not weaken sandbox isolation silently to make an example work; show the compatibility issue first.

## Later groups — proposals only, separate confirmation required

### Group 2 — sensitive cookie cleanup

- `src/pages/Auth.tsx:74–78,124–128`: delete redundant access/refresh cookie-writing blocks; retain existing managed SPA session persistence.
- `src/hooks/useAuth.tsx`: expire only the legacy `sb-access-token` and `sb-refresh-token` cookies on logout/appropriate initialization, without deleting unrelated cookies. Check actual cookie path/domain behavior before implementation.
- Verify signup/login, refresh, reload, multi-tab logout and expired legacy copies. No automatic generated auth-client changes.
- Access before/after: the same users stay signed in through the managed client; unnecessary duplicate token delivery to the frontend host is removed. No role/permission changes.

### Group 3 — private cache isolation

- `src/lib/dataCache.ts`: add the smallest invalidation-generation guard so invalidated pending requests cannot repopulate the cache or remove newer in-flight requests.
- `src/hooks/useAuth.tsx`: clear private cached entries on identity change/logout.
- `src/pages/LevelDetail.tsx`, `src/pages/StoryReader.tsx`: avoid persisting story bodies in account-independent cache keys. Exact fetch/key changes will be shown separately before editing. Preserve catalog caching and existing viewing permissions.
- Access before/after: authorized users keep the same content access; another account sharing the browser no longer receives previously cached private bodies. This is cache isolation, NOT backend authorization.
- Verify switching between accounts, logout, delayed old-session requests, permission edits and normal lesson reload performance.

## Explicitly excluded

No production database policy, trigger, historical-point, quiz-scoring, signup-default or staff-role changes. No permission-route fix is bundled silently. Any such proposal will show exact changes and per-user resource access, followed by separate approval. No deployment.

**Decision:** Confirm Group 1 (HTML injection and iframe sandboxing) only. Later cookie/cache groups remain unapproved.