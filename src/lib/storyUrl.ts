import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a stored story file reference (storage path, legacy public URL or an
 * external URL) into a usable, short-lived signed URL.
 */
export const getSignedStoryUrl = async (
  stored: string | null | undefined,
  expiresInSeconds = 60 * 60 // 1h
): Promise<string | null> => {
  if (!stored) return null;

  let path = stored;
  const publicMarker = "/object/public/stories/";
  const signMarker = "/object/sign/stories/";

  if (stored.includes(publicMarker)) {
    path = stored.split(publicMarker)[1].split("?")[0];
  } else if (stored.includes(signMarker)) {
    path = stored.split(signMarker)[1].split("?")[0];
  } else if (/^https?:\/\//i.test(stored)) {
    // external URL – use as-is
    return stored;
  }

  const { data, error } = await supabase.storage
    .from("stories")
    .createSignedUrl(decodeURIComponent(path), expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
};
