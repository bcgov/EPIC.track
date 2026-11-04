// Only http(s) links may be rendered as clickable; javascript:, data:, relative
// paths etc. stored in the database are dropped.
export const safeExternalUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};
