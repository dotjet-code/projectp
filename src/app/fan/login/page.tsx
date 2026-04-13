import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FanLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ファン会員ログイン",
  description:
    "メールアドレスで Project P のファン会員にログイン。順位予想の景品対象になります。",
};

export default function FanLoginPage() {
  return (
    <>
      <Header />
      <main className="pb-16">
        <section className="pt-12 pb-6 text-center">
          <p className="text-4xl mb-2">🎟️</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            ファン会員ログイン
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            メールアドレスを入力するとログインリンクを送ります。
            <br />
            会員になると順位予想の景品対象になります。
          </p>
        </section>

        <section className="mx-auto max-w-[420px] px-4">
          <div className="rounded-2xl bg-white/80 border border-white/80 p-6 shadow-sm">
            <FanLoginForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
