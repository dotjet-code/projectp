import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pb-10 bg-[#F5F1E8] min-h-[60vh]">
        <section className="mx-auto max-w-[1100px] px-4 pt-16 pb-10">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 404 / RETURNED TO PIT
            </p>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          <h1
            className="text-[80px] md:text-[140px] font-black leading-[0.9] text-[#111] tabular-nums"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            404
          </h1>
          <p
            className="mt-2 text-xl md:text-2xl font-black text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            このページは <span className="text-[#D41E28]">Pit</span> に戻されました。
          </p>
          <p
            className="mt-2 text-sm text-[#4A5060] max-w-xl leading-relaxed"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            お探しのページは存在しないか、別の場所に移動した可能性があります。
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 bg-[#D41E28] text-white px-8 py-3 text-base font-black hover:translate-y-0.5 transition-transform"
              style={{
                fontFamily: "var(--font-noto-serif), serif",
                boxShadow: "5px 5px 0 rgba(17,17,17,0.22)",
              }}
            >
              <span>トップへ戻る</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              href="/ranking"
              className="text-sm font-black text-[#D41E28] underline"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              今のランキングを見る →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
