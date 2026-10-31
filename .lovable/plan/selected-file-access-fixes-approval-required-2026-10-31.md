# Selected file-access fixes — approval required

## Scope
Fix only the five selected findings: badge-catalog access, video reads, story reads, thumbnail listing, and game-file listing. No other findings will be fixed or ignored.

These are live database policy changes shared by preview and the published site. Your earlier requirement calls for exact changes and separate approval, so none have been applied yet. Approval of this plan authorizes only the SQL below, related regression verification, and marking these five findings fixed after successful verification. No deployment, record updates, trigger changes, points changes, or bucket visibility changes.

## Access before and after

| Resource | Before | Proposed after |
|---|---|---|
| Badge definitions (not students’ earned badges) | Anyone can read the catalog | Signed-in students, parents, and admins can read the catalog; visitors cannot. The only detected consumer is the signed-in profile page. Admin management remains unchanged. |
| Private video files | Every signed-in account can read every video object | Signed-in accounts can read files referenced by published videos; admins can also read unpublished and unreferenced files. No uploader-only rule, which would block students from admin-uploaded lessons. |
| Private story files | Visitors and signed-in accounts can read every story object and request signed links | Signed-in accounts can read files referenced by published stories; admins can also read unpublished and unreferenced files. Visitors lose file access. Story-table visibility and external links remain unchanged. |
| Public thumbnails | Anyone can list storage objects | Only admins can list them through the storage API. Existing public image links still work for everyone. |
| Public game files | Anyone can list storage objects | Only admins can list them through the storage API. Existing public HTML/CSS/image links still work for everyone, preserving multi-file games. |

This group does **not** implement per-level subscriptions, account-status restrictions, or section-specific permissions. Published file access remains available to all signed-in accounts. It also does not make public game/thumbnail links private or prevent saving content that a user can view.

## Exact proposed SQL

Only these five existing SELECT policies will be altered; all other policies and grants stay unchanged.

```sql
BEGIN;

ALTER POLICY "public read badges"
ON public.badges
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

ALTER POLICY "authenticated read videos"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'videos'
  AND (SELECT auth.uid()) IS NOT NULL
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.videos AS v
      WHERE v.published
        AND (
          v.video_url = storage.objects.name
          OR split_part(split_part(v.video_url, '/object/public/videos/', 2), '?', 1) = storage.objects.name
          OR split_part(split_part(v.video_url, '/object/sign/videos/', 2), '?', 1) = storage.objects.name
        )
    )
  )
);

ALTER POLICY "Story files are readable"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'stories'
  AND (SELECT auth.uid()) IS NOT NULL
  AND (
    public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.stories AS s
      WHERE s.published
        AND (
          s.file_url = storage.objects.name
          OR split_part(split_part(s.file_url, '/object/public/stories/', 2), '?', 1) = storage.objects.name
          OR split_part(split_part(s.file_url, '/object/sign/stories/', 2), '?', 1) = storage.objects.name
        )
    )
  )
);

ALTER POLICY "public read thumbs"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
);

ALTER POLICY "Games files are publicly readable"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'games'
  AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
);

COMMIT;
```

## Verification and safeguards

- Before applying, check actual stored object names against the published video/story references. Current records include a legacy public video URL and a raw PDF path; both formats are covered above. If any reference fails to match, stop and show the necessary amendment rather than breaking the lesson.
- Add focused read-only policy regression checks for anonymous, student/parent, and admin access. Use real object references without modifying content or student records.
- Apply the exact approved SQL through Lovable Cloud’s migration tool, preserving a matching migration file in the project.
- Verify anonymous denial for private files, authenticated access to published video/PDF files, denial of unreferenced private files for non-admins, admin access, and unchanged public game/thumbnail serving. Verify real game assets and story rendering in Chromium before claiming compatibility.
- Recheck the selected findings and mark only successfully resolved findings fixed. Leave all others untouched.
- Run available tests and lint; inspect automatic type/build checks rather than manually running a build or typecheck. Report failures and unverified account flows explicitly.

## Current results

- Existing tests: **21 passed; 10 TODO**, not verified protections.
- Changed file so far: this approval plan only. No production changes or deployment.
- **Fixed: 0 issues. Remaining: 5 selected issues**, awaiting this separate approval.

After successful fixes, re-scan for additional issues. Common automated checks do not replace advanced penetration testing.