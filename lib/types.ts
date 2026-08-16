export type DeviceClass = "mobile" | "tablet" | "desktop";

export type Script = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export type Settings = {
  /** 분당 글자 수 — 실제 발화 속도 기준 */
  cpm: number;
  /** 기기별로 따로 기억한다. 폰에서 좋은 크기가 웹에서는 너무 작다. */
  fontSize: Record<DeviceClass, number>;
  lineHeight: number;
  /** 빔스플리터 리그용 좌우 반전 */
  mirror: boolean;
  /** 읽는 줄의 화면상 세로 위치 (0~1) */
  eyeLine: number;
};

export const DEFAULT_SETTINGS: Settings = {
  cpm: 330,
  fontSize: { mobile: 44, tablet: 62, desktop: 64 },
  lineHeight: 1.55,
  mirror: false,
  eyeLine: 0.34,
};

export const CPM_MIN = 150;
export const CPM_MAX = 600;
export const FONT_MIN = 24;
export const FONT_MAX = 160;

/** 프롬터 본문 폭 — 한 줄이 너무 길면 시선이 되돌아오는 거리가 멀어진다 */
export const TEXT_LAYOUT: Record<
  DeviceClass,
  { maxWidth: number; padX: string }
> = {
  mobile: { maxWidth: 980, padX: "6vw" },
  tablet: { maxWidth: 1200, padX: "6vw" },
  desktop: { maxWidth: 1500, padX: "5vw" },
};
