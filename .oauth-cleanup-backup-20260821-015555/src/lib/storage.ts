import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MediaBucket = "avatars" | "covers" | "publications";

/** Uploads a file into the caller's own folder and returns the storage path. */
export async function uploadUserFile(
  bucket: MediaBucket,
  userId: string,
  file: File,
): Promise<string> {
  const prepared = await compressImage(file, bucket === "avatars" ? 512 : 1920);
  const ext = prepared.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, prepared, {
    // Long-lived cache: paths are unique per upload, so content never changes.
    cacheControl: "31536000",
    upsert: false,
    contentType: prepared.type || undefined,
  });
  if (error) throw error;
  const reference = `${bucket}/${path}`;
  signedCache.delete(reference);
  return reference;
}

/**
 * Downscales and re-encodes photos to WebP in the browser before upload so
 * avatars/covers stay small (fast uploads, fast loads). Non-images and files
 * the browser cannot decode are passed through untouched.
 */
export async function compressImage(file: File, maxDimension: number): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85),
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

const SIGNED_TTL_SECONDS = 60 * 60;
/** In-memory cache so the same avatar is signed once per session, not per render. */
const signedCache = new Map<string, { url: string; expiresAt: number }>();
const inflight = new Map<string, Promise<string | null>>();

/** Creates (and caches) a temporary signed URL for a stored "bucket/path" reference. */
export async function getSignedUrl(reference: string | null): Promise<string | null> {
  if (!reference) return null;
  if (/^https?:\/\//i.test(reference)) return reference;
  const [bucket, ...rest] = reference.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return null;

  const cached = signedCache.get(reference);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const pending = inflight.get(reference);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_TTL_SECONDS);
    inflight.delete(reference);
    if (error || !data?.signedUrl) return null;
    signedCache.set(reference, {
      url: data.signedUrl,
      // Refresh a few minutes before the token actually expires.
      expiresAt: Date.now() + (SIGNED_TTL_SECONDS - 300) * 1000,
    });
    return data.signedUrl;
  })();

  inflight.set(reference, request);
  return request;
}

/** Resolves a stored reference to a displayable URL. */
export function useSignedUrl(reference: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!reference) {
      setUrl(null);
      return;
    }
    getSignedUrl(reference).then((value) => {
      if (active) setUrl(value);
    });
    return () => {
      active = false;
    };
  }, [reference]);

  return url;
}
