import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FloatingLiveBadge } from "@/components/live-badge";
import { LiveNowIndicator } from "@/components/live-now-indicator";
import { MemberStageHistory } from "@/components/member-stage-history";
import { RecentActivities } from "@/components/recent-activities";
import { ShareButtons } from "@/components/share-buttons";
import { ShuyakuVoteButton } from "@/components/shuyaku-vote-button";
import { StageTrendChart } from "@/components/stage-trend-chart";
import { members } from "@/lib/data";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { getBoatColor } from "@/lib/projectp/boat-colors";
import { createAdminClient } from "@/lib/supabase/admin";

type MemberProfile = {
  bio: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
  sns_youtube: string | null;
  sns_tiktok: string | null;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = members.find((m) => m.slug === slug);
  if (!base) return {};
  return {
    title: base.name,
    description: `${base.name} の かけあがり プロフィール・ポイント・配信データ`,
  };
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-10 text-xs font-black text-[#9BA8BF]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {label}
      </span>
      <div className="flex-1 h-[5px] bg-[#4A5060] overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-16 text-right text-sm font-black text-[#F5F1E8] tabular-nums"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = members.find((m) => m.slug === slug);
  if (!base) notFound();

  // 実データを取得（順位・role・stats はすべて getRankedMembers から）
  const ranked = await getRankedMembers();
  const me = ranked.find((m) => m.slug === slug);
  if (!me) notFound();

  // DB からプロフィール情報を取得
  const supabase = createAdminClient();
  const { data: profileRow } = await supabase
    .from("members")
    .select("bio, sns_instagram, sns_x, sns_youtube, sns_tiktok")
    .eq("name", me.name)
    .maybeSingle();
  const profile = (profileRow as MemberProfile | null) ?? null;

  const { buzz, concurrent, revenue } = me.detail.stats;
  const shuyaku = me.detail.stats.shuyaku ?? 0;
  const totalPoints = buzz + concurrent + revenue + shuyaku;
  const isPlayer = me.role === "PLAYER";
  const maxStat = Math.max(buzz, concurrent, revenue, shuyaku, 1) * 1.2;

  const bc = getBoatColor(me.boatColor);
  const boatLabel = bc?.label;

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero (かけあがり スタイル: 黒ベタ + 被写体左、情報右) */}
        <section className="relative bg-[#111] text-[#F5F1E8] overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-14">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Portrait */}
              <div className="relative shrink-0">
                <div className="relative w-[160px] h-[160px] md:w-[240px] md:h-[240px] border-2 border-[#F5F1E8]">
                  <Image
                    src={base.avatarUrl}
                    alt={base.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: "50% 18%" }}
                  />
                  <FloatingLiveBadge slug={base.slug} />
                </div>
                {boatLabel && (
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black tracking-[0.2em] px-2 py-1 border border-[#F5F1E8]"
                    style={{
                      backgroundColor: bc?.main,
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {boatLabel}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-block text-[10px] font-black tracking-[0.25em] px-2 py-1 ${
                      isPlayer
                        ? "bg-[#D41E28] text-white"
                        : "bg-[#4A5060] text-white"
                    }`}
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {me.role}
                  </span>
                  <span
                    className="text-xs font-black tracking-[0.25em] text-[#FFE600]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    RANK #{me.rank}
                  </span>
                </div>

                <h1
                  className="text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {base.name}
                  <span className="text-[#D41E28]">。</span>
                </h1>

                <div className="mt-4">
                  {me.hasLiveData ? (
                    <span
                      className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#0F8F4A]"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      <span className="size-1.5 rounded-full bg-[#0F8F4A] animate-pulse" />
                      LIVE DATA ACTIVE
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#9BA8BF]"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      集計準備中
                    </span>
                  )}
                  <div className="mt-2">
                    <LiveNowIndicator slug={base.slug} />
                  </div>
                </div>

                {/* Stat bars */}
                <div className="mt-6 flex flex-col gap-2 max-w-[480px]">
                  <StatBar label="バズ" value={buzz} max={maxStat} color="#00BCFF" />
                  <StatBar label="配信" value={concurrent} max={maxStat} color="#1447E6" />
                  <StatBar label="収支" value={revenue} max={maxStat} color="#7A3DFF" />
                  <StatBar label="投票" value={shuyaku} max={maxStat} color="#D41E28" />
                </div>

                {/* Total */}
                <div className="mt-6 flex items-baseline gap-3 border-t border-[#4A5060] pt-4">
                  <span
                    className="text-xs font-black tracking-[0.3em] text-[#9BA8BF]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    TOTAL
                  </span>
                  <span
                    className="text-4xl md:text-5xl font-black tabular-nums text-[#F5F1E8]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {totalPoints.toLocaleString()}
                  </span>
                  <span
                    className="text-sm font-bold text-[#9BA8BF]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    pt
                  </span>
                </div>

                {/* 主役指名ボタン */}
                {me.supabaseId && (
                  <div className="mt-6">
                    <ShuyakuVoteButton
                      memberId={me.supabaseId}
                      memberName={me.name}
                      size="md"
                      showRule={true}
                    />
                  </div>
                )}

                {me.specialPoints > 0 && (
                  <div className="mt-4 inline-flex items-center gap-3 bg-[#D41E28] text-white px-3 py-2">
                    <span
                      className="text-[10px] font-black tracking-[0.3em]"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      SPECIAL
                    </span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      ライブデー限定
                    </span>
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      +{me.specialPoints.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 自己紹介 */}
        {profile?.bio && (
          <section className="mx-auto max-w-[964px] px-4 mt-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
              <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
                ✍️ 自己紹介
              </h2>
            </div>
            <div className="rounded-2xl bg-white/70 border border-white/80 px-6 py-5 shadow-sm">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </section>
        )}

        {/* Stage 推移 */}
        <StageTrendChart memberName={base.name} />

        {/* 過去 Stage の成績 */}
        <MemberStageHistory memberName={base.name} />

        {/* 最近の動き（自動生成） */}
        <RecentActivities memberName={base.name} />

        {/* SNS */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              📱 SNS / チャンネル
            </h2>
          </div>

          {/* YouTube card */}
          {(() => {
            const ytUrl = profile?.sns_youtube;
            const Tag = ytUrl ? "a" : "div";
            return (
              <Tag
                {...(ytUrl ? { href: ytUrl, target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block rounded-2xl bg-gradient-to-r from-[#dc2626] to-[#ef4444] p-5 shadow-sm mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
                      <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white/70 tracking-wider font-[family-name:var(--font-outfit)]">
                        YouTube チャンネル
                      </p>
                      <p className="text-sm font-bold text-white">
                        {base.name} 公式チャンネル
                      </p>
                      <p className="text-[11px] text-white/60">
                        配信・動画をチェック
                      </p>
                    </div>
                  </div>
                  <svg className="size-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Tag>
            );
          })()}

          {/* Social links */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "X", url: profile?.sns_x, desc: "つぶやきをチェック", svg: <svg className="size-7 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
              { label: "Instagram", url: profile?.sns_instagram, desc: "写真をチェック", svg: <svg className="size-7 text-[#e1306c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg> },
              { label: "TikTok", url: profile?.sns_tiktok, desc: "ショート動画", svg: <svg className="size-7 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.98a8.18 8.18 0 004.76 1.52V7.08a4.83 4.83 0 01-1-.39z" /></svg> },
            ].map((s) => {
              const hasUrl = s.url && s.url.startsWith("http");
              const Tag = hasUrl ? "a" : "div";
              return (
                <Tag
                  key={s.label}
                  {...(hasUrl ? { href: s.url!, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 border border-white/80 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {s.svg}
                  <span className="text-xs font-bold text-foreground">{s.label}</span>
                  <span className="text-[10px] text-muted">{s.desc}</span>
                </Tag>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[964px] px-4 mt-10 text-center">
          <Link
            href="/live/vote"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(255,100,103,0.3)] transition hover:shadow-[0_10px_20px_rgba(255,100,103,0.4)]"
          >
            💖 応援する →
          </Link>
        </section>

        {/* Share */}
        <section className="mx-auto max-w-[964px] px-4 mt-8">
          <p className="text-center text-[10px] font-bold text-muted tracking-wider mb-3">
            SHARE
          </p>
          <ShareButtons
            text={`#かけあがり ${base.name} を応援中！`}
            path={`/members/${base.slug}`}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
