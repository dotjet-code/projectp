export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted">読み込み中...</p>
      </div>
    </div>
  );
}
