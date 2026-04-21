export default function MemberLoading() {
  return (
    <div className="bg-[#F5F1E8] min-h-[60vh]">
      <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10">
        <div className="animate-pulse flex flex-col sm:flex-row items-start gap-6">
          <div className="w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] border-2 border-[#111] bg-[#111]/10" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-6 w-24 bg-[#111]/10" />
            <div className="h-10 w-64 bg-[#111]/15" />
            <div className="h-3 w-full max-w-[380px] bg-[#111]/10" />
            <div className="h-3 w-full max-w-[380px] bg-[#111]/10" />
            <div className="h-3 w-full max-w-[300px] bg-[#111]/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
