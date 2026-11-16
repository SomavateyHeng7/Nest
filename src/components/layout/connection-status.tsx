"use client";

import { useEffect, useRef } from "react";

import { toast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";

/** Toasts when the browser goes offline (sticky) and when it reconnects. */
export function ConnectionStatus() {
  const { d } = useI18n();
  const offlineId = useRef<string | null>(null);
  const strings = useRef(d.toast);
  useEffect(() => {
    strings.current = d.toast;
  }, [d]);

  useEffect(() => {
    const goOffline = () => {
      offlineId.current = toast.warning(strings.current.offline, { description: strings.current.offlineBody, timeout: 0 });
    };
    const goOnline = () => {
      if (offlineId.current) toast.dismiss(offlineId.current);
      offlineId.current = null;
      toast.success(strings.current.online);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return null;
}
