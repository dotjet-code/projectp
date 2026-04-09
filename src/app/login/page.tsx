import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold mb-1">Project P / 運営ログイン</h1>
        <p className="text-xs text-gray-500 mb-6">
          このページは Project P 運営専用です。
        </p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
