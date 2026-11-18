"use client";

import { useMemo } from "react";

import { verificationQueue, type VerificationItem } from "@/features/admin/data";
import { createPersistedStore } from "@/shared/lib/persisted-store";

/** Bump the suffix when the sample data changes shape, so old browser copies don't linger. */
const useStore = createPersistedStore<{ items: VerificationItem[] }>("nest.verification.v1", { items: verificationQueue });

export type DocKey = "identity" | "ownership";

/**
 * The verification queue, shared between the admin console and the owner's own
 * page, so an owner's re-upload reaches staff as a document "to review".
 */
export function useVerification() {
  const [state, update] = useStore();

  return useMemo(() => {
    const patch = (id: string, fn: (i: VerificationItem) => VerificationItem) =>
      update((s) => ({ items: s.items.map((i) => (i.id === id ? fn(i) : i)) }));

    return {
      items: state.items,
      patch,
      forOwner: (name: string) => state.items.filter((i) => i.ownerName === name),
      /** Owner uploads a replacement. Only file details are kept; the file is not sent anywhere in this prototype. */
      reupload: (id: string, key: DocKey, file: { name: string; sizeKb: number }) =>
        patch(id, (i) => ({
          ...i,
          docs: { ...i.docs, [key]: "received" },
          files: {
            ...i.files,
            [key]: {
              name: file.name,
              sizeKb: file.sizeKb,
              kind: i.files?.[key]?.kind ?? (key === "identity" ? "national-id" : "title-deed"),
              uploadedAt: new Date().toISOString(),
            },
          },
        })),
    };
  }, [state, update]);
}
