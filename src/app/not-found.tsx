import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pb-10">
        <section className="mx-auto max-w-[720px] px-4 pt-16 pb-10 text-center">
          <p className="text-6xl mb-4">🏁</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            404
          </h1>
          <p className="mt-3 text-base font-bold text-foreground">
            このページは Pit に戻されました
          </p>
          <p className="mt-2 text-sm text-muted">
            お探しのページは存在しないか、別の場所に移動した可能性があります。
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-8 py-3 text-sm font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] transition-all"
            >
              🏠 トップへ戻る
            </Link>
            <Link
              href="/ranking"
              className="text-xs text-muted underline hover:text-primary-dark"
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
