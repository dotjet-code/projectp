import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { FloatingLiveBadge } from "@/components/live-badge";
import {
  getRankedMembers,
  type RankedMember,
} from "@/lib/projectp/live-stats";
import { BOAT_PLATES, type BoatColorNumber } from "@/lib/projectp/boat-colors";

export const dynamic = "force-dynamic";

function MemberCard({ member, rank }: { member: RankedMember; rank: number }) {
  const plate = rank <= 6 ? BOAT_PLATES[rank as BoatColorNumber] : null;

  return (
    <Link
      href={`/members/${member.slug}`}
      className="group flex flex-col border border-[#111] bg-[#F5F1E8] hover:bg-white transition-colors"
    >
      {/* 順位 + 号艇/PIT */}
      <div className="flex items-stretch border-b border-[#111]">
        <div
          className="flex items-center justify-center w-14 text-3xl font-black tabular-nums bg-[#111] text-[#F5F1E8]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {rank}
        </div>
        {plate ? (
          <div
            className="flex-1 border-l border-[#111]"
            style={{ backgroundColor: plate.bg, borderColor: plate.border }}
            aria-label={`${rank}号艇`}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#4A5060] text-white text-xs font-black tracking-[0.2em] border-l border-[#111]" style={{ fontFamily: "var(--font-outfit)" }}>
            PIT
          </div>
        )}
      </div>

      {/* 写真 (透過 PNG の背面に haikei.jpeg を敷く) */}
      <div
        className="relative aspect-square border-b border-[#111] overflow-hidden"
        style={{
          backgroundImage: "url(/members/haikei.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Image
          src={member.avatarUrl}
          alt={member.name}
          fill
          className="object-cover md:grayscale md:contrast-125 md:group-hover:grayscale-0 transition-[filter]"
          style={{ objectPosition: "50% 18%" }}
          sizes="(max-width: 768px) 50vw, 280px"
        />
        <FloatingLiveBadge slug={member.slug} />
      </div>

      {/* 氏名 + ポイント */}
      <div className="px-3 py-3">
        <p
          className="text-base md:text-lg font-black text-[#111] truncate"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {member.name}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <span
            className={`text-[10px] font-black tracking-[0.2em] px-1.5 py-0.5 ${
              member.role === "PLAYER"
                ? "bg-[#D41E28] text-white"
                : "bg-[#4A5060] text-white"
            }`}
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {member.role}
          </span>
          <div className="text-right">
            <span
              className="text-2xl font-black tabular-nums leading-none text-[#111]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {member.effectivePoints.toLocaleString()}
            </span>
            <span
              className="ml-1 text-[10px] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              pt
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function MembersPage() {
  const members = await getRankedMembers();

  return (
    <>
      <Header />
      <main className="pb-20">
        {/* Hero */}
        <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-16 md:py-20 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto">
            <p
              className="text-xs md:text-sm font-black tracking-[0.35em] text-[#FFE600]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              RUNNERS
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              ランナーの<span className="text-[#D41E28]">現在地。</span>
            </h1>
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">主役は、毎月入れ替わる。</span>
                <br />
                上位 6 が PLAYER、下位 6 が PIT。
                <br />
                ──今夜、君の推しはどこで戦っている？
              </p>
              <div
                className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
                style={{
                  clipPath:
                    "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
                }}
                aria-hidden
              />
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-[1200px] mx-auto px-4 mt-16">
          <SectionHeading
            title="全メンバー"
            eyebrow="CURRENT STANDINGS"
            accent="red"
            aside={<span>順位順</span>}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {members.map((member, i) => (
              <MemberCard key={member.id} member={member} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <section className="max-w-[1200px] mx-auto px-4 mt-16">
          <div className="bg-[#D41E28] text-white px-6 py-5">
            <p
              className="text-center text-base md:text-lg font-black"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              月間 4 指標（バズ・配信・収支・投票）と月末特番の結果で、毎月 PLAYER / PIT が再編成される。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
