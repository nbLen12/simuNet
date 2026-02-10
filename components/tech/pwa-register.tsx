"use client";

import { useEffect } from "react";

export function PwaRegister(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failures should not break the technician workflow.
    });
  }, []);

  return null;
}
