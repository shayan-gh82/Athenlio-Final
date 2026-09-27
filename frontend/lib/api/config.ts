export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
export const isApiConfigured = apiBaseUrl.length > 0;

// Real API data always takes precedence; demos never intercept a configured backend.
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && !isApiConfigured;
export const isCatalogAvailable = isApiConfigured || isDemoMode;
