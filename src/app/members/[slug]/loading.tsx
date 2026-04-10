export default function MemberLoading() {
  return (
    <div className="mx-auto max-w-[996px] px-4 pt-16 pb-10">
      <div className="animate-pulse flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="size-[140px] sm:size-[180px] rounded-[24px] bg-gray-200" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="h-3 w-full max-w-[380px] rounded bg-gray-100" />
          <div className="h-3 w-full max-w-[380px] rounded bg-gray-100" />
          <div className="h-3 w-full max-w-[380px] rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
