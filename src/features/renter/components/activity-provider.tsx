"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Viewing } from "@/features/viewings/types";

const STORAGE_KEY = "nest.activity";

interface ActivityState {
  saved: string[];
  viewings: Viewing[];
  /** Stay id → requested new move-out date (ISO). */
  extensions: Record<string, string>;
}

interface ActivityContextValue extends ActivityState {
  /** False until browser storage has been read; avoids flashing empty states. */
  ready: boolean;
  isSaved: (listingId: string) => boolean;
  toggleSaved: (listingId: string) => void;
  addViewing: (viewing: Omit<Viewing, "id" | "status">) => Viewing;
  cancelViewing: (id: string) => void;
  requestExtension: (stayId: string, moveOut: string) => void;
  cancelExtension: (stayId: string) => void;
}

const empty: ActivityState = { saved: [], viewings: [], extensions: {} };

const ActivityContext = createContext<ActivityContextValue | null>(null);

/**
 * The renter's own activity — saved homes, viewing requests, extension
 * requests. Prototype only: kept in localStorage until there's a backend.
 */
export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ActivityState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {
      // storage unavailable — activity just won't persist
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, ready]);

  const toggleSaved = useCallback((id: string) => {
    setState((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }));
  }, []);

  const addViewing = useCallback((v: Omit<Viewing, "id" | "status">) => {
    const viewing: Viewing = { ...v, id: `v-${Date.now()}`, status: "requested" };
    setState((s) => ({ ...s, viewings: [...s.viewings, viewing] }));
    return viewing;
  }, []);

  const cancelViewing = useCallback((id: string) => {
    setState((s) => ({ ...s, viewings: s.viewings.filter((v) => v.id !== id) }));
  }, []);

  const requestExtension = useCallback((stayId: string, moveOut: string) => {
    setState((s) => ({ ...s, extensions: { ...s.extensions, [stayId]: moveOut } }));
  }, []);

  const cancelExtension = useCallback((stayId: string) => {
    setState((s) => {
      const next = { ...s.extensions };
      delete next[stayId];
      return { ...s, extensions: next };
    });
  }, []);

  const value = useMemo<ActivityContextValue>(
    () => ({
      ...state,
      ready,
      isSaved: (id) => state.saved.includes(id),
      toggleSaved,
      addViewing,
      cancelViewing,
      requestExtension,
      cancelExtension,
    }),
    [state, ready, toggleSaved, addViewing, cancelViewing, requestExtension, cancelExtension]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
  return ctx;
}
