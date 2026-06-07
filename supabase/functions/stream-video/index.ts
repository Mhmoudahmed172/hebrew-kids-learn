// Edge function: stream-video
// Streams a video from the private `videos` bucket with full Range support.
// Auth: either Authorization header (Bearer JWT) OR ?token=<JWT> query param
// (needed because <video> elements cannot set custom headers).
// The client never sees the storage URL — bytes are proxied through this function.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

const err = (msg: string, status = 400) =>
  new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const extractPath = (stored: string): string | null => {
  if (!stored) return null;
  const pub = "/object/public/videos/";
  const sgn = "/object/sign/videos/";
  if (stored.includes(pub)) return decodeURIComponent(stored.split(pub)[1].split("?")[0]);
  if (stored.includes(sgn)) return decodeURIComponent(stored.split(sgn)[1].split("?")[0]);
  if (stored.startsWith("http")) return null;
  return decodeURIComponent(stored);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const url = new URL(req.url);
    const videoId = url.searchParams.get("id");
    if (!videoId) return err("missing id");

    // Accept token from header OR ?token= (so <video src> works without JS fetch)
    const headerAuth = req.headers.get("Authorization") || "";
    const qToken = url.searchParams.get("token");
    const bearer = headerAuth.startsWith("Bearer ")
      ? headerAuth.slice(7)
      : (qToken || "");
    if (!bearer) return err("unauthorized", 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return err("unauthorized", 401);
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: video, error: vErr } = await admin
      .from("videos")
      .select("id, level_id, video_url, published")
      .eq("id", videoId)
      .maybeSingle();
    if (vErr || !video) return err("not found", 404);

    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;

    if (!video.published && !isAdmin) return err("not found", 404);

    if (!isAdmin) {
      const { data: perms } = await admin
        .from("user_permissions")
        .select("section, can_view")
        .eq("user_id", userId);
      const hasAny = (perms || []).length > 0;
      if (hasAny) {
        const map = new Map((perms || []).map((p: any) => [p.section, p.can_view === true]));
        const levelOk = video.level_id ? map.get(`level:${video.level_id}`) === true : true;
        const videoOk = map.get(`video:${video.id}`) === true;
        if (!levelOk || !videoOk) return err("forbidden", 403);
      }
    }

    const path = extractPath(video.video_url || "");
    if (!path) return err("invalid source", 400);

    const { data: signed, error: sErr } = await admin
      .storage.from("videos").createSignedUrl(path, 60);
    if (sErr || !signed) return err("storage error", 500);

    // Forward Range header so the browser can seek and start playback instantly.
    const range = req.headers.get("range") || undefined;
    const upstream = await fetch(signed.signedUrl, {
      headers: range ? { Range: range } : undefined,
    });

    const passHeaders = new Headers();
    const copy = (h: string) => {
      const v = upstream.headers.get(h);
      if (v) passHeaders.set(h, v);
    };
    copy("content-type");
    copy("content-length");
    copy("content-range");
    copy("accept-ranges");
    if (!passHeaders.has("accept-ranges")) passHeaders.set("accept-ranges", "bytes");
    if (!passHeaders.has("content-type")) passHeaders.set("content-type", "video/mp4");
    passHeaders.set("Cache-Control", "private, no-store, max-age=0");
    Object.entries(corsHeaders).forEach(([k, v]) => passHeaders.set(k, v));

    return new Response(upstream.body, {
      status: upstream.status, // 200 or 206
      headers: passHeaders,
    });
  } catch (e) {
    return err((e as Error).message, 500);
  }
});
