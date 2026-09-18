"use client";

import { useSyncExternalStore } from "react";

const urlChangeEvent = "athenlio:url-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(urlChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(urlChangeEvent, onStoreChange);
  };
}

function getSnapshot() {
  return window.location.search;
}

export function useLocationSearch() {
  return useSyncExternalStore<string | null>(subscribe, getSnapshot, () => null);
}

export function replaceLocationSearch(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  window.history.replaceState(window.history.state, "", query ? `${pathname}?${query}` : pathname);
  window.dispatchEvent(new Event(urlChangeEvent));
}
