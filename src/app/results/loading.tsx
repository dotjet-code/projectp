export default function ResultsLoading() {
  return (
    <div className="mx-auto max-w-[964px] px-4 pt-16 pb-10">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-32 rounded-full bg-gray-200 mx-auto" />
        <div className="h-6 w-48 rounded bg-gray-200 mx-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
