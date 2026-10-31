import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// These guard the approved migration's scope and predicates. They do not
// substitute for live API checks with each application role.
const sql = readFileSync("supabase/migrations/20261031064200_selected_file_access.sql", "utf8");
const policies = sql.split(/(?=ALTER POLICY)/).filter(Boolean);

describe("selected file-access migration", () => {
  it("changes exactly the five approved policies and no records or triggers", () => {
    expect(policies).toHaveLength(5);
    expect(sql).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|DROP|CREATE|GRANT|REVOKE)\b/i);
    for (const name of ["public read badges", "authenticated read videos", "Story files are readable", "public read thumbs", "Games files are publicly readable"]) {
      expect(sql).toContain(`ALTER POLICY "${name}"`);
    }
  });

  it("limits all five rules to authenticated callers", () => {
    for (const policy of policies) expect(policy).toContain("TO authenticated");
  });

  it("requires a signed-in caller for the badge catalog", () => {
    expect(policies[0]).toContain("USING ((SELECT auth.uid()) IS NOT NULL)");
  });

  it.each([
    [1, "videos", "video_url"],
    [2, "stories", "file_url"],
  ])("ties private-file rule %s to published references or admins", (index, bucket, column) => {
    const policy = policies[Number(index)];
    expect(policy).toContain(`bucket_id = '${bucket}'`);
    expect(policy).toContain("AND (SELECT auth.uid()) IS NOT NULL");
    expect(policy).toContain("public.has_role((SELECT auth.uid()), 'admin'::public.app_role)");
    expect(policy).toContain(".published");
    expect(policy).toContain(`${column} = storage.objects.name`);
    expect(policy).toContain(`/object/public/${bucket}/`);
    expect(policy).toContain(`/object/sign/${bucket}/`);
  });

  it.each([3, 4])("keeps public bucket listing rule %s admin-only", (index) => {
    expect(policies[index]).toContain("public.has_role((SELECT auth.uid()), 'admin'::public.app_role)");
    expect(policies[index]).not.toMatch(/\bOR\b/);
  });

  it("retains the exact SQL applied by Lovable Cloud", () => {
    expect(readFileSync("drizzle/migrations/0000_selected_file_access.sql", "utf8")).toBe(sql);
  });
});