"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type LiveMemberStatus = {
  memberId: string;
  memberName: string;
  slug: string | null;
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  concurrentViewers: number | null;
  startedAt: string | null;
  updatedAt: string;
};

type LiveStatusContextValue = {
  bySlug: Map<string, LiveMemberStatus>;
  byName: Map<string, LiveMemberStatus>;
  liveMembers: LiveMemberStatus[];
  lastFetchedAt: number | null;
};

const LiveStatusContext = createContext<LiveStatusContextValue>({
  bySlug: new Map(),
  byName: new Map(),
  liveMembers: [],
  lastFetchedAt: null,
});

export function LiveStatusProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LiveMemberStatus[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      try {
        const res = await fetch("/api/public/live-status", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { liveMembers: LiveMemberStatus[] };
        if (cancelled) return;
        setItems(json.liveMembers ?? []);
        setLastFetchedAt(Date.now());
      } catch {
        // silently ignore
      }
    }

    fetchOnce();
    const id = setInterval(fetchOnce, 30_000);

    // タブに戻った時に即更新
    function onVisibility() {
      if (document.visibilityState === "visible") fetchOnce();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const value = useMemo<LiveStatusContextValue>(() => {
    const bySlug = new Map<string, LiveMemberStatus>();
    const byName = new Map<string, LiveMemberStatus>();
    for (const it of items) {
      if (it.slug) bySlug.set(it.slug, it);
      byName.set(it.memberName, it);
    }
    return {
      bySlug,
      byName,
      liveMembers: items.filter((i) => i.isLive),
      lastFetchedAt,
    };
  }, [items, lastFetchedAt]);

  return (
    <LiveStatusContext.Provider value={value}>
      {children}
    </LiveStatusContext.Provider>
  );
}

export function useLiveStatusBySlug(slug: string): LiveMemberStatus | undefined {
  return useContext(LiveStatusContext).bySlug.get(slug);
}

export function useLiveStatusByName(name: string): LiveMemberStatus | undefined {
  return useContext(LiveStatusContext).byName.get(name);
}

export function useLiveMembers(): LiveMemberStatus[] {
  return useContext(LiveStatusContext).liveMembers;
}
