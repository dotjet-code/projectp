export default function RankingLoading() {
  return (
    <div className="mx-auto max-w-[964px] px-4 pt-16 pb-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-full bg-gray-200 mx-auto" />
        <div className="h-4 w-64 rounded bg-gray-100 mx-auto" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
