import { supabase } from "@/integrations/supabase/client";

export const IMAGE_BUCKET = "product-images";

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Stable public route that streams objects out of the private bucket. */
export const MEDIA_PREFIX = "/api/public/media/";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function mediaUrl(path: string) {
  return `${MEDIA_PREFIX}${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Extracts the storage object path from a media, signed or public bucket URL. */
export function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith(MEDIA_PREFIX)) {
    return decodeURIComponent(url.slice(MEDIA_PREFIX.length).split("?")[0]);
  }
  const marker = `/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const rest = url.slice(index + marker.length);
  const path = rest.split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Normalises any stored image value into a URL that always loads:
 * old signed links (which expire) are rewritten onto the media route.
 */
export function resolveImageUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith(MEDIA_PREFIX)) return url;
  const path = storagePathFromUrl(url);
  if (path && url.includes(`/${IMAGE_BUCKET}/`)) return mediaUrl(path);
  return url;
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

  return { path, url: mediaUrl(path) };
}

/** Removes the underlying object for a stored image URL. Ignores non-bucket URLs. */
export async function removeImageByUrl(url: string | null | undefined) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}
