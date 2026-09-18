"use client";

import { useSyncExternalStore } from "react";

const storageKey = "athenlio:course-cart:v1";
const changeEvent = "athenlio:cart-change";
let snapshot: number[] = [];
let initialized = false;
const serverSnapshot: number[] = [];

function readStoredCart(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (typeof window !== "undefined" && !initialized) {
    snapshot = readStoredCart();
    initialized = true;
  }
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function subscribe(callback: () => void) {
  const refresh = () => {
    snapshot = readStoredCart();
    initialized = true;
    callback();
  };
  window.addEventListener(changeEvent, refresh);
  window.addEventListener("storage", refresh);
  return () => {
    window.removeEventListener(changeEvent, refresh);
    window.removeEventListener("storage", refresh);
  };
}

function writeCart(ids: number[]) {
  if (typeof window === "undefined") return;
  snapshot = ids;
  initialized = true;
  window.localStorage.setItem(storageKey, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(changeEvent));
}

export function addCourseToCart(courseId: number) {
  const ids = readStoredCart();
  if (!ids.includes(courseId)) writeCart([...ids, courseId]);
}

export function removeCourseFromCart(courseId: number) {
  writeCart(readStoredCart().filter((id) => id !== courseId));
}

export function clearCourseCart() {
  writeCart([]);
}

export function useCourseCart() {
  const courseIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    courseIds,
    count: courseIds.length,
    isReady: true,
    includes: (courseId: number) => courseIds.includes(courseId),
    add: addCourseToCart,
    remove: removeCourseFromCart,
    clear: clearCourseCart,
  };
}
