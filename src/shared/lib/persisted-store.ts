"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny shared store kept in localStorage, so different screens (the renter's
 * page, the owner's page, the admin console) see the same data in one browser,
 * and other tabs follow along through the `storage` event. Prototype only: a
 * real build replaces this with server data.
 *
 * `initial` is what the server renders and what is used while storage is
 * empty or unavailable, so hydration always matches.
 */
export function createPersistedStore<T>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cached: T = initial;

  // useSyncExternalStore needs the same object back until the data changes.
  function read(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      // storage blocked: keep whatever is in memory
    }
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      cached = initial;
    }
    return cached;
  }

  function write(next: T) {
    cached = next;
    try {
      const raw = JSON.stringify(next);
      window.localStorage.setItem(key, raw);
      cachedRaw = raw;
    } catch {
      // keep the in-memory copy; it just won't survive a reload
    }
    listeners.forEach((l) => l());
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) callback();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("storage", onStorage);
    };
  }

  /** `[state, update]`, where `update` takes a function from the old state to the new one. */
  return function useStore() {
    const state = useSyncExternalStore(subscribe, read, () => initial);
    const update = useCallback((fn: (state: T) => T) => write(fn(read())), []);
    return [state, update] as const;
  };
}
