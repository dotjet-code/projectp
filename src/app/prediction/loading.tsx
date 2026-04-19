export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
      <div className="text-center">
        <div className="inline-block w-10 h-10 animate-spin border-[3px] border-[#111] border-t-[#D41E28]" />
        <p
          className="mt-4 text-xs font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ LOADING
        </p>
      </div>
    </div>
  );
}
