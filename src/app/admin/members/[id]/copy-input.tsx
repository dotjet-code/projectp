"use client";

export function CopyInput({ value }: { value: string }) {
  return (
    <input
      type="text"
      readOnly
      value={value}
      className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-mono"
      onFocus={(e) => e.currentTarget.select()}
    />
  );
}
