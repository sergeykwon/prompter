"use client";

import * as React from "react";
import type { DeviceClass } from "./types";

export const BP = {
  /** 이 값 미만 = 모바일 */
  tablet: 768,
  /** 이 값 이상 + 정밀 포인터 = 웹(데스크톱) */
  desktop: 1280,
};

export const DEVICE_LABEL: Record<DeviceClass, string> = {
  mobile: "모바일",
  tablet: "아이패드",
  desktop: "웹",
};

function detect(): DeviceClass {
  if (typeof window === "undefined") return "mobile";
  const w = window.innerWidth;
  if (w < BP.tablet) return "mobile";
  // 터치 기기는 화면이 넓어도 태블릿 레이아웃 — 아이패드 Pro 가로가 여기 해당
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  if (w >= BP.desktop && !coarse) return "desktop";
  return "tablet";
}

/** 화면 폭 + 포인터 정밀도로 레이아웃 종류를 정한다. 회전·리사이즈에 즉시 반응. */
export function useDevice(): DeviceClass {
  const [device, setDevice] = React.useState<DeviceClass>("mobile");

  React.useEffect(() => {
    const update = () => setDevice(detect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return device;
}
