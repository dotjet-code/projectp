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
    description: `${base.name} の Project P プロフィール・ポイント・配信データ`,
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
      <span className="w-10 text-xs font-bold text-muted">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-16 text-right font-[family-name:var(--font-outfit)] text-xs font-bold text-foreground">
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
  const totalPoints = buzz + concurrent + revenue;
  const isPlayer = me.role === "PLAYER";
  const maxStat = Math.max(buzz, concurrent, revenue, 1) * 1.2;

  // ボートカラーテーマ（未割り当ての場合はデフォルト水色）
  const bc = getBoatColor(me.boatColor);
  const heroGradientFrom = bc?.bg ?? "#e0f7fa";
  const heroGradientVia = bc
    ? bc.lightText
      ? `${bc.gradientFrom}40`
      : `${bc.bg}`
    : "#b2ebf2";
  const barColor1 = bc
    ? `linear-gradient(90deg, ${bc.gradientFrom}, ${bc.gradientTo})`
    : "linear-gradient(90deg, #00d3f3, #2b7fff)";
  const barColor2 = bc
    ? `linear-gradient(90deg, ${bc.main}CC, ${bc.gradientTo}CC)`
    : "linear-gradient(90deg, #00bcff, #2b7fff)";
  const accentText = bc?.dark ?? "#0092b8";
  const avatarRing = bc ? `3px solid ${bc.main}` : "3px solid transparent";

  return (
    <>
      <Header />
      <main className={`pb-10 ${bc?.lightText ? "text-white" : ""}`}>
        {/* Hero */}
        <section
          className="relative overflow-hidden pb-10 pt-8"
          style={{
            background: `linear-gradient(to bottom, ${heroGradientFrom}, ${heroGradientVia}, transparent)`,
          }}
        >
          <div className="mx-auto flex flex-col sm:flex-row max-w-[996px] items-center sm:items-start gap-6 sm:gap-10 px-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Image
                src={base.avatarUrl}
                alt={base.name}
                width={180}
                height={180}
                className="size-[140px] sm:size-[180px] rounded-[24px] object-cover object-top shadow-lg"
                style={{ border: avatarRing }}
              />
              <FloatingLiveBadge slug={base.slug} />
              {bc && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white shadow-md"
                  style={{ background: bc.main }}
                >
                  {bc.label}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 text-center sm:text-left">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                  isPlayer
                    ? "bg-gradient-to-r from-player to-player-end shadow-[0_1px_3px_#bedbff]"
                    : "bg-gradient-to-r from-pit to-pit-end shadow-[0_1px_3px_#fee685]"
                }`}
              >
                {me.role}
              </span>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">
                {base.name}
              </h1>

              <p
                className="mt-1 font-[family-name:var(--font-outfit)] text-xl font-extrabold"
                style={{ color: accentText }}
              >
                #{me.rank}
              </p>

              {me.hasLiveData ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wider font-[family-name:var(--font-outfit)]">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE DATA
                </p>
              ) : (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 tracking-wider font-[family-name:var(--font-outfit)]">
                  集計準備中
                </p>
              )}

              {/* 現在ライブ配信中なら赤バッジ + 視聴者数 + 視聴リンク */}
              <div className="mt-1">
                <LiveNowIndicator slug={base.slug} />
              </div>

              {/* Stat bars */}
              <div className="mt-4 flex flex-col gap-2 max-w-[380px] mx-auto sm:mx-0">
                <StatBar
                  label="バズ"
                  value={buzz}
                  max={maxStat}
                  color={barColor1}
                />
                <StatBar
                  label="配信"
                  value={concurrent}
                  max={maxStat}
                  color={barColor2}
                />
                <StatBar
                  label="収支"
                  value={revenue}
                  max={maxStat}
                  color="linear-gradient(90deg, #a684ff, #c27aff)"
                />
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-outfit)] text-xs font-semibold tracking-wider text-muted">
                  TOTAL
                </span>
                <span className="font-[family-name:var(--font-outfit)] text-2xl font-black italic text-foreground">
                  {totalPoints.toLocaleString()}
                </span>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-bold italic text-muted">
                  pts
                </span>
              </div>

              {/* Special points (LIVE DAY ONLY 別レイヤー) */}
              {me.specialPoints > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 px-3 py-1.5">
                  <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 text-[9px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
                    SPECIAL
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 tracking-wider font-[family-name:var(--font-outfit)]">
                    LIVE DAY ONLY
                  </span>
                  <span className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-purple-900">
                    +{me.specialPoints.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stage 推移 */}
        <StageTrendChart memberName={base.name} />

        {/* 過去 Stage の成績 */}
        <MemberStageHistory memberName={base.name} />

        {/* 最近の動き（自動生成） */}
        <RecentActivities memberName={base.name} />

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

        {/* SNS */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              📱 SNS / チャンネル
            </h2>
          </div>

          {/* Social links - DB に URL があればリンク化 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "YouTube",
                url: profile?.sns_youtube,
                icon: "▶️",
                desc: "配信・動画をチェック",
                bg: "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white",
              },
              {
                label: "X",
                url: profile?.sns_x,
                icon: "𝕏",
                desc: "つぶやきをチェック",
                bg: "bg-white/70 border border-white/80",
              },
              {
                label: "Instagram",
                url: profile?.sns_instagram,
                icon: "📸",
                desc: "写真をチェック",
                bg: "bg-white/70 border border-white/80",
              },
              {
                label: "TikTok",
                url: profile?.sns_tiktok,
                icon: "🎵",
                desc: "ショート動画",
                bg: "bg-white/70 border border-white/80",
              },
            ].map((s) => {
              const hasUrl = s.url && s.url.startsWith("http");
              const Wrapper = hasUrl ? "a" : "div";
              return (
                <Wrapper
                  key={s.label}
                  {...(hasUrl
                    ? {
                        href: s.url!,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                  className={`flex flex-col items-center gap-2 rounded-2xl py-5 shadow-sm transition-shadow ${s.bg} ${
                    hasUrl
                      ? "hover:shadow-md cursor-pointer"
                      : "opacity-50 cursor-default"
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-bold">{s.label}</span>
                  <span className="text-[10px] text-current opacity-60">
                    {hasUrl ? s.desc : "未設定"}
                  </span>
                </Wrapper>
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
            text={`#ProjectP ${base.name} を応援中！`}
            path={`/members/${base.slug}`}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
