import { supabase } from "@/integrations/supabase/client";

export const IMAGE_BUCKET = "product-images";
/** Signed URLs are minted long-lived so stored links keep working. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Extracts the storage object path from a signed or public bucket URL. */
export function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const rest = url.slice(index + marker.length);
  const path = rest.split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

export async function uploadImage(file: File, folder: string) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("فرمت تصویر پشتیبانی نمی‌شود. از PNG، JPG، WEBP، AVIF، GIF یا SVG استفاده کنید.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("حجم تصویر باید کمتر از ۸ مگابایت باشد.");
  }

  const extension = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${randomId()}.${extension || "png"}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError) throw signError;

  return { path, url: data.signedUrl };
}

/** Removes the underlying object for a stored image URL. Ignores non-bucket URLs. */
export async function removeImageByUrl(url: string | null | undefined) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}
