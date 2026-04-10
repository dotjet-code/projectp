"use client";

import { useOshi } from "@/lib/projectp/oshi-context";
import { BOAT_COLORS, type BoatColorNumber } from "@/lib/projectp/boat-colors";

const colors = Object.values(BOAT_COLORS);

export function OshiColorPicker() {
  const { oshiColor, setOshi } = useOshi();

  return (
    <div className="flex items-center gap-1.5">
      {colors.map((c) => {
        const active = oshiColor === c.number;
        return (
          <button
            key={c.number}
            type="button"
            onClick={() =>
              setOshi(active ? null : (c.number as BoatColorNumber))
            }
            title={`${c.label} ${c.name}${active ? "（解除）" : ""}`}
            className={`size-6 rounded-full border-2 transition-transform ${
              active
                ? "scale-125 border-foreground shadow-md"
                : "border-transparent hover:scale-110"
            }`}
            style={{ background: c.number === 1 ? "#E5E7EB" : c.main }}
          />
        );
      })}
      {oshiColor && (
        <button
          type="button"
          onClick={() => setOshi(null)}
          className="ml-1 text-[10px] text-muted hover:text-foreground"
        >
          ✕
        </button>
      )}
    </div>
  );
}
