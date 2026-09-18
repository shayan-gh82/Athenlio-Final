const supportedLocales = new Set(["fa", "en"]);

export function getSafeReturnPath(value: string | undefined, locale: string) {
  if (!value || value.includes("\\") || value.startsWith("//")) return null;

  try {
    const url = new URL(value, "https://athenlio.local");
    const firstSegment = url.pathname.split("/").filter(Boolean)[0];
    if (url.origin !== "https://athenlio.local" || firstSegment !== locale || !supportedLocales.has(locale)) return null;
    if (url.pathname === `/${locale}/login` || url.pathname === `/${locale}/register`) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function withReturnPath(route: string, returnPath?: string | null) {
  return returnPath ? `${route}?next=${encodeURIComponent(returnPath)}` : route;
}
