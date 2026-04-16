import { AdminNav } from "./admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1200px] px-6 py-3">
          <AdminNav />
        </div>
      </div>
      {children}
    </div>
  );
}
