import {
  getRecentActivitiesByMemberName,
  relativeTime,
} from "@/lib/projectp/activity";

export async function RecentActivities({ memberName }: { memberName: string }) {
  const items = await getRecentActivitiesByMemberName(memberName, 8);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1100px] px-4 mt-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="inline-block w-2 h-2 bg-[#D41E28]" />
        <p
          className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ 速報
        </p>
        <h2
          className="text-2xl md:text-3xl font-black text-[#111] leading-none"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          最近の動き
        </h2>
        <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
      </div>

      <ul
        className="border-t-[3px] border-b-[3px] border-[#111] divide-y divide-[#111]/15 bg-[#F5F1E8]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 px-4 py-2.5"
          >
            <span
              className="w-16 shrink-0 text-[10px] font-black tabular-nums tracking-wider text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {relativeTime(it.occurredAt)}
            </span>
            <span
              className="w-1.5 h-1.5 shrink-0 self-center bg-[#D41E28]"
              aria-hidden
            />
            <span
              className="text-sm font-bold text-[#111] leading-snug"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              {it.text}
            </span>
          </li>
        ))}
      </ul>
      <p
        className="mt-2 text-[10px] text-[#4A5060]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        ※ 日次スナップショットの差分から自動生成
      </p>
    </section>
  );
}
