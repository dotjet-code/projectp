import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">設定</h1>
      <p className="text-sm text-gray-600 mb-8">
        運営アカウントの設定を変更します。
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">パスワード変更</h2>
        <ChangePasswordForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">管理画面 URL</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs space-y-2">
          <p>
            <span className="font-bold text-gray-700">ログイン:</span>{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/login</code>
          </p>
          <p>
            <span className="font-bold text-gray-700">ステージ管理:</span>{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/admin/stages</code>
          </p>
          <p>
            <span className="font-bold text-gray-700">メンバー管理:</span>{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/admin/connect</code>
          </p>
          <p>
            <span className="font-bold text-gray-700">ポイント状況:</span>{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/admin/stats</code>
          </p>
          <p>
            <span className="font-bold text-gray-700">設定:</span>{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/admin/settings</code>
          </p>
        </div>
      </section>
    </main>
  );
}
