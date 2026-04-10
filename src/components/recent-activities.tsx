import {
  getRecentActivitiesByMemberName,
  relativeTime,
} from "@/lib/projectp/activity";

export async function RecentActivities({ memberName }: { memberName: string }) {
  const items = await getRecentActivitiesByMemberName(memberName, 8);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-trending to-[#00d5be]" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#007a55] tracking-tight">
          📋 最近の動き
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl bg-white/70 border border-white/80 px-5 py-3.5 shadow-sm"
          >
            <span className="w-16 shrink-0 font-[family-name:var(--font-outfit)] text-xs font-semibold text-muted">
              {relativeTime(it.occurredAt)}
            </span>
            <span className="text-sm font-medium text-foreground">
              {it.text}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted">
        ※ 日次スナップショットの差分から自動生成しています
      </p>
    </section>
  );
}
