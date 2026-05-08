// Edge function: admin-create-user
// Allows admins to create a new user with email/password, role and status
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "missing token" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Caller must be admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "forbidden: admin only" }, 403);

    const body = await req.json();
    const { email, password, full_name, age, role, status } = body || {};

    const emailTrim = (email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return json({ error: "بريد إلكتروني غير صالح" }, 400);
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return json({ error: "كلمة المرور قصيرة جداً (6 أحرف على الأقل)" }, 400);
    }
    const safeRole = role === "admin" ? "admin" : "kid";
    const allowedStatus = ["active", "inactive", "pending_payment", "frozen", "banned"];
    const safeStatus = allowedStatus.includes(status) ? status : "active";

    // Create auth user (email auto-confirmed; profile + default role created by handle_new_user trigger)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: emailTrim,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || null,
        age: age != null && age !== "" ? Number(age) : null,
        role: safeRole,
      },
    });
    if (createErr || !created.user) return json({ error: createErr?.message || "فشل إنشاء المستخدم" }, 400);

    const newId = created.user.id;

    // Force role (the trigger may set a default; ensure it matches selection)
    await admin.from("user_roles").delete().eq("user_id", newId);
    await admin.from("user_roles").insert({ user_id: newId, role: safeRole });

    // Update profile (full_name/age/status)
    await admin
      .from("profiles")
      .update({
        full_name: full_name || null,
        age: age != null && age !== "" ? Number(age) : null,
        status: safeStatus,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", newId);

    return json({ ok: true, user: { id: newId, email: created.user.email } });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
