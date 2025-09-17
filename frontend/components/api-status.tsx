"use client";

import * as React from "react";

type ApiHealthState = "loading" | "ok" | "error";

const DEFAULT_POLL_MS = 5000;

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
}

export function ApiStatusDot({ pollMs = DEFAULT_POLL_MS }: { pollMs?: number }) {
  const [state, setState] = React.useState<ApiHealthState>("loading");
  const [httpCode, setHttpCode] = React.useState<number | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    let timer: number | undefined;
    let abortController: AbortController | null = null;

    async function check() {
      abortController?.abort();
      abortController = new AbortController();
      try {
        const res = await fetch(`${getApiBaseUrl()}/`, {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store",
          signal: abortController.signal,
        });
        if (!isMounted) return;
        setHttpCode(res.status);
        if (res.ok) {
          let data: any = null;
          try {
            data = await res.json();
          } catch (_) {}
          if (data && typeof data === "object" && data.status === "ok") {
            setState("ok");
          } else {
            setState("error");
          }
        } else {
          setState("error");
        }
      } catch (_err) {
        if (!isMounted) return;
        setHttpCode(null);
        setState("error");
      }
    }

    // initial
    void check();
    // poll
    timer = window.setInterval(() => {
      void check();
    }, Math.max(1000, pollMs));

    return () => {
      isMounted = false;
      if (timer) window.clearInterval(timer);
      abortController?.abort();
    };
  }, [pollMs]);

  const { colorClass, tooltip } = React.useMemo(() => {
    if (state === "loading") {
      return { colorClass: "bg-yellow-500", tooltip: "API:SEARCHING" };
    }
    if (state === "ok") {
      return { colorClass: "bg-emerald-500", tooltip: "API:OK" };
    }
    const codeText = httpCode == null ? "ERR" : String(httpCode);
    return { colorClass: "bg-red-500", tooltip: `API:${codeText}` };
  }, [state, httpCode]);

  return (
    <span className="inline-flex items-center" title={tooltip} aria-label={tooltip}>
      <span
        className={
          "ml-2 inline-block h-2 w-2 rounded-full ring-2 ring-background/80 transition-colors " +
          colorClass
        }
      />
    </span>
  );
}


