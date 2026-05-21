import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage path inside the `videos` bucket from either a stored
 * path or a (legacy) public URL, then returns a short-lived signed URL.
 * Returns null if the user is not signed in or the path can't be resolved.
 */
export const getSignedVideoUrl = async (
  stored: string | null | undefined,
  expiresInSeconds = 60 * 60 // 1h
): Promise<string | null> => {
  if (!stored) return null;

  let path = stored;
  // legacy public URL → extract path after `/videos/`
  const marker = "/object/public/videos/";
  const signedMarker = "/object/sign/videos/";
  if (stored.includes(marker)) {
    path = stored.split(marker)[1].split("?")[0];
  } else if (stored.includes(signedMarker)) {
    path = stored.split(signedMarker)[1].split("?")[0];
  } else if (stored.startsWith("http")) {
    // unknown remote URL – return as-is (e.g. YouTube/external)
    return stored;
  }

  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(decodeURIComponent(path), expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
};
