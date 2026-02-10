"use client";

import { useEffect, useState } from "react";

const LAST_SYNC_KEY = "simuNet.tech.lastSync";

export function SyncIndicator(): React.ReactElement {
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const value = window.localStorage.getItem(LAST_SYNC_KEY);
    setLastSync(value);
  }, []);

  return (
    <div className="pill" style={{ justifyContent: "center" }}>
      Last sync: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
    </div>
  );
}
