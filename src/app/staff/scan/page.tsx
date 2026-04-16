import { Suspense } from "react";
import { StaffScanClient } from "./scan-client";

export const metadata = { title: "スタッフ消込" };

export default function StaffScanPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      }
    >
      <StaffScanClient />
    </Suspense>
  );
}
