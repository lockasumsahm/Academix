export const initialsOf = (name?: string | null, fallback = "?") => {
  const clean = (name ?? "").trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
};

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const clockTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export const daysUntil = (date?: string | null) => {
  if (!date) return null;
  const ms = new Date(date + "T23:59:59").getTime() - Date.now();
  return Math.ceil(ms / 86400000);
};

export const formatDeadline = (date?: string | null) =>
  date ? new Date(date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No deadline";

/** Makes user-entered links safe and absolute so they never resolve as in-app routes. */
export const normalizeUrl = (raw?: string | null): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^(javascript|data|vbscript):/i.test(value)) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^mailto:|^tel:/i.test(value)) return value;
  if (/^\/\//.test(value)) return `https:${value}`;
  if (!/^[\w-]+(\.[\w-]+)+/.test(value)) return null;
  return `https://${value}`;
};
