"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BoatColorNumber, BoatColorTheme } from "./boat-colors";
import { BOAT_COLORS } from "./boat-colors";

const OSHI_COOKIE = "pp_oshi";

type OshiContextValue = {
  /** 現在の推しカラー番号（null = 未設定） */
  oshiColor: BoatColorNumber | null;
  /** 推しカラーのテーマ（null = 未設定 or 無効） */
  theme: BoatColorTheme | null;
  /** 推しカラーを設定する */
  setOshi: (color: BoatColorNumber | null) => void;
};

const OshiContext = createContext<OshiContextValue>({
  oshiColor: null,
  theme: null,
  setOshi: () => {},
});

function readCookie(): BoatColorNumber | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${OSHI_COOKIE}=(\\d)`)
  );
  if (!match) return null;
  const n = Number(match[1]);
  return n >= 1 && n <= 6 ? (n as BoatColorNumber) : null;
}

function writeCookie(color: BoatColorNumber | null) {
  if (typeof document === "undefined") return;
  if (color === null) {
    document.cookie = `${OSHI_COOKIE}=; path=/; max-age=0`;
  } else {
    document.cookie = `${OSHI_COOKIE}=${color}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }
}

export function OshiProvider({ children }: { children: React.ReactNode }) {
  const [oshiColor, setOshiColor] = useState<BoatColorNumber | null>(null);

  useEffect(() => {
    setOshiColor(readCookie());
  }, []);

  const setOshi = useCallback((color: BoatColorNumber | null) => {
    setOshiColor(color);
    writeCookie(color);
  }, []);

  const theme = useMemo(
    () => (oshiColor ? BOAT_COLORS[oshiColor] : null),
    [oshiColor]
  );

  // CSS custom properties で全体に適用
  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
      root.style.setProperty("--oshi-main", theme.main);
      root.style.setProperty("--oshi-dark", theme.dark);
      root.style.setProperty("--oshi-bg", theme.bg);
      root.style.setProperty("--oshi-gradient-from", theme.gradientFrom);
      root.style.setProperty("--oshi-gradient-to", theme.gradientTo);
      root.classList.add("oshi-active");
      if (theme.lightText) {
        root.classList.add("oshi-light-text");
      } else {
        root.classList.remove("oshi-light-text");
      }
    } else {
      root.style.removeProperty("--oshi-main");
      root.style.removeProperty("--oshi-dark");
      root.style.removeProperty("--oshi-bg");
      root.style.removeProperty("--oshi-gradient-from");
      root.style.removeProperty("--oshi-gradient-to");
      root.classList.remove("oshi-active", "oshi-light-text");
    }
  }, [theme]);

  return (
    <OshiContext.Provider value={{ oshiColor, theme, setOshi }}>
      {children}
    </OshiContext.Provider>
  );
}

export function useOshi() {
  return useContext(OshiContext);
}
